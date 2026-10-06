// How we work: which of the steps the reader has reached, and the moment each one is.
//
// The strand on the left is drawn by scrolling (in CSS, where the browser can do that) up to
// the reading line. A step is reached when its node crosses that same line, so the lit
// strand and the lit node are the same fact told twice. What this module adds is the part a
// scroll timeline cannot do: it says WHEN a step is reached, so the page can answer with
// something that takes its own time (a pulse, a spark of light running to the next node).

/** How long after one step another that arrives in the same frame waits, so a jump down
 *  the page still reads in order: first, then, ready. */
export const STAGGER_MS = 420;

/** A step is reached once its node is on or above the reading line. */
export function resolveReached(nodes: number[], line: number): boolean[] {
  return nodes.map((top) => top <= line);
}

export type ProcessStepsEnvironment = {
  /** Where the middle of each step's node sits in the window now, in px from its top. */
  nodes: () => number[];
  /** The reading line, in px from the top of the window. */
  line: () => number;
  /**
   * A step changed state. `play` is true only for a step reached while the reader is
   * scrolling, so a page that loads already part-way down does not set every pulse off
   * at once; `wait` is how long its answer should hold back (see STAGGER_MS).
   */
  reached: (index: number, on: boolean, play: boolean, wait: number) => void;
  /** Called after a reading in which anything changed, with every step's state. */
  changed?: (reached: boolean[]) => void;
  frame: (callback: () => void) => number;
  cancelFrame: (id: number) => void;
};

export function createProcessSteps(env: ProcessStepsEnvironment) {
  let state: boolean[] = [];
  let first = true;
  let queued: number | null = null;

  const update = () => {
    queued = null;
    const next = resolveReached(env.nodes(), env.line());
    let arrivals = 0;
    next.forEach((on, index) => {
      // Every step starts unreached, so the first reading says nothing about the ones that still are.
      if ((state[index] ?? false) === on) return;
      if (on) {
        // The first reading settles the page as it is found; every later one is a step the
        // reader has just arrived at.
        env.reached(index, true, !first, first ? 0 : arrivals * STAGGER_MS);
        if (!first) arrivals += 1;
      } else {
        env.reached(index, false, false, 0);
      }
    });
    const anyChange = next.some((on, index) => (state[index] ?? false) !== on);
    state = next;
    first = false;
    if (anyChange) env.changed?.(next);
  };

  const schedule = () => {
    if (queued === null) queued = env.frame(update);
  };

  return {
    /** Read the page now, before anything has been scrolled. */
    measure: update,
    onScroll: schedule,
    onResize: schedule,
    destroy() {
      if (queued !== null) env.cancelFrame(queued);
      queued = null;
    },
  };
}
