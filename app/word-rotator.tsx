'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createWordRotation } from '@/lib/word-rotation';
import { syncHeroPlayback, type HeroMotionState } from '@/lib/hero-motion';

const words = ['business', 'institution', 'school', 'hospital', 'city'];
const EXIT_MS = 480;
const ENTER_MS = 1050;
const ENTER_DELAY_MS = 140;
const STAGGER_MS = 32;

type RotationState = {
  current: number;
  previous: number | null;
  cycle: number;
  entering: boolean;
};

export default function WordRotator({
  onMotionChange,
}: {
  onMotionChange?: (motion: HeroMotionState) => void;
}) {
  const [state, setState] = useState<RotationState>({
    current: 0,
    previous: null,
    cycle: 0,
    entering: false,
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const headlineRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const rotationRef = useRef<ReturnType<typeof createWordRotation> | null>(
    null,
  );
  const active = inView && pageVisible;

  useEffect(() => {
    const rotation = createWordRotation({
      now: () => performance.now(),
      delay: (callback, milliseconds) =>
        window.setTimeout(callback, milliseconds),
      cancelDelay: (id) => window.clearTimeout(id),
      advance: () =>
        setState((s) => ({
          current: (s.current + 1) % words.length,
          previous: s.current,
          cycle: s.cycle + 1,
          entering: true,
        })),
    });
    rotationRef.current = rotation;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        setState((s) =>
          s.previous === null && !s.entering
            ? s
            : { ...s, previous: null, entering: false },
        );
      }
    };
    const visibility = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    // On compact layouts the ribbon follows the copy. Keep their shared clock
    // running while either part of the hero is visible.
    const visibilityTarget =
      headlineRef.current?.closest('.hero-experience') ?? headlineRef.current;
    if (visibilityTarget) observer.observe(visibilityTarget);
    update();
    visibility();
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      rotation.destroy();
      rotationRef.current = null;
      observer.disconnect();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    rotationRef.current?.setPlaying(!reducedMotion && active);
  }, [reducedMotion, active]);

  useEffect(() => {
    const motion = {
      cycle: state.cycle,
      paused: false,
      active,
      reducedMotion,
    };
    // Letters and artwork share one clock: both run, and both suspend together.
    const animations = wordRef.current?.getAnimations({ subtree: true }) ?? [];
    syncHeroPlayback(animations, motion);
    onMotionChange?.(motion);
  }, [active, reducedMotion, state.cycle, onMotionChange]);

  // Finish only when the actual animations finish, including time spent paused.
  useEffect(() => {
    if (state.cycle === 0 || reducedMotion) return;
    let cancelled = false;
    const cycle = state.cycle;
    const animations = wordRef.current?.getAnimations({ subtree: true }) ?? [];
    const named = (name: string) =>
      animations.filter(
        (animation) =>
          'animationName' in animation && animation.animationName === name,
      );
    const complete = (group: Animation[], change: Partial<RotationState>) => {
      Promise.all(group.map((animation) => animation.finished))
        .then(() => {
          if (!cancelled)
            setState((s) => (s.cycle === cycle ? { ...s, ...change } : s));
        })
        .catch(() => {
          /* Replacing a word or reducing motion cancels its animations. */
        });
    };
    complete(named('word-release'), { previous: null });
    complete(named('letter-unfold'), { entering: false });
    return () => {
      cancelled = true;
    };
  }, [state.cycle, reducedMotion]);

  return (
    <div
      className="hero-headline"
      ref={headlineRef}
      style={
        {
          '--letter-enter': `${ENTER_MS}ms`,
          '--letter-delay': `${ENTER_DELAY_MS}ms`,
          '--letter-stagger': `${STAGGER_MS}ms`,
          '--word-exit': `${EXIT_MS}ms`,
        } as CSSProperties
      }
    >
      <h1 id="hero-title">
        <span className="sr-only">
          Become the business of the 21st century.
        </span>
        <span aria-hidden="true">
          Become the
          <span className="rotator" ref={wordRef}>
            <span className="rotator-measure">
              {Array.from('institution').map((letter, index) => (
                <span className="rotator-letter" key={index}>
                  {letter}
                </span>
              ))}
            </span>
            {state.previous !== null && !reducedMotion && (
              <span
                key={`out-${state.cycle}`}
                className="rotator-word rotator-word-out"
              >
                {Array.from(words[state.previous]).map((letter, index) => (
                  <span className="rotator-letter" key={index}>
                    {letter}
                  </span>
                ))}
              </span>
            )}
            <span className="rotator-current">
              <span
                key={`in-${state.cycle}`}
                className={`rotator-word${state.entering ? ' rotator-word-in' : ''}`}
              >
                {Array.from(words[state.current]).map((letter, index) => (
                  <span
                    className="rotator-letter"
                    key={index}
                    style={{ '--letter-index': index } as CSSProperties}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </span>
          </span>
          of the 21st century.
        </span>
      </h1>
    </div>
  );
}
