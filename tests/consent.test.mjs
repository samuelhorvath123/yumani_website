import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_VERSION,
  createConsentStore,
  parseConsent,
  serializeConsent,
} from '../lib/consent.ts';

const NOW = Date.UTC(2026, 9, 5, 12, 0, 0);
const seconds = Math.floor(NOW / 1000);

// What document.cookie would hand back after the browser stored the cookie.
const stored = (record, secure = true) =>
  serializeConsent(record, secure).split(';')[0];
const record = (analytics, savedAt = seconds) => ({ version: CONSENT_VERSION, analytics, savedAt });

test('a saved choice reads back exactly as it was written', () => {
  for (const analytics of [true, false]) {
    assert.deepEqual(parseConsent(stored(record(analytics)), NOW), record(analytics));
  }
});

test('the cookie is first-party, site-wide, expires and only claims Secure over HTTPS', () => {
  const https = serializeConsent(record(false), true);
  assert.match(https, new RegExp(`^${CONSENT_COOKIE}=`));
  assert.match(https, new RegExp(`Max-Age=${CONSENT_MAX_AGE_SECONDS}`));
  assert.match(https, /Path=\//);
  assert.match(https, /SameSite=Lax/);
  assert.match(https, /; Secure$/);
  assert.doesNotMatch(serializeConsent(record(false), false), /Secure/);
  assert.doesNotMatch(https, /Domain=/);
});

test('the cookie is found among other cookies and nothing else is mistaken for it', () => {
  const mine = stored(record(true));
  assert.deepEqual(parseConsent(`theme=dark; ${mine}; other=1`, NOW), record(true));
  assert.equal(parseConsent('theme=dark; other=1', NOW), null);
  assert.equal(parseConsent(`not_${mine}`, NOW), null);
  assert.equal(parseConsent('', NOW), null);
});

test('anything that does not look like our choice means ask again', () => {
  const bad = [
    `${CONSENT_COOKIE}=`,
    `${CONSENT_COOKIE}=%7Bnot-json`,
    `${CONSENT_COOKIE}=${encodeURIComponent('null')}`,
    `${CONSENT_COOKIE}=${encodeURIComponent('"yes"')}`,
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, analytics: 'yes', at: seconds }))}`,
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, analytics: true }))}`,
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, analytics: true, at: 'now' }))}`,
  ];
  for (const cookie of bad) assert.equal(parseConsent(cookie, NOW), null, cookie);
});

test('a choice from an older notice is ignored', () => {
  const old = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION - 1, analytics: true, at: seconds }))}`;
  assert.equal(parseConsent(old, NOW), null);
});

test('a choice expires after its lifetime even if the browser kept the cookie', () => {
  const edge = seconds - CONSENT_MAX_AGE_SECONDS;
  assert.notEqual(parseConsent(stored(record(true, edge)), NOW), null);
  assert.equal(parseConsent(stored(record(true, edge - 1)), NOW), null);
});

test('a choice dated in the future is not trusted', () => {
  assert.equal(parseConsent(stored(record(true, seconds + 60)), NOW), null);
});

function setup(initialCookies = '') {
  let cookies = initialCookies;
  let now = NOW;
  const written = [];
  const store = createConsentStore({
    readCookies: () => cookies,
    writeCookie: (cookie) => {
      written.push(cookie);
      cookies = cookie.split(';')[0];
    },
    now: () => now,
    secure: () => true,
  });
  let notified = 0;
  store.subscribe(() => notified++);
  return { store, written, get notified() { return notified; }, tick(ms) { now += ms; } };
}

test('with no stored choice the visitor is asked, and nothing is written yet', () => {
  const { store, written } = setup();
  assert.deepEqual(store.getSnapshot(), { ready: true, record: null, editing: false });
  assert.equal(written.length, 0);
});

test('a stored choice is picked up without asking again', () => {
  const { store } = setup(stored(record(true)));
  const state = store.getSnapshot();
  assert.equal(state.record?.analytics, true);
  assert.equal(state.editing, false);
});

test('the snapshot stays the same object until something changes', () => {
  const { store } = setup();
  assert.equal(store.getSnapshot(), store.getSnapshot());
});

test('saving writes the cookie once, notifies, and closes the banner', () => {
  const ctx = setup();
  const saved = ctx.store.save({ analytics: false });
  assert.equal(ctx.written.length, 1);
  assert.deepEqual(saved, record(false));
  assert.equal(ctx.notified, 1);
  assert.deepEqual(ctx.store.getSnapshot(), { ready: true, record: saved, editing: false });
});

test('reopening keeps the earlier choice and lets the visitor change it', () => {
  const ctx = setup(stored(record(false)));
  ctx.store.reopen();
  assert.equal(ctx.store.getSnapshot().editing, true);
  assert.equal(ctx.store.getSnapshot().record?.analytics, false);
  ctx.tick(60_000);
  ctx.store.save({ analytics: true });
  const state = ctx.store.getSnapshot();
  assert.equal(state.editing, false);
  assert.equal(state.record?.analytics, true);
  assert.equal(state.record?.savedAt, seconds + 60);
});

test('dismissing a reopened banner changes nothing and writes nothing', () => {
  const ctx = setup(stored(record(true)));
  ctx.store.reopen();
  ctx.store.dismiss();
  assert.equal(ctx.store.getSnapshot().editing, false);
  assert.equal(ctx.store.getSnapshot().record?.analytics, true);
  assert.equal(ctx.written.length, 0);
});

test('a first-time banner cannot be dismissed: no choice is not a choice', () => {
  const ctx = setup();
  const before = ctx.store.getSnapshot();
  ctx.store.dismiss();
  assert.equal(ctx.store.getSnapshot(), before);
  assert.equal(ctx.store.getSnapshot().record, null);
});

test('a listener that unsubscribes is not told about later changes', () => {
  const { store } = setup();
  let heard = 0;
  const stop = store.subscribe(() => heard++);
  store.save({ analytics: false });
  stop();
  store.save({ analytics: true });
  assert.equal(heard, 1);
});
