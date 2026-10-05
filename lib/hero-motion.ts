export type HeroMotionState = {
  cycle: number;
  paused: boolean;
  active: boolean;
  reducedMotion: boolean;
};

export type HeroAnimation = Pick<
  Animation,
  'playState' | 'play' | 'pause' | 'cancel'
>;

export function syncHeroPlayback(
  animations: HeroAnimation[],
  motion: HeroMotionState,
) {
  for (const animation of animations) {
    if (motion.reducedMotion) {
      animation.cancel();
      continue;
    }
    // Calling play() on a finished, filled animation would replay it the next
    // time the hero comes back into view.
    if (animation.playState === 'finished' || animation.playState === 'idle')
      continue;
    if (motion.active && !motion.paused) animation.play();
    else animation.pause();
  }
}

export function createHeroPulse(createAnimations: () => HeroAnimation[]) {
  let cycle = 0;
  let animations: HeroAnimation[] = [];
  const clear = () => {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  };

  return {
    sync(motion: HeroMotionState) {
      if (motion.reducedMotion) {
        clear();
        cycle = motion.cycle;
        return;
      }
      if (motion.cycle !== cycle) {
        clear();
        cycle = motion.cycle;
        if (cycle > 0) animations = createAnimations();
      }
      syncHeroPlayback(animations, motion);
    },
    destroy: clear,
  };
}
