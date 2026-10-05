type ServiceKind = 'window' | 'measure' | 'link' | 'page';

/** Open contours and detached points echo Yumani’s ribbon and background grid.
 *  Strokes that animate carry service-icon-trace and draw themselves when a service
 *  opens. Each one is its own path with pathLength="1": the draw is one dash along a
 *  single stroke, so two strokes sharing a path would each be a fraction of it and
 *  finish within the first few percent of the animation. */
export default function ServiceIcon({ kind }: { kind: ServiceKind }) {
  return (
    <svg className="service-icon" data-kind={kind} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {kind === 'window' && <>
        <rect className="service-icon-surface" x="14" y="25" width="8" height="8" rx="2" stroke="none"/>
        <path d="M24 12H12a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h12M26 26h9M26 31h5"/>
        {/* The title bar sweeps across as the frame closes round it, so it never sticks out
            past a side that has not been drawn yet. */}
        <path className="service-icon-trace service-icon-trace-bar" pathLength="1" d="M8 20h32"/>
        <path className="service-icon-trace" pathLength="1" d="M24 12h12a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H24"/>
        <circle cx="12.5" cy="16" r="1.3" fill="currentColor" stroke="none"/>
      </>}
      {kind === 'measure' && <>
        <rect className="service-icon-surface" x="15" y="19" width="24" height="19" rx="3"/>
        <path d="M20 26h14M20 31h8"/>
        {/* Two dimension lines, one along the top and one down the left. Each is measured
            the way a draughtsman would: an arrowhead, the line across, the far arrowhead. */}
        <path className="service-icon-trace service-icon-trace-head" pathLength="1" d="M18 8.5 15 11l3 2.5"/>
        <path className="service-icon-trace service-icon-trace-line" pathLength="1" d="M15 11h24"/>
        <path className="service-icon-trace service-icon-trace-tail" pathLength="1" d="M36 8.5 39 11l-3 2.5"/>
        <path className="service-icon-trace service-icon-trace-head" pathLength="1" d="M5.5 22 8 19l2.5 3"/>
        <path className="service-icon-trace service-icon-trace-line" pathLength="1" d="M8 19v19"/>
        <path className="service-icon-trace service-icon-trace-tail" pathLength="1" d="M5.5 35 8 38l2.5-3"/>
      </>}
      {kind === 'link' && <>
        <path className="service-icon-surface" d="M13 29h3c3 0 4-4 5.5-8C23.5 15.5 25.6 11 32 11h3v8h-3c-3 0-4 4-5.5 8C24.5 32.5 22.4 37 16 37h-3Z" stroke="none"/>
        <path className="service-icon-trace" pathLength="1" d="M13 33h3c9 0 6-18 16-18h3"/>
        <circle cx="8" cy="33" r="2"/>
        <circle cx="40" cy="15" r="2"/>
      </>}
      {kind === 'page' && <>
        <rect className="service-icon-surface" x="15" y="19" width="14" height="5" rx="1.5" stroke="none"/>
        <path className="service-icon-trace" pathLength="1" d="M27 41H14a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h13l8 8v6"/>
        <path className="service-icon-trace service-icon-trace-fold" pathLength="1" d="M27 7v8h8"/>
        <path d="M16 21.5h12M16 29h6M16 34h4"/>
        <path className="service-icon-spark" d="M35 32c.45 3.1 2.4 5.05 5.5 5.5-3.1.45-5.05 2.4-5.5 5.5-.45-3.1-2.4-5.05-5.5-5.5 3.1-.45 5.05-2.4 5.5-5.5z" fill="currentColor" stroke="none"/>
      </>}
    </svg>
  );
}
