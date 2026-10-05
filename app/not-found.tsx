import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page not found | Yumani Automation',
  description: 'That page is not here. Everything about Yumani Automation lives on one page.',
};

export default function NotFound() {
  return <main className="not-found wrap">
    <p className="not-found-code">404</p>
    <h1 className="not-found-title">That page isn’t here.</h1>
    <p className="not-found-copy">The link may be old, or the address may have a typo. Everything we do lives on one page, and it is one click away.</p>
    {/* A plain anchor on purpose: this project runs on vinext, which ships no
        next/link runtime, and the whole site navigates with native anchors. */}
    {/* eslint-disable-next-line next/no-html-link-for-pages */}
    <a className="primary-link" href="/">Back to the start <ArrowUpRight size={18} aria-hidden="true"/></a>
    <p className="not-found-legal">yumani automation s. r. o. · IČO 57307253 · Šaldova 10831/7, 831 07 Bratislava – Vajnory, Slovakia</p>
  </main>;
}
