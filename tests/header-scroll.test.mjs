import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeaderScroll } from '../lib/header-scroll.ts';

// A fake page and a fake clock, so every rule of the bar can be driven without a
// browser: where the reader is, where the hero ends, and when timers fire.
function setup(initialY = 0, options = {}) {
  const { reduced = false, fadesOut = true, threshold = 600 } = options;
  let y = initialY;
  let line = threshold;
  let now = 0;
  let nextId = 0;
  const tasks = new Map();
  const phases = [];
  const controller = createHeaderScroll({
    position: () => y,
    threshold: () => line,
    reducedMotion: () => reduced,
    fadesOut: () => fadesOut,
    phase: (phase) => phases.push(phase),
    delay: (callback, ms) => {
      const id = ++nextId;
      tasks.set(id, { at: now + ms, callback });
      return id;
    },
    cancelDelay: (id) => tasks.delete(id),
  });
  return {
    controller,
    phases,
    get pending() { return tasks.size; },
    scroll(position) { y = position; controller.onScroll(); },
    resize(nextLine) { line = nextLine; controller.onResize(); },
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const due = [...tasks].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        tasks.delete(due[0]);
        now = due[1].at;
        due[1].callback();
      }
      now = end;
    },
  };
}

test('the bar starts in its place in the page and says so once', () => {
  const page = setup();
  assert.deepEqual(page.phases, ['initial']);
});

test('opening the page already scrolled past the hero starts the bar floating', () => {
  const page = setup(900);
  assert.deepEqual(page.phases, ['sticky']);
});

test('the bar floats the moment the reader reaches the threshold, and not before', () => {
  const page = setup();
  page.scroll(599);
  assert.deepEqual(page.phases, ['initial']);
  page.scroll(600);
  assert.deepEqual(page.phases, ['initial', 'sticky']);
  page.scroll(900);
  assert.deepEqual(page.phases, ['initial', 'sticky'], 'scrolling further says nothing new');
});

test('a small step back at the edge does not make the bar flicker', () => {
  const page = setup(0, { threshold: 64, fadesOut: false });
  page.scroll(64);
  page.scroll(50);
  page.scroll(41);
  assert.deepEqual(page.phases, ['initial', 'sticky']);
  page.scroll(40);
  assert.deepEqual(page.phases, ['initial', 'sticky', 'initial'], 'it relaxes once the reader is 24px back');
});

test('where the bar is pinned, letting go relaxes it into the header with nothing to fade', () => {
  const page = setup(900, { threshold: 64, fadesOut: false });
  page.scroll(30);
  assert.deepEqual(page.phases, ['sticky', 'initial']);
  assert.equal(page.pending, 0);
});

test('where the bar is not pinned, it fades out and then retakes its place', () => {
  const page = setup(900);
  page.scroll(100);
  assert.deepEqual(page.phases, ['sticky', 'leaving']);
  page.advance(379);
  assert.deepEqual(page.phases, ['sticky', 'leaving']);
  page.advance(1);
  assert.deepEqual(page.phases, ['sticky', 'leaving', 'initial']);
});

test('reduced motion skips the fade and goes straight back', () => {
  const page = setup(900, { reduced: true });
  page.scroll(100);
  assert.deepEqual(page.phases, ['sticky', 'initial']);
  assert.equal(page.pending, 0);
});

test('coming back to the top restores the header at once, even mid-fade', () => {
  const page = setup(900);
  page.scroll(100);
  assert.deepEqual(page.phases, ['sticky', 'leaving']);
  page.scroll(0);
  assert.deepEqual(page.phases, ['sticky', 'leaving', 'initial']);
  assert.equal(page.pending, 0, 'the fade timer is cancelled');
});

test('floating again while fading out cancels the fade', () => {
  const page = setup(900);
  page.scroll(100);
  page.scroll(700);
  assert.deepEqual(page.phases, ['sticky', 'leaving', 'sticky']);
  assert.equal(page.pending, 0);
  page.advance(1000);
  assert.deepEqual(page.phases, ['sticky', 'leaving', 'sticky'], 'the old timer never fires');
});

test('a resize that moves the threshold re-decides the state; one that does not is ignored', () => {
  const page = setup(500);
  assert.deepEqual(page.phases, ['initial']);
  page.resize(500.4);
  assert.deepEqual(page.phases, ['initial'], 'sub-pixel changes are mobile browser chrome, not layout');
  page.resize(400);
  assert.deepEqual(page.phases, ['initial', 'sticky'], 'the hero got shorter, so the reader is now past it');
  page.resize(800);
  assert.deepEqual(page.phases, ['initial', 'sticky', 'initial']);
});

test('destroying the controller cancels any pending fade', () => {
  const page = setup(900);
  page.scroll(100);
  assert.equal(page.pending, 1);
  page.controller.destroy();
  assert.equal(page.pending, 0);
});
