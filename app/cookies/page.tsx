import type { Metadata } from 'next';
import { company } from '@/lib/company';
import LegalPage, { Facts, Mail } from '../legal-page';
import CookieSettingsButton from '../cookie-settings-button';

const title = 'Cookie Policy';
const description = 'The one cookie this website sets, what it is for, how long it lasts, and how to change your choice about optional cookies.';

export const metadata: Metadata = {
  title: `${title} | Yumani Automation`,
  description,
  alternates: { canonical: '/cookies' },
  openGraph: { url: '/cookies', title: `${title} | Yumani Automation`, description },
};

export default function CookiePolicy() {
  return <LegalPage
    title={title}
    lead="This website sets one small cookie, to remember what you chose here. Nothing optional runs unless you switch it on."
    sections={[
      {
        id: 'what',
        title: 'What cookies are',
        body: <>
          <p>Cookies are small files that a website stores in your browser. Similar technologies, such as local storage, do the same job, and this policy covers them too. In this policy, “cookies” means all of them.</p>
          <p>{company.name}, the operator of {company.site}, is responsible for the cookies described here. Our details are in the <a href="/privacy#controller">Privacy Policy</a>.</p>
        </>,
      },
      {
        id: 'used',
        title: 'What this website uses',
        body: <>
          <p>Before you answer the cookie banner, the website stores nothing on your device. After you answer, it stores this:</p>
          <Facts rows={[
            ['Name', <span className="figure" key="name">yumani_consent</span>],
            ['Set by', 'Us (a first-party cookie), only after you have made a choice.'],
            ['Purpose', 'Remembers whether you accepted or rejected optional cookies, so we respect your choice and do not ask again on every page.'],
            ['Category', 'Strictly necessary.'],
            ['Lasts', '180 days (about six months), then we ask again.'],
            ['Contains', 'Your choice, the date you made it and the version of the notice. No name, email address, IP address or identifier.'],
          ]}/>
          <p>That is the complete list.</p>
        </>,
      },
      {
        id: 'not-used',
        title: 'What it does not use',
        body: <>
          <ul>
            <li>No advertising or tracking cookies, and no profiling.</li>
            <li>No third-party cookies, social media buttons or tracking pixels.</li>
            <li>Nothing stored for the contact survey: your answers stay in the page while you fill it in, and are not kept in your browser.</li>
            <li>No embedded content from other websites. Even the fonts are served from our own site, so loading a page makes no request to anyone else.</li>
          </ul>
        </>,
      },
      {
        id: 'optional',
        title: 'Optional cookies',
        body: <>
          <p>The cookie banner offers one optional category, <strong>analytics</strong>, which would help us see which pages are read. We do not use any analytics today, so switching it on or off changes nothing for now.</p>
          <p>If we ever add analytics, or anything else optional, it will be off until you turn it on, it will load only after you have, and this page will list each cookie in it before it goes live. Whenever the notice changes in a way that matters, the banner will ask you again.</p>
        </>,
      },
      {
        id: 'law',
        title: 'Why only one cookie needs no consent',
        body: <>
          <p>Slovak law (section 109(8) of Act No. 452/2021 Coll. on Electronic Communications, which implements the EU ePrivacy Directive) says we need your consent before we store information on your device or read it, unless doing so is strictly necessary to provide something you asked for.</p>
          <p>Remembering your cookie choice is that kind of exception: without it we could not honour your choice. Anything else would need your consent first.</p>
        </>,
      },
      {
        id: 'choices',
        title: 'Changing your choice',
        body: <>
          <p>You can change or withdraw your choice at any time, as easily as you gave it. Use the button below, or the “Cookie settings” link at the bottom of every page.</p>
          <div className="legal-actions"><CookieSettingsButton className="consent-button">Open cookie settings</CookieSettingsButton></div>
          <p>You can also delete cookies in your browser’s settings, or set your browser to block them. If you delete ours, we will simply ask you again on your next visit.</p>
        </>,
      },
      {
        id: 'more',
        title: 'More information',
        body: <>
          <p>How we handle personal data in general, and your rights over it, are explained in the <a href="/privacy">Privacy Policy</a>. For questions about cookies, write to <Mail/>.</p>
          <p>If we change the cookies we use, we will update this page and the date at the top.</p>
        </>,
      },
    ]}
  />;
}
