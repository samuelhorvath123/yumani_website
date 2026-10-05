'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { createDragScroll } from '@/lib/drag-scroll';
import { createAnimationScheduler } from '@/lib/animation-scheduler';

export default function TeamCarousel({ children, preview = false }: { children: ReactNode; preview?: boolean }) {
  const viewportRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<ReturnType<typeof createDragScroll> | null>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scheduler = createAnimationScheduler(window);
    const controller = createDragScroll({
      position: () => viewport.scrollLeft,
      limit: () => viewport.scrollWidth - viewport.clientWidth,
      scroll: position => { viewport.scrollLeft = position; },
      now: () => performance.now(),
      ...scheduler,
      reducedMotion: () => motion.matches,
      dragging: active => { viewport.dataset.dragging = String(active); },
    });
    controllerRef.current = controller;
    let pointer: number | null = null;
    let didDrag = false;
    let scrollFrame: number | null = null;

    const updateEdges = () => {
      scrollFrame = null;
      const start = viewport.scrollLeft < 2;
      const end = viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 2;
      setEdges(previous => previous.start === start && previous.end === end ? previous : { start, end });
    };
    const scroll = () => { if (scrollFrame === null) scrollFrame = scheduler.frame(updateEdges); };
    const down = (event: PointerEvent) => {
      didDrag = false;
      if (event.pointerType !== 'mouse' || event.button !== 0 || (event.target as Element).closest('a, button, input')) return;
      pointer = event.pointerId;
      controller.begin(event.clientX);
    };
    const move = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      if (controller.move(event.clientX)) {
        didDrag = true;
        if (!viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId);
        event.preventDefault();
      }
    };
    const up = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      controller.end();
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    };
    const cancel = () => { pointer = null; controller.cancel(); };
    const lostCapture = () => { if (pointer !== null) cancel(); };
    const click = (event: MouseEvent) => {
      if (didDrag) { event.preventDefault(); event.stopPropagation(); didDrag = false; }
    };
    const resize = new ResizeObserver(updateEdges);
    resize.observe(viewport);
    if (viewport.firstElementChild) resize.observe(viewport.firstElementChild);
    updateEdges();
    viewport.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    viewport.addEventListener('pointercancel', cancel);
    viewport.addEventListener('lostpointercapture', lostCapture);
    viewport.addEventListener('click', click, true);
    viewport.addEventListener('scroll', scroll, { passive: true });
    viewport.addEventListener('wheel', cancel, { passive: true });
    viewport.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('blur', cancel);
    motion.addEventListener('change', cancel);
    return () => {
      controller.destroy();
      controllerRef.current = null;
      resize.disconnect();
      if (scrollFrame !== null) scheduler.cancelFrame(scrollFrame);
      viewport.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      viewport.removeEventListener('pointercancel', cancel);
      viewport.removeEventListener('lostpointercapture', lostCapture);
      viewport.removeEventListener('click', click, true);
      viewport.removeEventListener('scroll', scroll);
      viewport.removeEventListener('wheel', cancel);
      viewport.removeEventListener('touchstart', cancel);
      window.removeEventListener('blur', cancel);
      motion.removeEventListener('change', cancel);
    };
  }, []);

  const step = (direction: number, edge = false) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    controllerRef.current?.cancel();
    const card = viewport.querySelector<HTMLElement>('.team-card');
    const distance = (card?.getBoundingClientRect().width ?? viewport.clientWidth * .8) + 24;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    viewport.scrollTo({ left: edge ? (direction > 0 ? viewport.scrollWidth : 0) : viewport.scrollLeft + distance * direction, behavior });
  };

  return <div className="team-carousel">
    <div className="team-toolbar wrap">
      <div><h3 id="team-title">The people behind Yumani.</h3><p id="team-instructions">{preview ? 'Profile layout preview. Portraits, names and roles pending.' : 'A small team. You’ll know everyone by name.'}</p></div>
      <div className="team-controls">
        <span aria-hidden="true">Drag to explore</span>
        <button type="button" aria-label="Previous team member" aria-controls="team-viewport" disabled={edges.start} onClick={() => step(-1)}><ArrowLeft size={18} aria-hidden="true"/></button>
        <button type="button" aria-label="Next team member" aria-controls="team-viewport" disabled={edges.end} onClick={() => step(1)}><ArrowRight size={18} aria-hidden="true"/></button>
      </div>
    </div>
    <p className="sr-only" id="team-help">Drag or swipe to explore. With this area focused, use the left and right arrow keys to move between profiles, or Home and End to reach either end.</p>
    {/* This native scroll region needs keyboard focus as an alternative to dragging. */}
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
    <section className="team-viewport" id="team-viewport" ref={viewportRef} tabIndex={0} aria-labelledby="team-title" aria-describedby="team-instructions team-help" onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        step(event.key === 'ArrowRight' || event.key === 'End' ? 1 : -1, event.key === 'Home' || event.key === 'End');
      }
    }}>
      <ul className="team-track">{children}</ul>
    </section>
  </div>;
}
