import type { Metadata } from 'next';
import { company } from '@/lib/company';
import PageBar from '../page-bar';
import SiteFooter from '../site-footer';
import ContactSurvey from '../contact-survey';
// Imported here, from a server module, so the styles are inlined with the page.
import '../contact.css';

const title = 'Contact';
const description = 'Tell Yumani Automation what takes too long today. Four short questions, and your answers go straight to our inbox.';

export const metadata: Metadata = {
  title: `${title} | Yumani Automation`,
  description,
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact', title: `${title} | Yumani Automation`, description },
};

export default function Contact() {
  return <div id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <PageBar/>
    <main id="main" className="contact-page wrap">
      <div className="contact-intro">
        <p className="contact-kicker">Contact</p>
        <h1>Tell us what<br/>takes too long.</h1>
        <p className="contact-lead">Four short questions, about two minutes. Your answers go straight to our inbox, and we reply with honest next steps, even if the answer is that you do not need us.</p>
        <p className="contact-direct">Prefer to write? <a href={`mailto:${company.email}`}>{company.email}</a></p>
        {/* The survey is a form that runs in the browser; without that, email is the way in. */}
        <noscript><p className="contact-direct">The survey needs JavaScript. Please write to us at <a href={`mailto:${company.email}`}>{company.email}</a> instead.</p></noscript>
      </div>
      <ContactSurvey/>
    </main>
    <SiteFooter/>
  </div>;
}
