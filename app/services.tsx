'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import ServiceIcon from './service-icons';
// services.css is imported by page.tsx: CSS imported here, in a client module,
// would be fetched again as a stylesheet when this chunk loads, on top of the
// copy already inlined in the page.

// Each service borrows one of the four icons: brackets for code, a record for
// bespoke systems, a strand joining two points for integration, and a new
// piece fitted to an existing one for AI added to what is already there.
const services = [
  { id: 'web', icon: 'software', title: 'Web applications', challenge: 'When the work lives in emails and spreadsheets.', description: 'Portals for your customers, tools for your team, systems for bookings and orders. Web applications that run in any browser, on any device, with nothing to install and one version of the truth.', examples: ['Customer and partner portals', 'Booking and ordering systems', 'Internal tools and dashboards'] },
  { id: 'software', icon: 'systems', title: 'Custom software', challenge: 'When ready-made tools don’t fit your work.', description: 'Some processes are too specific for off-the-shelf software. We build systems around the way your organisation really works, from records and approvals to planning and reporting, shaped with the people who use them.', examples: ['Records and case management', 'Approval workflows', 'Planning and reporting'] },
  { id: 'integration', icon: 'automation', title: 'System integration', challenge: 'When the same data is typed in twice.', description: 'Accounting, CRM, spreadsheets and your suppliers’ systems rarely talk to each other, so people do it for them. We connect them, so data moves on its own, stays consistent and arrives where it’s needed.', examples: ['Links between existing systems', 'Automated imports and exports', 'One source of shared data'] },
  { id: 'ai', icon: 'solutions', title: 'Practical AI', challenge: 'When there is more to read than time to read it.', description: 'We add AI to the systems you already run, where it earns its place: reading and sorting documents, pulling out the details that matter, finding answers in what you already know. People still make the decisions.', examples: ['Document reading and data extraction', 'Search across your own documents', 'Drafts for a person to review'] },
] as const;

type ServiceId = (typeof services)[number]['id'];

// A single-open disclosure list, written out rather than pulled from a UI kit:
// four items do not need a 50 KB component library. Closed panels stay mounted
// but inert, so the height can animate and search engines still read them.
export default function Services() {
  const [open, setOpen] = useState<ServiceId | null>('web');
  const listRef = useRef<HTMLDivElement>(null);

  // Arrow keys, Home and End move between the headers, as in the WAI-ARIA
  // accordion pattern.
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const triggers = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('.service-trigger') ?? []);
    const index = triggers.indexOf(event.currentTarget);
    const last = triggers.length - 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? last : event.key === 'ArrowDown' ? (index === last ? 0 : index + 1) : (index === 0 ? last : index - 1);
    event.preventDefault();
    triggers[next]?.focus();
  };

  return (
    <div className="service-list" ref={listRef}>
      {services.map(({ id, icon, title, challenge, description, examples }) => {
        const expanded = open === id;
        return (
          <div key={id} className="service-item" data-reveal="">
            <h3 className="service-heading">
              <button
                type="button"
                className="service-trigger"
                id={`service-trigger-${id}`}
                aria-expanded={expanded}
                aria-controls={`service-panel-${id}`}
                aria-describedby={`service-challenge-${id}`}
                onClick={() => setOpen(expanded ? null : id)}
                onKeyDown={moveFocus}
              >
                <ServiceIcon kind={icon}/>
                <span className="service-label">
                  <span className="service-title">{title}</span>
                  <span className="service-challenge" id={`service-challenge-${id}`} aria-hidden="true">{challenge}</span>
                </span>
                <span className="service-toggle" aria-hidden="true"><span/><span/></span>
              </button>
            </h3>
            <section className="service-panel" id={`service-panel-${id}`} aria-labelledby={`service-trigger-${id}`} data-open={expanded} inert={!expanded}>
              <div className="service-panel-clip">
                <div className="service-content">
                  <div className="service-detail-copy"><p>{description}</p></div>
                  <div className="service-examples">
                    <p className="service-examples-label">What that can look like</p>
                    <ul>{examples.map(example => <li key={example}>{example}</li>)}</ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
