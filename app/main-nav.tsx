'use client';

import { useEffect, useState } from 'react';
import { createSectionSpy } from '@/lib/section-spy';

export type NavItem = { href: string; label: string };

export default function MainNav({ items }: { items: NavItem[] }) {
  const [current, setCurrent] = useState<string | null>(null);
  const key = items.map((item) => item.href).join(' ');

  useEffect(() => {
    const targets = key
      .split(' ')
      .map((href) => document.getElementById(href.slice(1)))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;

    // The clearance only changes with the layout breakpoint, so it is read on
    // resize rather than on every scrolled frame.
    const readClearance = () =>
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--sticky-clearance',
        ),
      ) || 124;
    let clearance = readClearance();
    const spy = createSectionSpy({
      sections: () =>
        targets.map((element) => {
          const rect = element.getBoundingClientRect();
          return { id: element.id, top: rect.top, bottom: rect.bottom };
        }),
      // Read low enough that a section counts as current while its heading is on
      // screen, and never above the bar, which is also where an anchor lands.
      line: () => Math.max(clearance, window.innerHeight * 0.4),
      active: setCurrent,
      frame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (id) => window.cancelAnimationFrame(id),
    });
    const onResize = () => {
      clearance = readClearance();
      spy.onResize();
    };
    spy.measure();
    window.addEventListener('scroll', spy.onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    // An open service or a late font moves everything below it without a scroll.
    const observer = new ResizeObserver(spy.onResize);
    observer.observe(document.body);
    return () => {
      spy.destroy();
      observer.disconnect();
      window.removeEventListener('scroll', spy.onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [key]);

  return <nav className="desktop-nav" aria-label="Main navigation">
    {items.map(({ href, label }) => <a key={href} href={href} aria-current={current === href.slice(1) ? 'location' : undefined}>{label}</a>)}
  </nav>;
}
