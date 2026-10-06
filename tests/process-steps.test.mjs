import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGGER_MS, createProcessSteps, resolveReached, translateYOf } from '../lib/process-steps.ts';

test('a step is reached once its node is on or above the reading line', () => {
  assert.deepEqual(resolveReached([100, 400, 700], 500), [true, true, false]);
  assert.deepEqual(resolveReached([100, 400, 700], 400), [true, true, false], 'exactly on the line counts');
  assert.deepEqual(resolveReached([100, 400, 700], 99), [false, false, false]);
  assert.deepEqual(resolveReached([100, 400, 700], 5000), [true, true, true]);
  assert.deepEqual(resolveReached([], 500), []);
});

// A tiny page: the nodes move up as the reader scrolls, the line stays put.
function harness(initialTops) {
  let tops = initialTops;
  const line = 500;
  let nextFrame = 1;
  const frames = new Map();
  const events = [];
  const pictures = [];
  const steps = createProcessSteps({
    nodes: () => tops,
    line: () => line,
    reached: (index, on, play, wait) => events.push({ index, on, play, wait }),
    changed: (picture) => pictures.push(picture),
    frame: (callback) => { const id = nextFrame++; frames.set(id, callback); return id; },
    cancelFrame: (id) => { frames.delete(id); },
  });
  return {
    steps, events, frames, pictures,
    scrollTo(next) { tops = next; steps.onScroll(); [...frames.values()].forEach((cb) => cb()); frames.clear(); },
    takeEvents() { return events.splice(0); },
  };
}

test('the page as it is first found is settled without playing anything', () => {
  const h = harness([-300, 200, 900]);
  h.steps.measure();
  assert.deepEqual(h.takeEvents(), [
    { index: 0, on: true, play: false, wait: 0 },
    { index: 1, on: true, play: false, wait: 0 },
  ]);
});

test('nothing is announced when no step changed', () => {
  const h = harness([600, 900, 1200]);
  h.steps.measure();
  assert.deepEqual(h.takeEvents(), []);
  h.scrollTo([560, 860, 1160]);
  assert.deepEqual(h.takeEvents(), []);
});

test('a step reached by scrolling plays, and the next waits for it', () => {
  const h = harness([600, 900, 1200]);
  h.steps.measure();
  h.scrollTo([480, 780, 1080]);
  assert.deepEqual(h.takeEvents(), [{ index: 0, on: true, play: true, wait: 0 }]);
  h.scrollTo([200, 500, 800]);
  assert.deepEqual(h.takeEvents(), [{ index: 1, on: true, play: true, wait: 0 }]);
});

test('two steps reached in one frame arrive in order, one stagger apart', () => {
  const h = harness([600, 900, 1200]);
  h.steps.measure();
  h.scrollTo([100, 400, 700]);
  assert.deepEqual(h.takeEvents(), [
    { index: 0, on: true, play: true, wait: 0 },
    { index: 1, on: true, play: true, wait: STAGGER_MS },
  ]);
  h.scrollTo([-400, -100, 200]);
  assert.deepEqual(h.takeEvents(), [{ index: 2, on: true, play: true, wait: 0 }]);
});

test('scrolling back unlights a step without playing anything', () => {
  const h = harness([100, 400, 700]);
  h.steps.measure();
  h.takeEvents();
  h.scrollTo([300, 600, 900]);
  assert.deepEqual(h.takeEvents(), [{ index: 1, on: false, play: false, wait: 0 }]);
  h.scrollTo([800, 1100, 1400]);
  assert.deepEqual(h.takeEvents(), [{ index: 0, on: false, play: false, wait: 0 }]);
});

test('a step that is reached, left and reached again plays again', () => {
  const h = harness([600, 900, 1200]);
  h.steps.measure();
  h.scrollTo([400, 700, 1000]);
  h.takeEvents();
  h.scrollTo([600, 900, 1200]);
  h.takeEvents();
  h.scrollTo([400, 700, 1000]);
  assert.deepEqual(h.takeEvents(), [{ index: 0, on: true, play: true, wait: 0 }]);
});

test('many scroll events in a frame cost one reading, and destroy cancels it', () => {
  const h = harness([600, 900, 1200]);
  h.steps.measure();
  h.steps.onScroll(); h.steps.onScroll(); h.steps.onResize();
  assert.equal(h.frames.size, 1);
  h.steps.destroy();
  assert.equal(h.frames.size, 0);
});

test('the whole picture is reported after a reading in which something changed, and only then', () => {
  const h = harness([600, 900, 1200]);
  h.steps.measure();
  assert.deepEqual(h.pictures, [], 'nothing reached on the first reading: nothing to report');
  h.scrollTo([560, 860, 1160]);
  assert.deepEqual(h.pictures, [], 'nothing changed');
  h.scrollTo([100, 400, 700]);
  assert.deepEqual(h.pictures, [[true, true, false]]);
  h.scrollTo([150, 450, 750]);
  assert.deepEqual(h.pictures, [[true, true, false]], 'still the same two: no new report');
  h.scrollTo([700, 1000, 1300]);
  assert.deepEqual(h.pictures.at(-1), [false, false, false]);
});

test('the lift a step still has from rising into place is read from its computed transform', () => {
  assert.equal(translateYOf('none'), 0);
  assert.equal(translateYOf(''), 0);
  assert.equal(translateYOf('matrix(1, 0, 0, 1, 0, 56)'), 56);
  assert.equal(translateYOf('matrix(1, 0, 0, 1, 0, 5.39)'), 5.39);
  assert.equal(translateYOf('matrix(1, 0, 0, 1, 12, -8)'), -8);
  assert.equal(translateYOf('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 56, 0, 1)'), 56);
  assert.equal(translateYOf('rotate(3deg)'), 0, 'anything it cannot read moves nothing');
  assert.equal(translateYOf('matrix(1, 0, 0, 1, 0, nonsense)'), 0);
});
