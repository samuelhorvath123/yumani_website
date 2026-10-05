import type { Metadata } from 'next';
import { company } from '@/lib/company';
import LegalPage, { Facts, Mail } from '../legal-page';

const title = 'Terms and Conditions';
const description = 'The terms for using the Yumani Automation website: what it is for, how you may use it, who owns what, and which law applies.';

export const metadata: Metadata = {
  title: `${title} | Yumani Automation`,
  description,
  alternates: { canonical: '/terms' },
  openGraph: { url: '/terms', title: `${title} | Yumani Automation`, description },
};

export default function Terms() {
  return <LegalPage
    title={title}
    lead="The ground rules for using this website, in plain language. Our work for clients is covered by its own written agreement."
    sections={[
      {
        id: 'about',
        title: 'About these terms',
        body: <>
          <p>These terms apply when you use {company.site} (the “website”), which is operated by {company.name} (“Yumani”, “we”, “us”). By using the website you agree to them. If you do not agree, please do not use it.</p>
          <p>They are terms for the website only. They are not the terms on which we provide services; see “What the website is for” below.</p>
        </>,
      },
      {
        id: 'who',
        title: 'Who we are',
        body: <>
          <Facts rows={[
            ['Company', company.name],
            ['Registered office', `${company.street}, ${company.city}, ${company.country}`],
            ['Company ID (IČO)', <span className="figure" key="ico">{company.ico}</span>],
            ['Register', company.register],
            ['Email', <Mail key="mail"/>],
          ]}/>
        </>,
      },
      {
        id: 'purpose',
        title: 'What the website is for',
        body: <>
          <p>The website tells you about the work we do and makes it easy to get in touch. It is information, not an offer: nothing on it is an offer to conclude a contract, a quotation, or a promise of any result.</p>
          <p>We provide services only under a written agreement that both sides have signed or confirmed, which sets out the scope, price and terms of the work. If anything on the website conflicts with such an agreement, the agreement wins.</p>
        </>,
      },
      {
        id: 'use',
        title: 'Using the website',
        body: <>
          <p>You are welcome to read the website, share its address and link to it. You agree not to:</p>
          <ul>
            <li>try to gain unauthorised access to the website or the systems behind it, or test their security without our written permission;</li>
            <li>interfere with the website or overload it, including with automated requests at a rate that affects other visitors;</li>
            <li>introduce malware or anything else harmful;</li>
            <li>use the website for anything unlawful, or to give the impression that you are us or act for us.</li>
          </ul>
          <p>If you find a security problem, we would rather hear about it than not. Please write to <Mail/>.</p>
        </>,
      },
      {
        id: 'contact',
        title: 'Contacting us',
        body: <>
          <p>Writing to us, by email or through the contact survey, does not create a client relationship or a contract. Please do not send passwords, sensitive personal data or confidential business material until we have agreed how to handle it, for example under a confidentiality agreement.</p>
          <p>How we handle what you send is explained in the <a href="/privacy">Privacy Policy</a>.</p>
        </>,
      },
      {
        id: 'ownership',
        title: 'Who owns what',
        body: <>
          <p>The text, design, artwork, wordmark and code of the website belong to us or are used with permission, and are protected by copyright and other law, including the Slovak Copyright Act.</p>
          <p>You may view the website and print pages for your own use, including for judging whether to work with us. You may not copy, adapt or reuse its content for commercial purposes without our written permission.</p>
          <p>The website’s typeface, Manrope, is used under the SIL Open Font License.</p>
        </>,
      },
      {
        id: 'accuracy',
        title: 'Accuracy and availability',
        body: <>
          <p>We take care to keep the website correct and current, but it is provided “as is”. We do not promise that it is complete, free of errors or always available, and we may change or withdraw any part of it, or the whole website, at any time.</p>
        </>,
      },
      {
        id: 'liability',
        title: 'Our liability',
        body: <>
          <p>To the extent the law allows, we are not liable for loss that arises from using the website, from being unable to use it, or from relying on what it says.</p>
          <p>Nothing in these terms limits or excludes any liability that cannot be limited or excluded by law, including liability for damage caused intentionally, or any rights you have as a consumer.</p>
        </>,
      },
      {
        id: 'links',
        title: 'Other websites',
        body: <>
          <p>If the website links to other websites, we do not control them and are not responsible for their content or how they handle your data.</p>
        </>,
      },
      {
        id: 'privacy',
        title: 'Privacy and cookies',
        body: <>
          <p>How we handle personal data is explained in the <a href="/privacy">Privacy Policy</a>, and how the website uses cookies in the <a href="/cookies">Cookie Policy</a>. Both are part of how we ask you to use the website, but they are not terms of a contract.</p>
        </>,
      },
      {
        id: 'changes',
        title: 'Changes to these terms',
        body: <>
          <p>We may update these terms, for example when the website changes or the law does. The current version is always on this page, with its date at the top. If you keep using the website after a change, you accept the updated terms.</p>
        </>,
      },
      {
        id: 'law',
        title: 'Governing law',
        body: <>
          <p>These terms, and any dispute that arises from them or from your use of the website, are governed by the law of the Slovak Republic. The courts of the Slovak Republic have jurisdiction, unless mandatory rules give you the right to bring or defend a claim elsewhere.</p>
          <p>The website is intended for businesses and institutions. If you are a consumer, nothing in these terms reduces the protection that mandatory consumer law gives you.</p>
        </>,
      },
    ]}
  />;
}
