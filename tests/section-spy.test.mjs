import test from 'node:test';
import assert from 'node:assert/strict';
import { createSectionSpy, resolveActiveSection } from '../lib/section-spy.ts';

// The line reads 360px down a 900px window, so a section is current from the
// moment its top passes that line until the next section's top does.
const page = [
  { id: 'services', top: 0, bottom: 748 },
  { id: 'about', top: 748, bottom: 1281 },
  { id: 'approach', top: 1281, bottom: 1886 },
];

test('the reading line marks whichever section it falls inside', () => {
  assert.equal(resolveActiveSection(page, 0), 'services');
  assert.equal(resolveActiveSection(page, 360), 'services');
  assert.equal(resolveActiveSection(page, 747.9), 'services');
  assert.equal(resolveActiveSection(page, 748), 'about');
  assert.equal(resolveActiveSection(page, 1280.9), 'about');
  assert.equal(resolveActiveSection(page, 1281), 'approach');
  assert.equal(resolveActiveSection(page, 1885.9), 'approach');
});

test('the hero, the closing screen and the footer belong to no section', () => {
  assert.equal(resolveActiveSection(page, -1), null);
  assert.equal(resolveActiveSection(page, -400), null);
  assert.equal(resolveActiveSection(page, 1886), null);
  assert.equal(resolveActiveSection(page, 4000), null);
});

test('an empty page never claims a section', () => {
  assert.equal(resolveActiveSection([], 360), null);
});

function setup() {
  let line = 0;
  let sections = [...page];
  let nextId = 0;
  const frames = new Map();
  const seen = [];
  const spy = createSectionSpy({
    sections: () => sections,
    line: () => line,
    active: (id) => seen.push(id),
    frame: (callback) => {
      const id = ++nextId;
      frames.set(id, callback);
      return id;
    },
    cancelFrame: (id) => frames.delete(id),
  });
  return {
    spy,
    seen,
    get queued() { return frames.size; },
    moveLine(position) { line = position; },
    setSections(next) { sections = next; },
    paint() {
      for (const [id, callback] of frames) {
        frames.delete(id);
        callback(0);
      }
    },
  };
}

test('measuring reports the current section straight away', () => {
  const ctx = setup();
  ctx.moveLine(360);
  ctx.spy.measure();
  assert.deepEqual(ctx.seen, ['services']);
});

test('many scroll events in a frame cost one measurement', () => {
  const ctx = setup();
  ctx.moveLine(900);
  for (let i = 0; i < 50; i++) ctx.spy.onScroll();
  assert.equal(ctx.queued, 1);
  assert.deepEqual(ctx.seen, [], 'nothing is read until the frame');
  ctx.paint();
  assert.deepEqual(ctx.seen, ['about']);
});

test('the marker is only told about changes, never repeats', () => {
  const ctx = setup();
  ctx.moveLine(100);
  ctx.spy.measure();
  ctx.moveLine(200);
  ctx.spy.onScroll();
  ctx.paint();
  ctx.moveLine(1300);
  ctx.spy.onScroll();
  ctx.paint();
  assert.deepEqual(ctx.seen, ['services', 'approach']);
});

test('leaving every section clears the marker', () => {
  const ctx = setup();
  ctx.moveLine(900);
  ctx.spy.measure();
  ctx.moveLine(3000);
  ctx.spy.onScroll();
  ctx.paint();
  assert.deepEqual(ctx.seen, ['about', null]);
});

test('a layout change with no scroll, such as an opened disclosure, is still noticed', () => {
  const ctx = setup();
  ctx.moveLine(900);
  ctx.spy.measure();
  ctx.setSections([
    { id: 'services', top: 0, bottom: 1100 },
    { id: 'about', top: 1100, bottom: 1633 },
    { id: 'approach', top: 1633, bottom: 2238 },
  ]);
  ctx.spy.onResize();
  ctx.paint();
  assert.deepEqual(ctx.seen, ['about', 'services']);
});

test('measuring cancels a queued frame so the answer is never stale', () => {
  const ctx = setup();
  ctx.moveLine(900);
  ctx.spy.onScroll();
  assert.equal(ctx.queued, 1);
  ctx.spy.measure();
  assert.equal(ctx.queued, 0);
  assert.deepEqual(ctx.seen, ['about']);
});

test('destroying the spy cancels the queued frame', () => {
  const ctx = setup();
  ctx.spy.onScroll();
  ctx.spy.destroy();
  assert.equal(ctx.queued, 0);
});
