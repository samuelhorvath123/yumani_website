import { createProcessSteps, translateYOf } from './process-steps';

// Where the reader is looking, as a share of the window's height. The strand's scroll
// timeline in app/approach.css reads from the same line (62vh): keep the two together.
const READING_LINE = 0.62;

// Where the middle of a node is once its step has settled. A step rises into place from 56px
// lower when it is revealed, over 2.6 seconds, and nothing fires when that ends: read while it
// is still moving, the node would sit up to 56px below the line it is about to meet (and the
// strand, which is not part of the step, would be lit past a node still shown as a ghost until
// the next scroll). So the step's own lift is taken off.
const middle = (node: HTMLElement) => {
  const box = node.getBoundingClientRect();
  const step = node.closest('li');
  const lift = step ? translateYOf(getComputedStyle(step).transform) : 0;
  return box.top + box.height / 2 - lift;
};

/**
 * Binds the process steps to the page: marks each step as it is reached, and tells it how far
 * the strand runs from its node to the next, so the spark of light knows how far to go.
 * Written against the DOM and nothing else, so it runs wherever the page does. Returns the
 * function that undoes it.
 */
export function watchProcess(root: HTMLElement): () => void {
  const items = Array.from(root.querySelectorAll<HTMLElement>('.process-list > li'));
  const nodes = items.map((item) => item.querySelector<HTMLElement>('.process-node'));
  const strand = root.querySelector<HTMLElement>('.process-line');
  if (items.length === 0 || nodes.some((node) => node === null)) return () => {};
  const marks = nodes as HTMLElement[];

  // The distance from each node to the next; the last one runs to the end of the strand,
  // which carries on past it because the work does not end at launch.
  const measureSpans = () => {
    const centres = marks.map(middle);
    const end = strand ? strand.getBoundingClientRect().bottom : centres[centres.length - 1] + 160;
    items.forEach((item, index) => {
      const to = index < items.length - 1 ? centres[index + 1] : end;
      const span = Math.max(0, Math.round(to - centres[index]));
      item.style.setProperty('--seg', `${span}px`);
      // About 1.6ms for every pixel, so a long run is not a rush and a short one is not a blink.
      item.style.setProperty('--spark', `${Math.round(Math.min(1800, Math.max(800, span * 1.6)))}ms`);
    });
  };

  // Where the strand cannot be drawn by scrolling (reduced motion, or no scroll timelines in the
  // browser), it is lit as far as the last step reached, and this is how far that is: from the
  // top of the strand to that step's node. Both are measured now, so scrolling does not matter.
  let flags: boolean[] = [];
  const measureReach = () => {
    const last = flags.lastIndexOf(true);
    const top = strand ? strand.getBoundingClientRect().top : middle(marks[0]);
    root.style.setProperty('--reach', `${last < 0 ? 0 : Math.max(0, Math.round(middle(marks[last]) - top))}px`);
  };

  const steps = createProcessSteps({
    nodes: () => marks.map(middle),
    line: () => window.innerHeight * READING_LINE,
    reached: (index, on, play, wait) => {
      const item = items[index];
      if (on) item.dataset.reached = 'true';
      else delete item.dataset.reached;
      if (play) {
        item.style.setProperty('--wait', `${wait}ms`);
        item.dataset.play = 'true';
      } else {
        item.style.removeProperty('--wait');
        delete item.dataset.play;
      }
    },
    changed: (next) => { flags = next; measureReach(); },
    frame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (id) => window.cancelAnimationFrame(id),
  });

  // Until this runs the page is simply complete: every node lit, every step as written.
  root.dataset.watching = 'true';
  measureSpans();
  steps.measure();
  const onScroll = () => steps.onScroll();
  const onResize = () => { measureSpans(); measureReach(); steps.onResize(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  const observer = new ResizeObserver(onResize);
  observer.observe(root);

  return () => {
    steps.destroy();
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    delete root.dataset.watching;
    root.style.removeProperty('--reach');
    items.forEach((item) => {
      delete item.dataset.reached;
      delete item.dataset.play;
      item.style.removeProperty('--wait');
      item.style.removeProperty('--seg');
      item.style.removeProperty('--spark');
    });
  };
}
