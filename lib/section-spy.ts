export type SpySection = {
  id: string;
  top: number;
  bottom: number;
};

export type SectionSpyEnvironment = {
  sections: () => SpySection[];
  line: () => number;
  active: (id: string | null) => void;
  frame: (callback: (time: number) => void) => number;
  cancelFrame: (id: number) => void;
};

/**
 * The section the reading line falls inside. Sections arrive in document order
 * and tile the page, so at most one can match. The hero, the closing invitation
 * and the footer belong to none of them, which is what clears the marker again.
 */
export function resolveActiveSection(
  sections: SpySection[],
  line: number,
): string | null {
  for (const section of sections) {
    if (line >= section.top && line < section.bottom) return section.id;
  }
  return null;
}

export function createSectionSpy(env: SectionSpyEnvironment) {
  let current: string | null = null;
  let queued: number | undefined;

  const run = () => {
    queued = undefined;
    const next = resolveActiveSection(env.sections(), env.line());
    if (next === current) return;
    current = next;
    env.active(next);
  };
  const schedule = () => {
    // Scrolling fires far faster than the screen refreshes, so one measurement
    // per frame is enough and the marker can never lag behind the layout.
    if (queued !== undefined) return;
    queued = env.frame(run);
  };
  const measure = () => {
    if (queued !== undefined) {
      env.cancelFrame(queued);
      queued = undefined;
    }
    run();
  };

  return {
    measure,
    onScroll: schedule,
    onResize: schedule,
    destroy() {
      if (queued !== undefined) env.cancelFrame(queued);
      queued = undefined;
    },
  };
}
