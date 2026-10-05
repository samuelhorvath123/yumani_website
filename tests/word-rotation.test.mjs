import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWordRotation,
  FIRST_ROTATION_MS,
  ROTATION_INTERVAL_MS,
} from '../lib/word-rotation.ts';

function setup() {
  let now = 0;
  let nextId = 0;
  const tasks = new Map();
  const rotations = [];
  const controller = createWordRotation({
    now: () => now,
    advance: () => rotations.push(now),
    delay(callback, ms) {
      const id = ++nextId;
      tasks.set(id, { at: now + ms, callback });
      return id;
    },
    cancelDelay: (id) => tasks.delete(id),
  });
  return {
    controller,
    rotations,
    advance(ms) {
      const end = now + ms;
      while (tasks.size) {
        const [id, task] = [...tasks].sort((a, b) => a[1].at - b[1].at)[0];
        if (task.at > end) break;
        now = task.at;
        tasks.delete(id);
        task.callback();
      }
      now = end;
    },
  };
}

test('each visit starts rotating within the first second, then leaves time to read', () => {
  for (let visit = 0; visit < 2; visit++) {
    const page = setup();
    page.controller.setPlaying(true);
    page.advance(FIRST_ROTATION_MS - 1);
    assert.equal(page.rotations.length, 0);
    page.advance(1);
    assert.deepEqual(page.rotations, [600]);
    page.advance(ROTATION_INTERVAL_MS);
    assert.deepEqual(page.rotations, [600, 5000]);
  }
});

test('the cadence never changes, so every reading window is the same', () => {
  const page = setup();
  page.controller.setPlaying(true);
  page.advance(FIRST_ROTATION_MS);
  page.advance(ROTATION_INTERVAL_MS);
  page.advance(ROTATION_INTERVAL_MS);
  assert.deepEqual(page.rotations, [600, 5000, 9400]);
});

test('pause, hidden tabs and reduced motion suspend the clock', () => {
  const page = setup();
  page.advance(5000);
  assert.equal(page.rotations.length, 0);
  page.controller.setPlaying(true);
  page.advance(300);
  page.controller.setPlaying(false);
  page.advance(5000);
  assert.equal(page.rotations.length, 0);
  page.controller.setPlaying(true);
  page.advance(299);
  assert.equal(page.rotations.length, 0);
  page.advance(1);
  assert.equal(page.rotations.length, 1);
});

test('unmounting cancels queued rotations', () => {
  const page = setup();
  page.controller.setPlaying(true);
  page.controller.destroy();
  page.advance(10000);
  assert.equal(page.rotations.length, 0);
});
