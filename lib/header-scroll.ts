export type HeaderPhase = 'initial' | 'sticky' | 'leaving';

export type HeaderScrollEnvironment = {
  position: () => number;
  /** The scroll position at which the bar floats and pulls itself together. */
  threshold: () => number;
  reducedMotion: () => boolean;
  /** Whether letting go of the floating state fades it out or relaxes it. */
  fadesOut: () => boolean;
  phase: (phase: HeaderPhase) => void;
  delay: (callback: () => void, milliseconds: number) => number;
  cancelDelay: (id: number) => void;
};

// Distance below the threshold that counts as still being past it, so a small
// reversal at the edge cannot flicker the bar in and out.
const HOLD = 24;
const HEADER_EXIT_MS = 380;

/**
 * Moves the navigation bar between its place in the page and a floating surface.
 * The page itself is never scrolled from here: the bar follows the reader, it
 * does not steer.
 */
export function createHeaderScroll(env: HeaderScrollEnvironment) {
  let lastY = Math.max(0, env.position());
  let threshold = env.threshold();
  let sticky = lastY >= threshold;
  let phase: HeaderPhase = sticky ? 'sticky' : 'initial';
  let exitTimer: number | undefined;

  const cancelDelay = (id: number | undefined) => {
    if (id !== undefined) env.cancelDelay(id);
  };
  const setPhase = (next: HeaderPhase) => {
    if (phase === next) return;
    phase = next;
    env.phase(next);
  };
  const restoreHeader = () => {
    sticky = false;
    cancelDelay(exitTimer);
    exitTimer = undefined;
    setPhase('initial');
  };
  // Where the bar is pinned, letting go animates it back into the wide header, so
  // there is nothing to fade. Where it is not, the bar fades out and returns to
  // its place in the page.
  const leaveHeader = () => {
    sticky = false;
    cancelDelay(exitTimer);
    const fades = env.fadesOut() && !env.reducedMotion();
    setPhase(fades ? 'leaving' : 'initial');
    if (fades) {
      exitTimer = env.delay(() => {
        exitTimer = undefined;
        setPhase('initial');
      }, HEADER_EXIT_MS);
    }
  };

  env.phase(phase);

  return {
    onScroll() {
      const y = Math.max(0, env.position());
      // Top-of-page state must not depend on wheel/scroll event ordering.
      if (y <= 2) {
        restoreHeader();
        lastY = y;
        return;
      }
      if (y >= threshold) {
        if (!sticky) {
          sticky = true;
          cancelDelay(exitTimer);
          exitTimer = undefined;
          setPhase('sticky');
        }
      } else if (sticky && y <= threshold - HOLD) {
        leaveHeader();
      }
      lastY = y;
    },
    onResize() {
      const nextThreshold = env.threshold();
      // Mobile browser chrome and initial observer delivery can report a resize
      // without changing the hero; those must not move the bar.
      if (Math.abs(nextThreshold - threshold) < 1) return;
      threshold = nextThreshold;
      cancelDelay(exitTimer);
      exitTimer = undefined;
      lastY = Math.max(0, env.position());
      sticky = lastY >= threshold;
      setPhase(sticky ? 'sticky' : 'initial');
    },
    destroy() {
      cancelDelay(exitTimer);
    },
  };
}
