import type { Metadata } from 'next';
import { company } from '@/lib/company';
import LegalPage, { Facts, Mail } from '../legal-page';
import CookieSettingsButton from '../cookie-settings-button';

const title = 'Privacy Policy';
const description = 'What personal data Yumani Automation handles when you visit this website or write to us, why, for how long, and what your rights are.';

export const metadata: Metadata = {
  title: `${title} | Yumani Automation`,
  description,
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy', title: `${title} | Yumani Automation`, description },
};

export default function PrivacyPolicy() {
  return <LegalPage
    title={title}
    lead="What we do with personal data when you visit this website or write to us. The short version: very little, and never for advertising."
    sections={[
      {
        id: 'controller',
        title: 'Who is responsible',
        body: <>
          <p>{company.name} (“Yumani”, “we”, “us”) decides why and how the personal data described in this policy is used. In data protection terms, we are the controller.</p>
          <Facts rows={[
            ['Company', company.name],
            ['Registered office', `${company.street}, ${company.city}, ${company.country}`],
            ['Company ID (IČO)', <span className="figure" key="ico">{company.ico}</span>],
            ['Register', company.register],
            ['Privacy contact', <Mail key="mail"/>],
          ]}/>
          <p>We have not appointed a data protection officer. Anything about privacy that you send to the address above reaches the person who handles it.</p>
        </>,
      },
      {
        id: 'scope',
        title: 'What this policy covers',
        body: <>
          <p>This policy covers this website, {company.site}, the contact survey on it, and the emails you send us because of it. It does not cover the work we do for clients.</p>
          <p>When we build or run software for a client and personal data passes through it, we handle that data on the client’s instructions under a separate agreement, and the client’s own privacy notice applies to it.</p>
        </>,
      },
      {
        id: 'data',
        title: 'What we collect, and why',
        body: <>
          <p>There are four situations in which we handle personal data through this website. The website has no accounts and no newsletter.</p>

          <h3>When you visit</h3>
          <Facts rows={[
            ['Data', 'What your browser sends with every request: your IP address, the date and time, the page requested, the type of browser and device, the page you came from and whether the request succeeded.'],
            ['Why', 'To deliver the website to you, keep it running and secure, and investigate abuse.'],
            ['Legal basis', 'Our legitimate interest in running a secure website (Article 6(1)(f) GDPR).'],
            ['Kept for', 'In the server logs of our hosting provider, for the period the provider sets, and then deleted. We do not keep our own copy and we do not use it to track or profile you.'],
          ]}/>

          <h3>When you send the contact survey</h3>
          <p>The survey is sent from this website to our email delivery provider, which passes it on to our mailbox. The website itself stores nothing. To tell people from scripts, the survey checks a hidden field and how long the form took to fill in; nothing about that is kept.</p>
          <Facts rows={[
            ['Data', 'Your answers: what you would like help with, what takes too long today, how soon you would like to start, your name, your email address and, if you give it, your organisation. Your browser also sends the technical data described above with the request.'],
            ['Why', 'To read your answers, reply to you and, if you ask for one, prepare a proposal.'],
            ['Legal basis', 'Taking steps at your request before a contract (Article 6(1)(b) GDPR). Where your answers are not about a contract, our legitimate interest in answering business enquiries (Article 6(1)(f)).'],
            ['Kept for', 'It arrives as an email, so it is kept like one: if no work follows, we delete it within 24 months of the last message. If we do work together, the contract and the law decide.'],
          ]}/>

          <h3>When you email us</h3>
          <p>The email links on this website open your own email app. Nothing is sent from this website, and nothing is stored when you click. The message travels from your email provider to ours.</p>
          <Facts rows={[
            ['Data', 'Your email address, your name if you give it, what you write or attach, and our replies.'],
            ['Why', 'To read your message, reply, understand what you need and, if you ask for one, prepare a proposal.'],
            ['Legal basis', 'Taking steps at your request before a contract (Article 6(1)(b) GDPR). Where your message is not about a contract, our legitimate interest in answering business enquiries (Article 6(1)(f)).'],
            ['Kept for', 'If no work follows, we delete the conversation within 24 months of the last message. If we do work together, the contract and the law decide: invoices and other accounting records are kept for ten years under Slovak accounting law.'],
          ]}/>

          <h3>When you choose how we use cookies</h3>
          <Facts rows={[
            ['Data', 'Your choice about optional cookies, the date you made it and the version of the notice you answered, in one small cookie in your browser. It holds no name, email address or identifier.'],
            ['Why', 'To remember your choice, so we respect it and do not ask again on every page.'],
            ['Legal basis', 'Our legal obligation to respect your choice and our legitimate interest in not asking repeatedly (Article 6(1)(c) and (f) GDPR).'],
            ['Kept for', 'Six months in your browser, then we ask again. The Cookie Policy has the details.'],
          ]}/>
        </>,
      },
      {
        id: 'never',
        title: 'What we do not do',
        body: <>
          <ul>
            <li>This website does not use analytics, advertising or tracking tools, and it loads no third-party fonts, scripts or embedded content. Its fonts are hosted by us. If that ever changes, we will update this policy first and ask for your consent wherever the law requires it.</li>
            <li>We do not sell personal data or share it for anyone else’s marketing.</li>
            <li>We do not profile visitors, and we make no decisions about people by automated means.</li>
            <li>We do not knowingly collect data from children. The website is written for businesses and institutions.</li>
          </ul>
        </>,
      },
      {
        id: 'recipients',
        title: 'Who receives your data',
        body: <>
          <p>Only the people and providers who need it to do the jobs described above:</p>
          <ul>
            <li><strong>Our hosting provider</strong>, which delivers the website and keeps its logs.</li>
            <li><strong>Our email delivery provider</strong>, which carries the contact survey from the website to our mailbox.</li>
            <li><strong>Our email provider</strong>, which stores our correspondence.</li>
            <li><strong>Professional advisers</strong>, such as accountants and lawyers, when a matter needs them. They are bound by confidentiality.</li>
            <li><strong>Public authorities</strong>, when the law requires us to disclose something.</li>
          </ul>
          <p>Providers act on our instructions under a data processing agreement and may not use your data for their own purposes.</p>
        </>,
      },
      {
        id: 'transfers',
        title: 'Transfers outside the EU',
        body: <>
          <p>Some of our providers may process data outside the European Economic Area, including in the United States. Where they do, the transfer relies on an adequacy decision of the European Commission (for example, the EU–US Data Privacy Framework for certified providers) or on the Commission’s standard contractual clauses, with further safeguards where they are needed.</p>
          <p>You can ask us for details of the safeguards in use at <Mail/>.</p>
        </>,
      },
      {
        id: 'rights',
        title: 'Your rights',
        body: <>
          <p>You have the right to:</p>
          <ul>
            <li>ask whether we hold personal data about you, and get a copy of it;</li>
            <li>have inaccurate data corrected;</li>
            <li>have your data erased, where the law gives you that right;</li>
            <li>ask us to restrict how we use it;</li>
            <li>receive the data you gave us in a common, machine-readable format, where it is processed by automated means on the basis of consent or a contract;</li>
            <li>object to processing that rests on our legitimate interest;</li>
            <li>withdraw consent at any time. This does not affect anything done before you withdrew. You can change your cookie choice with <CookieSettingsButton/>.</li>
          </ul>
          <p>Write to <Mail/>. We will reply within one month. For complex requests the law allows us to extend that by up to two further months, and we will tell you why. We may need to confirm who you are before we act on a request. It is free, unless a request is clearly unfounded or excessive.</p>
        </>,
      },
      {
        id: 'complaints',
        title: 'Complaints',
        body: <>
          <p>If you think we have handled your data unlawfully, you can complain to the supervisory authority. In Slovakia that is the Úrad na ochranu osobných údajov Slovenskej republiky (Office for Personal Data Protection of the Slovak Republic), Galvaniho 7/B, 821 04 Bratislava, Slovakia, at <a href="https://dataprotection.gov.sk" rel="noopener">dataprotection.gov.sk</a>. If you live elsewhere in the EU, you can complain to the authority in your own country.</p>
          <p>We would be glad of the chance to put things right first, but you do not have to contact us before you complain.</p>
        </>,
      },
      {
        id: 'security',
        title: 'Keeping data safe',
        body: <>
          <p>This website is served over an encrypted connection (HTTPS), and access to our correspondence is limited to the people who need it.</p>
          <p>No system is perfectly secure, and ordinary email is not end-to-end encrypted. If you need to send us something sensitive, ask us for a safer way before you send it.</p>
        </>,
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        body: <>
          <p>When what we do changes, we update this page and the date at the top. If a change matters to you, such as a new use of your data, we will say so here plainly rather than leave it for you to spot.</p>
        </>,
      },
    ]}
  />;
}
