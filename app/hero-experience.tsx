'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import WordRotator from './word-rotator';
import {
  createHeroPulse,
  syncHeroPlayback,
  type HeroMotionState,
} from '@/lib/hero-motion';
import { CANVAS_WIDTH, lightStrokes, strokeKeyframes, type StrokeKeyframes } from '@/lib/flow-light';

export default function HeroExperience({
  art,
  children,
}: {
  art: ReactNode;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const pulseRef = useRef<ReturnType<typeof createHeroPulse> | null>(null);
  const hasBeenVisible = useRef(false);
  const [motion, setMotion] = useState<HeroMotionState>({
    cycle: 0,
    paused: false,
    active: false,
    reducedMotion: true,
  });
  // The light stays hidden until its mask has decoded: unmasked, it would spill
  // across the whole artwork instead of landing on the ribbon.
  const [lightReady, setLightReady] = useState(false);

  useEffect(() => {
    // Fetch the mask only when the light can actually play.
    let requested = false;
    let cancelled = false;
    const loadMask = () => {
      const src = rootRef.current?.querySelector<HTMLElement>('[data-mask-src]')?.dataset.maskSrc;
      if (requested || !src) return;
      requested = true;
      const image = new Image();
      // CSS fetches mask images in CORS mode; matching it lets the stylesheet
      // reuse this download instead of making its own.
      image.crossOrigin = 'anonymous';
      image.src = src;
      image.decode().then(() => { if (!cancelled) setLightReady(true); }, () => { /* No mask, no light. */ });
    };
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) loadMask();

    // The light's canvas is laid out in artwork units and scaled to the artwork.
    const lightElement = rootRef.current?.querySelector<HTMLElement>('.hero-flow-light');
    const canvas = lightElement?.querySelector<HTMLElement>('.hero-flow-canvas');
    const resize = new ResizeObserver(([entry]) => {
      canvas?.style.setProperty('--flow-scale', String(entry.contentRect.width / CANVAS_WIDTH));
    });
    if (lightElement) resize.observe(lightElement);

    // The keyframes never change, so they are worked out once (about 10 ms)
    // while the page is idle, well before the first word change, and the
    // animations built from them are replayed on every word. Safari has no
    // idle callback, so there it runs on a short timer instead.
    let keyframes: StrokeKeyframes[] | null = null;
    const computeKeyframes = () => (keyframes ??= lightStrokes.map(strokeKeyframes));
    const idle = 'requestIdleCallback' in window
      ? window.requestIdleCallback(computeKeyframes, { timeout: 400 })
      : undefined;
    const idleTimer = idle === undefined ? window.setTimeout(computeKeyframes, 120) : undefined;
    let light: Animation[] | null = null;
    const buildLight = () => {
      const frames = computeKeyframes();
      const strokes = rootRef.current?.querySelectorAll<HTMLElement>('.hero-flow-stroke') ?? [];
      const animations: Animation[] = [];
      strokes.forEach((element, index) => {
        const stroke = lightStrokes[index];
        if (!stroke) return;
        const timing: KeyframeAnimationOptions = { duration: stroke.duration, delay: stroke.delay, fill: 'backwards', easing: 'linear' };
        animations.push(element.animate(frames[index].envelope, timing));
        element.querySelectorAll<HTMLElement>('.hero-flow-disc').forEach((disc, i) => {
          const discKeyframes = frames[index].discs[i];
          if (discKeyframes) animations.push(disc.animate(discKeyframes.transform, timing), disc.animate(discKeyframes.opacity, timing));
        });
      });
      return animations;
    };
    const pulse = createHeroPulse(() => {
      loadMask();
      if (light) for (const animation of light) animation.play();
      else light = buildLight();
      // Once a pulse is over, let go of it: the resting light is simply the
      // stylesheet's (invisible) state, and an animation that is no longer
      // attached costs WebKit nothing when it next recomputes compositing.
      const played = light;
      Promise.all(played.map((animation) => animation.finished)).then(
        () => { for (const animation of played) animation.cancel(); },
        () => { /* Cancelled for the next word or reduced motion. */ },
      );
      return played;
    });
    pulseRef.current = pulse;
    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(idleTimer);
      resize.disconnect();
      pulse.destroy();
      pulseRef.current = null;
    };
  }, []);

  useEffect(() => {
    pulseRef.current?.sync(motion);
    // Finite entrance motion joins pause/resume after visibility is measured;
    // the server-rendered hero stays visible if JavaScript never starts.
    if (motion.active) hasBeenVisible.current = true;
    if (!hasBeenVisible.current) return;
    const entrances = (
      rootRef.current?.getAnimations({ subtree: true }) ?? []
    ).filter(
      (animation) =>
        'animationName' in animation &&
        ['arrive', 'art-arrive'].includes(String(animation.animationName)),
    );
    syncHeroPlayback(entrances, motion);
  }, [motion]);

  return (
    <section
      className="hero hero-experience wrap"
      aria-labelledby="hero-title"
      ref={rootRef}
      data-playing={motion.active && !motion.paused && !motion.reducedMotion}
      data-reduced-motion={motion.reducedMotion}
      data-light={lightReady ? 'ready' : undefined}
    >
      <div className="hero-art" aria-hidden="true">
        {art}
      </div>
      <div className="hero-copy">
        <WordRotator onMotionChange={setMotion} />
        {children}
      </div>
    </section>
  );
}
