'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createHeaderScroll, type HeaderPhase } from '@/lib/header-scroll';

export default function SiteHeader({ children }: { children: ReactNode }) {
  const headerRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<HeaderPhase>('initial');
  // True while the closing screen has reached the bar: the bar steps aside there.
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.opening');
    const header = headerRef.current;
    if (!hero || !header) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Wide screens keep the bar pinned, so it can start pulling itself together
    // the moment the reader scrolls. Small screens keep the current manners: the
    // header leaves with the hero and the compact bar arrives later, because a
    // two row bar is a lot to keep on a phone.
    const compact = window.matchMedia('(max-width: 700px)');
    let heroBoundary = 0;
    const measure = () => {
      const clearance = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sticky-clearance')) || 124;
      heroBoundary = Math.max(1, hero.getBoundingClientRect().bottom + window.scrollY - clearance);
    };
    measure();
    // Pinning is a behaviour, not a style: without JavaScript the header keeps
    // scrolling away with the page as it always did.
    const pin = () => {
      if (compact.matches) delete header.dataset.pinned;
      else header.dataset.pinned = 'true';
    };
    pin();
    const controller = createHeaderScroll({
      position: () => window.scrollY,
      threshold: () => (compact.matches ? heroBoundary : 64),
      reducedMotion: () => motion.matches,
      fadesOut: () => compact.matches,
      phase: setPhase,
      delay: (callback, milliseconds) => window.setTimeout(callback, milliseconds),
      cancelDelay: (id) => window.clearTimeout(id),
    });
    // The page ends on its own screen of deep blue, where the bar has nothing to add
    // and would only sit on top of the invitation. It steps aside the moment that
    // screen reaches the bar's lower edge, and comes back as the reader backs out.
    const closing = document.querySelector<HTMLElement>('.closing-screen');
    let frame = 0;
    const checkCovered = () => {
      frame = 0;
      if (closing) setCovered(closing.getBoundingClientRect().top <= header.getBoundingClientRect().bottom);
    };
    const queueCheck = () => { if (!frame) frame = window.requestAnimationFrame(checkCovered); };
    checkCovered();
    const onScroll = () => { controller.onScroll(); queueCheck(); };
    const resize = () => { measure(); pin(); controller.onResize(); queueCheck(); };
    const observer = new ResizeObserver(resize);
    observer.observe(hero);
    compact.addEventListener('change', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      controller.destroy();
      observer.disconnect();
      compact.removeEventListener('change', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // The shell takes the fade, so the bar's own phase animations never have to share
  // the property; it adds no box of its own, because the bar is out of flow.
  return <div className="header-shell" data-covered={covered ? 'true' : undefined} inert={covered}>
    <header className="site-header wrap" ref={headerRef} data-phase={phase} inert={phase === 'leaving'} aria-hidden={phase === 'leaving' ? true : undefined}>{children}</header>
  </div>;
}
