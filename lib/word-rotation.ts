export const ROTATION_INTERVAL_MS = 4400;
export const FIRST_ROTATION_MS = 600;

type RotationClock = {
  now: () => number;
  delay: (callback: () => void, milliseconds: number) => number;
  cancelDelay: (id: number) => void;
  advance: () => void;
};

// Keep the reading time already spent when visibility or pause changes.
export function createWordRotation(clock: RotationClock) {
  let remaining = FIRST_ROTATION_MS;
  let started = clock.now();
  let playing = false;
  let timer: number | undefined;

  const stopTimer = () => {
    if (timer !== undefined) clock.cancelDelay(timer);
    timer = undefined;
  };
  const accountForElapsedTime = () => {
    if (playing) remaining = Math.max(0, remaining - (clock.now() - started));
  };
  const schedule = () => {
    started = clock.now();
    timer = clock.delay(() => {
      timer = undefined;
      remaining = ROTATION_INTERVAL_MS;
      started = clock.now();
      clock.advance();
      if (playing) schedule();
    }, remaining);
  };

  return {
    setPlaying(next: boolean) {
      if (next === playing) return;
      accountForElapsedTime();
      stopTimer();
      playing = next;
      if (playing) schedule();
    },
    destroy() {
      playing = false;
      stopTimer();
    },
  };
}
