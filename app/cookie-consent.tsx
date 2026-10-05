'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ConsentState } from '@/lib/consent';
import { consent } from './consent-store';
// cookie-consent.css is imported by layout.tsx: CSS imported here, in a client
// module, would be fetched again as a stylesheet when this chunk loads, on top of
// the copy already inlined in the page.

const notReady: ConsentState = { ready: false };

/**
 * Asks once, plainly, and remembers the answer. Accepting and rejecting are the
 * same size, shape and weight, and nothing optional is on until the visitor
 * turns it on. The banner only exists in the browser: the server renders
 * nothing, so a visitor without JavaScript is never shown a choice that could
 * not be made (and nothing optional could run for them either).
 */
export default function CookieConsent() {
  const state = useSyncExternalStore(consent.subscribe, consent.getSnapshot, () => notReady);
  const visible = state.ready && (state.record === null || state.editing);
  if (!visible) return null;
  // Remounting for each opening starts the form from what is stored.
  return <Banner key={state.ready && state.editing ? 'edit' : 'ask'} editing={state.ready && state.editing} analytics={state.ready ? (state.record?.analytics ?? false) : false} />;
}

function Banner({ editing, analytics: stored }: { editing: boolean; analytics: boolean }) {
  const id = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(editing);
  const [analytics, setAnalytics] = useState(stored);

  // A banner the visitor asked for gets focus, and hands it back when it closes.
  // One that simply appeared on arrival does not: taking focus from someone who
  // has already started to read or type would be rude.
  useEffect(() => {
    if (!editing) return;
    const opener = document.activeElement;
    panelRef.current?.focus();
    return () => {
      if (opener instanceof HTMLElement && opener !== document.body && opener.isConnected) opener.focus();
    };
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') consent.dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editing]);

  return <section className="consent" ref={panelRef} tabIndex={-1} aria-labelledby={`${id}-title`} aria-describedby={`${id}-text`}>
    <h2 className="consent-title" id={`${id}-title`}>{editing ? 'Your cookie settings' : 'A quick word about cookies'}</h2>
    <p className="consent-text" id={`${id}-text`}>
      We keep this site free of advertising and tracking. One small cookie remembers your choice, and anything optional stays off unless you switch it on.{' '}
      {/* A plain anchor on purpose: the site navigates with native anchors. */}
      <a href="/cookies">Read the Cookie Policy</a>
    </p>

    {/* Closed panels stay mounted but hidden, so the toggle can point at them. */}
    <div className="consent-options" id={`${id}-options`} hidden={!expanded}>
      <div className="consent-option">
        <div className="consent-option-copy">
          <label htmlFor={`${id}-necessary`}>Strictly necessary</label>
          <p id={`${id}-necessary-note`}>Remembers your choice here. The site cannot do what you asked without it, so it is always on.</p>
        </div>
        <input className="consent-switch" type="checkbox" role="switch" id={`${id}-necessary`} aria-describedby={`${id}-necessary-note`} aria-checked="true" checked disabled />
      </div>
      <div className="consent-option">
        <div className="consent-option-copy">
          <label htmlFor={`${id}-analytics`}>Analytics</label>
          <p id={`${id}-analytics-note`}>Would show us which pages are read. We do not use any today; if we add it, it will only run when this is on.</p>
        </div>
        <input className="consent-switch" type="checkbox" role="switch" id={`${id}-analytics`} aria-describedby={`${id}-analytics-note`} aria-checked={analytics} checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
      </div>
    </div>

    <div className="consent-actions">
      <button type="button" className="consent-button" onClick={() => consent.save({ analytics: false })}>Reject all</button>
      <button type="button" className="consent-button" onClick={() => consent.save({ analytics: true })}>Accept all</button>
    </div>
    {expanded
      ? <button type="button" className="consent-button consent-save" onClick={() => consent.save({ analytics })}>Save my choices</button>
      : null}
    {editing
      ? null
      : <button type="button" className="consent-customise" aria-expanded={expanded} aria-controls={`${id}-options`} onClick={() => setExpanded((open) => !open)}>
        Customise <ChevronDown size={14} aria-hidden="true"/>
      </button>}
  </section>;
}
