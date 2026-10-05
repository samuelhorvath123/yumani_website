type ServiceKind = 'software' | 'automation' | 'systems' | 'solutions';

/** Open contours and detached points echo Yumani’s ribbon and background grid. */
export default function ServiceIcon({ kind }: { kind: ServiceKind }) {
  return (
    <svg className="service-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {kind === 'software' && <>
        <path className="service-icon-surface" d="M14 10h8v7h-5v7h-7V14a4 4 0 0 1 4-4Z" stroke="none"/>
        <path d="M22 10h-8a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h4V24h2"/>
        <path className="service-icon-trace" pathLength="1" d="M26 38h8a4 4 0 0 0 4-4V18a4 4 0 0 0-4-4h-4v10h-2"/>
        <circle cx="24" cy="24" r="1.7" fill="currentColor" stroke="none"/>
      </>}
      {kind === 'automation' && <>
        <path className="service-icon-surface" d="M13 29h3c3 0 4-4 5.5-8C23.5 15.5 25.6 11 32 11h3v8h-3c-3 0-4 4-5.5 8C24.5 32.5 22.4 37 16 37h-3Z" stroke="none"/>
        <path className="service-icon-trace" pathLength="1" d="M13 33h3c9 0 6-18 16-18h3"/>
        <circle cx="8" cy="33" r="2"/>
        <circle cx="40" cy="15" r="2"/>
      </>}
      {kind === 'systems' && <>
        <rect className="service-icon-surface" x="18" y="14" width="14" height="21" rx="3"/>
        <path className="service-icon-trace" pathLength="1" d="M12 12c5 0 2 8 6 8M12 36c5 0 2-8 6-8M32 24h4"/>
        <path d="M22 20h6M22 25h6M22 30h3"/>
        <circle cx="8" cy="12" r="1.7" fill="currentColor" stroke="none"/>
        <circle cx="8" cy="36" r="1.7" fill="currentColor" stroke="none"/>
        <circle cx="40" cy="24" r="1.7" fill="currentColor" stroke="none"/>
      </>}
      {kind === 'solutions' && <>
        <path className="service-icon-surface" d="M22 10h-8a4 4 0 0 0-4 4v20a4 4 0 0 0 4 4h3c0-9 7-11 7-18 0-4-2-6-2-10Z"/>
        <path className="service-icon-trace" pathLength="1" d="M27 10h7a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H22c0-9 7-11 7-18 0-4-2-6-2-10Z"/>
      </>}
    </svg>
  );
}
