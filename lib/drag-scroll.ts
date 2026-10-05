type DragScrollEnvironment = {
  position: () => number;
  limit: () => number;
  scroll: (position: number) => void;
  now: () => number;
  frame: (callback: () => void) => number;
  cancelFrame: (id: number) => void;
  reducedMotion: () => boolean;
  dragging: (active: boolean) => void;
};

/** Direct pointer tracking, with a short coast. Touch uses native scrolling. */
export function createDragScroll(env: DragScrollEnvironment) {
  let pressed = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;
  let previousPosition = 0;
  let previousTime = 0;
  let velocity = 0;
  let frame: number | null = null;
  const clamp = (position: number) => Math.max(0, Math.min(env.limit(), position));

  const stop = () => {
    if (frame !== null) env.cancelFrame(frame);
    frame = null;
    velocity = 0;
  };
  const cancel = () => {
    stop();
    pressed = false;
    env.dragging(false);
  };

  return {
    begin(x: number) {
      stop();
      pressed = true;
      moved = false;
      startX = x;
      startScroll = previousPosition = env.position();
      previousTime = env.now();
    },
    move(x: number) {
      if (!pressed) return false;
      if (!moved && Math.abs(x - startX) < 5) return false;
      if (!moved) { moved = true; env.dragging(true); }
      const time = env.now();
      const position = clamp(startScroll - (x - startX));
      const elapsed = time - previousTime;
      if (elapsed > 0) velocity = Math.max(-1.5, Math.min(1.5, (position - previousPosition) / elapsed));
      env.scroll(position);
      previousPosition = position;
      previousTime = time;
      return true;
    },
    end() {
      if (!pressed) return false;
      pressed = false;
      const didDrag = moved;
      if (!moved || env.reducedMotion() || env.now() - previousTime > 80 || Math.abs(velocity) < .05) {
        cancel();
        return didDrag;
      }
      let time = env.now();
      const coast = () => {
        const nextTime = env.now();
        const elapsed = Math.min(32, nextTime - time);
        time = nextTime;
        const before = env.position();
        const next = clamp(before + velocity * elapsed);
        env.scroll(next);
        velocity *= Math.exp(-elapsed / 130);
        if (Math.abs(velocity) < .04 || Math.abs(next - before) < .1) { cancel(); return; }
        frame = env.frame(coast);
      };
      frame = env.frame(coast);
      return didDrag;
    },
    cancel,
    destroy: cancel,
  };
}
