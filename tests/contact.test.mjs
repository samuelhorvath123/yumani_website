import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_FIELDS,
  MAIL_ENDPOINT,
  MIN_FILL_MS,
  STEP_FIELDS,
  checkEnquiry,
  composeMessage,
  emptyDraft,
  looksAutomated,
  normalizeDraft,
  sendEnquiry,
  validateFields,
} from '../lib/contact.ts';

const good = {
  services: ['Web application', 'Practical AI'],
  challenge: 'Every Monday we copy orders from email into the spreadsheet by hand.',
  timeline: 'In the next few months',
  name: 'Jana Nováková',
  email: 'jana@example.sk',
  organisation: 'Mestská nemocnica',
};

test('a complete answer passes and comes back unchanged', () => {
  const result = checkEnquiry(good);
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, good);
});

test('the organisation is the only optional answer', () => {
  assert.equal(checkEnquiry({ ...good, organisation: '' }).ok, true);
  for (const field of ['services', 'challenge', 'timeline', 'name', 'email']) {
    const result = checkEnquiry({ ...good, [field]: emptyDraft[field] });
    assert.equal(result.ok, false, field);
    assert.ok(result.errors[field], field);
  }
});

test('emails must look like emails', () => {
  for (const email of ['jana', 'jana@', '@example.sk', 'jana@example', 'ja na@example.sk', 'a@b@c.sk']) {
    assert.ok(checkEnquiry({ ...good, email }).errors?.email, email);
  }
  assert.equal(checkEnquiry({ ...good, email: 'info+survey@mail.example.sk' }).ok, true);
});

test('answers outside the offered choices are dropped, not trusted', () => {
  const result = checkEnquiry({ ...good, services: ['Web application', 'Free crypto', 42], timeline: 'Yesterday' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.timeline);
  assert.deepEqual(normalizeDraft({ services: ['Free crypto', 'Web application', 'Web application'] }).services, ['Web application']);
});

test('lengths are held so an enquiry cannot be used to push a wall of text', () => {
  assert.ok(checkEnquiry({ ...good, challenge: 'too short' }).errors.challenge);
  assert.ok(checkEnquiry({ ...good, challenge: 'x'.repeat(3001) }).errors.challenge);
  assert.equal(checkEnquiry({ ...good, challenge: 'x'.repeat(3000) }).ok, true);
  assert.ok(checkEnquiry({ ...good, name: 'n'.repeat(121) }).errors.name);
  assert.ok(checkEnquiry({ ...good, organisation: 'o'.repeat(161) }).errors.organisation);
});

test('anything that is not a string is treated as missing', () => {
  const result = checkEnquiry({ ...good, name: { first: 'Jana' }, email: ['jana@example.sk'], challenge: 7 });
  assert.equal(result.ok, false);
  assert.ok(result.errors.name && result.errors.email && result.errors.challenge);
  assert.equal(checkEnquiry(null).ok, false);
  assert.equal(checkEnquiry('hello').ok, false);
});

test('control characters and line breaks cannot reach a name or an email', () => {
  const value = normalizeDraft({ ...good, name: 'Jana\r\nBcc: spam@example.com', organisation: 'A\tB\u0000C' });
  assert.equal(value.name, 'Jana Bcc: spam@example.com');
  assert.equal(value.organisation, 'A BC');
  // The challenge is the one place paragraphs are allowed.
  assert.equal(normalizeDraft({ challenge: 'one\r\n\r\ntwo' }).challenge, 'one\n\ntwo');
});

test('each step checks only its own questions', () => {
  assert.deepEqual(STEP_FIELDS.flat(), [...ALL_FIELDS]);
  const errors = validateFields(emptyDraft, STEP_FIELDS[0]);
  assert.deepEqual(Object.keys(errors), ['services']);
  assert.deepEqual(Object.keys(validateFields(emptyDraft, STEP_FIELDS[3])).sort(), ['email', 'name']);
  assert.deepEqual(validateFields({ ...emptyDraft, ...good }, STEP_FIELDS[3]), {});
});

const NOW = 1_800_000_000_000;

test('a filled trap, a missing start time, or a rushed form looks automated', () => {
  assert.equal(looksAutomated('', NOW - MIN_FILL_MS - 1, NOW), false);
  assert.equal(looksAutomated(undefined, NOW - 60_000, NOW), false);
  assert.equal(looksAutomated('http://spam.example', NOW - 60_000, NOW), true);
  assert.equal(looksAutomated('', NOW - MIN_FILL_MS + 1, NOW), true);
  assert.equal(looksAutomated('', undefined, NOW), true);
  assert.equal(looksAutomated('', 'yesterday', NOW), true);
  assert.equal(looksAutomated('', NaN, NOW), true);
});

test('the message carries every answer and a one-line subject', () => {
  const { subject, text } = composeMessage(checkEnquiry(good).value);
  assert.equal(subject, 'New enquiry from Jana Nováková, Mestská nemocnica');
  for (const part of [good.name, good.email, good.organisation, 'Web application, Practical AI', good.timeline, good.challenge]) {
    assert.ok(text.includes(part), part);
  }
  assert.equal(composeMessage({ ...checkEnquiry(good).value, organisation: '' }).subject, 'New enquiry from Jana Nováková');
  assert.ok(composeMessage({ ...checkEnquiry(good).value, organisation: '' }).text.includes('(not given)'));
  assert.ok(!subject.includes('\n'));
});

test('sending hands the email service one request, replying to the visitor', async () => {
  const calls = [];
  const send = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, status: 200 };
  };
  const result = await sendEnquiry(
    checkEnquiry(good).value,
    { apiKey: 'key_123', from: 'Yumani <website@yumaniautomation.com>', to: 'info@yumaniautomation.com' },
    send,
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, MAIL_ENDPOINT);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.authorization, 'Bearer key_123');
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.to, ['info@yumaniautomation.com']);
  assert.equal(body.from, 'Yumani <website@yumaniautomation.com>');
  assert.equal(body.reply_to, 'jana@example.sk');
  assert.match(body.text, /Every Monday/);
});

test('a refusal from the email service is reported, with its status and nothing else', async () => {
  const send = async () => ({ ok: false, status: 403 });
  const result = await sendEnquiry(checkEnquiry(good).value, { apiKey: 'k', from: 'a@b.sk', to: 'c@d.sk' }, send);
  assert.deepEqual(result, { ok: false, status: 403 });
});
