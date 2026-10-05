import type { ReactNode } from 'react';
import { company, legalUpdated } from '@/lib/company';
import PageBar from './page-bar';
import SiteFooter from './site-footer';
// Imported here, from a server module, so the styles are inlined with the page
// like the rest of the site's CSS.
import './legal.css';

export type LegalSection = { id: string; title: string; body: ReactNode };

/**
 * The shell shared by the privacy, cookie and terms pages: a quiet bar with the
 * wordmark, a heading, a contents list that follows the reader, and the numbered
 * sections. The text itself lives in each page, so the wording stays easy to read
 * and easy to change.
 */
export default function LegalPage({ title, lead, sections }: { title: string; lead: ReactNode; sections: LegalSection[] }) {
  return <div id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <PageBar/>
    <main id="main" className="legal wrap">
      <header className="legal-intro">
        <p className="legal-kicker">Legal</p>
        <h1>{title}</h1>
        <p className="legal-lead">{lead}</p>
        <p className="legal-updated">Last updated <time dateTime={legalUpdated.iso}>{legalUpdated.label}</time></p>
      </header>
      <nav className="legal-toc" aria-label="On this page">
        <p className="legal-toc-label">On this page</p>
        <ol>
          {sections.map(({ id, title: sectionTitle }, index) => <li key={id}><a href={`#${id}`}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{sectionTitle}</a></li>)}
        </ol>
      </nav>
      <div className="legal-body">
        {sections.map(({ id, title: sectionTitle, body }, index) => <section key={id} id={id} aria-labelledby={`${id}-title`}>
          <h2 id={`${id}-title`}><span className="legal-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{sectionTitle}</h2>
          {body}
        </section>)}
      </div>
    </main>
    <SiteFooter/>
  </div>;
}

/** Labelled facts in a column: who, what, why, how long. */
export function Facts({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return <dl className="legal-facts">
    {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl>;
}

export function Mail() {
  return <a href={`mailto:${company.email}`}>{company.email}</a>;
}
