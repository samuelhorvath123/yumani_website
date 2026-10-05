'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronUp } from 'lucide-react';
// closing.css is imported by site-footer.tsx: CSS imported here, in a client
// module, would be fetched again as a stylesheet when this chunk loads, on top of
// the copy already inlined in the page.

/**
 * The footer's "Legal" drop-down: the privacy, cookie and terms pages and the cookie
 * settings, kept out of sight until wanted. It is a plain <details>, so it opens and
 * closes without any script; the script only adds what people expect of a menu:
 * it closes when you click elsewhere, press Escape (returning to the button) or
 * choose something.
 */
export default function LegalMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const outside = (event: PointerEvent) => {
      if (details.open && event.target instanceof Node && !details.contains(event.target)) details.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !details.open) return;
      details.open = false;
      details.querySelector('summary')?.focus();
    };
    const chosen = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a, button')) details.open = false;
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    details.addEventListener('click', chosen);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      details.removeEventListener('click', chosen);
    };
  }, []);

  return <details className="legal-menu" ref={ref}>
    <summary>Legal <ChevronUp size={14} aria-hidden="true"/></summary>
    <div className="legal-menu-panel">{children}</div>
  </details>;
}
