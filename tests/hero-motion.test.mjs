import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeroPulse, syncHeroPlayback } from '../lib/hero-motion.ts';

const state = (overrides = {}) => ({
  cycle: 1,
  paused: false,
  active: true,
  reducedMotion: false,
  ...overrides,
});

function animation() {
  return {
    playState: 'running',
    currentTime: 350,
    plays: 0,
    cancels: 0,
    play() {
      this.playState = 'running';
      this.plays++;
    },
    pause() {
      this.playState = 'paused';
    },
    cancel() {
      this.playState = 'idle';
      this.cancels++;
    },
  };
}

test('one light pulse per word cycle, keeping its progress between changes', () => {
  const created = [];
  const pulse = createHeroPulse(() => {
    const light = animation();
    created.push(light);
    return [light];
  });
  pulse.sync(state());
  pulse.sync(state());
  assert.equal(created.length, 1);
  assert.equal(created[0].currentTime, 350);
  pulse.sync(state({ cycle: 2 }));
  assert.equal(created.length, 2);
  assert.equal(created[0].cancels, 1);
});

test('letters and lighting both freeze during pause or invisibility and resume in place', () => {
  const letter = animation();
  const light = animation();
  for (const suspended of [{ paused: true }, { active: false }]) {
    syncHeroPlayback([letter, light], state(suspended));
    assert.equal(letter.playState, 'paused');
    assert.equal(light.playState, 'paused');
    syncHeroPlayback([letter, light], state());
    assert.equal(letter.playState, 'running');
    assert.equal(light.playState, 'running');
    assert.equal(letter.currentTime, 350);
    assert.equal(light.currentTime, 350);
  }
});

test('finished animation is never replayed when visibility changes', () => {
  const completed = animation();
  completed.playState = 'finished';
  syncHeroPlayback([completed], state());
  syncHeroPlayback([completed], state({ active: false }));
  syncHeroPlayback([completed], state());
  assert.equal(completed.plays, 0);
  assert.equal(completed.playState, 'finished');
});

test('reduced motion clears decorative lighting and reenabling it waits for a new word', () => {
  const created = [];
  const pulse = createHeroPulse(() => {
    const light = animation();
    created.push(light);
    return [light];
  });
  pulse.sync(state());
  pulse.sync(state({ reducedMotion: true }));
  assert.equal(created[0].cancels, 1);
  pulse.sync(state());
  assert.equal(created.length, 1);
  pulse.sync(state({ cycle: 2 }));
  assert.equal(created.length, 2);
  pulse.destroy();
  assert.equal(created[1].cancels, 1);
});

test('no pulse is created until the first word change', () => {
  let count = 0;
  const pulse = createHeroPulse(() => {
    count++;
    return [animation()];
  });
  pulse.sync(state({ cycle: 0 }));
  pulse.sync(state({ cycle: 0 }));
  assert.equal(count, 0);
  pulse.sync(state());
  assert.equal(count, 1);
});
