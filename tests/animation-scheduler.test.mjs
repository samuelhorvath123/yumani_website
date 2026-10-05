import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnimationScheduler } from '../lib/animation-scheduler.ts';
import { createDragScroll } from '../lib/drag-scroll.ts';

function setup() {
  let time = 0;
  let position = 0;
  let nextId = 0;
  let cancellations = 0;
  const pending = new Map();
  // Browsers require these native methods to be called with their Window receiver.
  const host = {
    requestAnimationFrame(callback) {
      assert.equal(this, host, 'requestAnimationFrame must retain its Window receiver');
      const id = ++nextId;
      pending.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      assert.equal(this, host, 'cancelAnimationFrame must retain its Window receiver');
      cancellations++;
      pending.delete(id);
    },
  };
  const controller = createDragScroll({
    ...createAnimationScheduler(host),
    position: () => position,
    limit: () => 900,
    scroll: value => { position = value; },
    now: () => time,
    reducedMotion: () => false,
    dragging: () => {},
  });
  return {
    controller,
    get pending() { return pending.size; },
    get cancellations() { return cancellations; },
    release() {
      controller.begin(200);
      time += 16;
      controller.move(180);
      controller.end();
    },
    tick() {
      time += 16;
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach(callback => callback(time));
    },
  };
}

test('finishing a drag glide calls the browser cancellation method with its Window receiver', () => {
  const s = setup();
  s.release();
  assert.equal(s.pending, 1);
  for (let i = 0; i < 120 && s.pending; i++) s.tick();
  assert.equal(s.pending, 0);
  assert.ok(s.cancellations > 0);
});

test('interruption and teardown retain the browser receiver while cancelling a pending glide', () => {
  const s = setup();
  s.release();
  s.controller.cancel();
  assert.equal(s.pending, 0);
  s.release();
  s.controller.destroy();
  assert.equal(s.pending, 0);
  assert.equal(s.cancellations, 2);
});
