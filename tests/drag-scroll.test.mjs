import test from 'node:test';
import assert from 'node:assert/strict';
import { createDragScroll } from '../lib/drag-scroll.ts';

function setup({ reduced = false, initial = 0, limit = 900 } = {}) {
  let time = 0;
  let position = initial;
  let dragging = false;
  let nextId = 0;
  const frames = new Map();
  const controller = createDragScroll({
    position: () => position,
    limit: () => limit,
    scroll: value => { position = value; },
    now: () => time,
    frame: callback => { const id = ++nextId; frames.set(id, callback); return id; },
    cancelFrame: id => frames.delete(id),
    reducedMotion: () => reduced,
    dragging: value => { dragging = value; },
  });
  return {
    controller,
    get position() { return position; },
    get dragging() { return dragging; },
    get pending() { return frames.size; },
    wait(ms) { time += ms; },
    frame() {
      time += 16;
      const callbacks = [...frames.values()];
      frames.clear();
      for (const callback of callbacks) callback();
    },
  };
}

test('a click and minor pointer jitter do not become a drag', () => {
  const s = setup();
  s.controller.begin(200);
  assert.equal(s.controller.move(197), false);
  assert.equal(s.position, 0);
  assert.equal(s.controller.end(), false);
  assert.equal(s.pending, 0);
});

test('drag follows the pointer immediately in both directions and clamps at each end', () => {
  const s = setup({ initial: 200 });
  s.controller.begin(500);
  s.wait(16);
  assert.equal(s.controller.move(400), true);
  assert.equal(s.position, 300);
  assert.equal(s.dragging, true);
  s.controller.move(550);
  assert.equal(s.position, 150);
  s.controller.move(1200);
  assert.equal(s.position, 0);
  s.controller.move(-1000);
  assert.equal(s.position, 900);
});

test('release gives a bounded, decaying glide and finishes without a running frame', () => {
  const s = setup();
  s.controller.begin(300);
  s.wait(16);
  s.controller.move(280);
  assert.equal(s.controller.end(), true);
  assert.equal(s.pending, 1);
  const releasePosition = s.position;
  for (let frame = 0; frame < 120 && s.pending; frame++) s.frame();
  assert.ok(s.position > releasePosition);
  assert.ok(s.position < 250);
  assert.equal(s.pending, 0);
  assert.equal(s.dragging, false);
});

test('holding still before release produces no stale momentum', () => {
  const s = setup();
  s.controller.begin(300);
  s.wait(16);
  s.controller.move(200);
  s.wait(100);
  s.controller.end();
  assert.equal(s.position, 100);
  assert.equal(s.pending, 0);
});

test('reduced motion preserves direct dragging and removes the glide', () => {
  const s = setup({ reduced: true });
  s.controller.begin(300);
  s.wait(16);
  s.controller.move(200);
  s.controller.end();
  assert.equal(s.position, 100);
  assert.equal(s.pending, 0);
  assert.equal(s.dragging, false);
});

test('new input and teardown cancel momentum immediately', () => {
  const s = setup();
  s.controller.begin(300);
  s.wait(16);
  s.controller.move(280);
  s.controller.end();
  s.frame();
  s.controller.cancel();
  const stopped = s.position;
  s.frame();
  assert.equal(s.position, stopped);
  assert.equal(s.pending, 0);
  s.controller.begin(100);
  s.wait(16);
  s.controller.move(70);
  s.controller.end();
  s.controller.destroy();
  assert.equal(s.pending, 0);
  assert.equal(s.dragging, false);
});
