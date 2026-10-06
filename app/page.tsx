import { ArrowUpRight, ArrowDown } from 'lucide-react';
import Services from './services';
import HeroExperience from './hero-experience';
import FlowArtwork from './flow-artwork';
import SiteHeader from './site-header';
import MainNav from './main-nav';
import LanguageSwitch from './language-switch';
import Brand from './brand';
import AboutSection from './about-section';
import ClosingScreen from './closing-screen';
import Faq from './faq';
import ProcessSteps from './process-steps';
// The accordion's styles, imported from the server so they are inlined with the
// rest of the page rather than loaded by the client chunk (see services.tsx).
import './services.css';
import './approach.css';
import './faq.css';

// Every contact button leads to the survey. The address stays visible below it for
// anyone who would rather write.
const contactHref = '/contact';

// Listed in the order the page reads, so the marker travels one way as you scroll.
const navItems = [
  { href: '#services', label: 'What we do' },
  { href: '#approach', label: 'How we work' },
  { href: '#about', label: 'About us' },
];

// Who the work is really for. Plain nouns only: no clients to name, so the
// people doing the work are named instead.
const audience = [
  { who: 'The one who keeps the spreadsheet', detail: 'It works because one person remembers every exception. The rules belong in the software, not in one head.' },
  { who: 'The one in the middle', detail: 'Copying data between two systems that were never meant to talk to each other, by hand, every week.' },
  { who: 'The one who signs it off', detail: 'Approving a process nobody has questioned in years, from a pile of attachments.' },
  { who: 'The one who is new', detail: 'Learning the job by watching someone else do it, because nothing is written down.' },
];

// Each step is named by what it leaves you holding. Every line restates something
// this page already promises: none is a result, a figure or a client.
const steps = [
  { number: '1', title: 'First, we listen.', text: 'We talk to the people who do the work, map where the time goes, and agree on what better looks like.', gets: ['A map of where the time goes', 'A shared picture of what “better” looks like', 'An estimate you can plan around'] },
  { number: '2', title: 'Then, we build.', text: 'In short rounds, with working software to try every few weeks. You tell us what’s off, and the next round fixes it.', gets: ['Working software every few weeks', 'Each round shaped by what you tell us', 'Nothing big decided without you'] },
  { number: '3', title: 'Ready for the real world.', text: 'We test with real data, move your existing records across, and help your team get comfortable before we step back.', gets: ['Your existing records, moved across', 'A team that is comfortable with it', 'Fixes, answers and the next improvement'] },
];

export default function Home() {
  return <div id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader>
      <Brand href="#top" />
      <MainNav items={navItems} />
      <div className="nav-actions">
        <LanguageSwitch/>
        <a className="nav-contact" href={contactHref}>Let’s talk <ArrowUpRight size={16} aria-hidden="true"/></a>
      </div>
    </SiteHeader>
    <main id="main">
      <div className="opening">
        <div className="bloom" aria-hidden="true"/>
        <HeroExperience art={<FlowArtwork />}>
            <p className="hero-description">We build custom software, connect your systems, and take repetitive work off your team’s plate.</p>
            <div className="hero-actions"><a className="primary-link" href={contactHref}>Tell us what you need <ArrowUpRight size={18} aria-hidden="true"/></a><a className="text-link" href="#services">See what we do <ArrowDown size={16} aria-hidden="true"/></a></div>
        </HeroExperience>
      </div>

      <section className="services-section" id="services" aria-labelledby="services-title">
        <div className="services-atmosphere-clip" aria-hidden="true">
          <div className="services-atmosphere">
          <div className="bloom"/>
          <picture className="services-ribbon">
            <source type="image/avif" srcSet="/images/yumani-services-ribbon-720.avif 720w, /images/yumani-services-ribbon-1440.avif 1440w, /images/yumani-services-ribbon-2160.avif 2160w" sizes="(max-width: 700px) calc(100vw + 48px), calc(100vw + 80px)"/>
            <source type="image/webp" srcSet="/images/yumani-services-ribbon-720.webp 720w, /images/yumani-services-ribbon-1440.webp 1440w, /images/yumani-services-ribbon-2160.webp 2160w" sizes="(max-width: 700px) calc(100vw + 48px), calc(100vw + 80px)"/>
            <img src="/images/yumani-services-ribbon-1440.webp" width="2172" height="724" alt="" loading="lazy" decoding="async" fetchPriority="low"/>
          </picture>
          </div>
        </div>
        <div className="services-inner wrap">
          <div className="services-heading" data-reveal="">
            <h2 id="services-title">Your challenges.<br/><span>Our kind of work.</span></h2>
          </div>
          <Services />
        </div>
      </section>

      <AboutSection />

      <section className="audience-section wrap" id="who" aria-labelledby="audience-title">
        <div className="audience-heading" data-reveal="">
          <div><h2 id="audience-title">Every organisation is really<br/>a few people holding it together.</h2></div>
          <p>Software should hand those people their time back, not give them another system to serve. That is who we build for, in companies, schools, hospitals and city offices alike.</p>
        </div>
        <ul className="audience-list">
          {audience.map(({ who, detail }) => <li key={who} data-reveal=""><span>{who}</span><p>{detail}</p></li>)}
        </ul>
      </section>

      <section className="approach-section" id="approach" aria-labelledby="approach-title">
        <div className="approach-atmosphere" aria-hidden="true"/>
        <div className="approach-inner wrap">
          <div className="approach-heading" data-reveal=""><div><h2 id="approach-title">Good things start<br/>with <span>a conversation.</span></h2></div><p>Every project follows the same three steps, whatever its size, so you always know where we are, what comes next and why.</p></div>
          <div className="process">
            <picture className="approach-ribbon">
              <source type="image/avif" srcSet="/images/yumani-services-ribbon-720.avif 720w, /images/yumani-services-ribbon-1440.avif 1440w, /images/yumani-services-ribbon-2160.avif 2160w" sizes="(max-width: 700px) calc(100vw + 48px), calc(100vw + 80px)"/>
              <source type="image/webp" srcSet="/images/yumani-services-ribbon-720.webp 720w, /images/yumani-services-ribbon-1440.webp 1440w, /images/yumani-services-ribbon-2160.webp 2160w" sizes="(max-width: 700px) calc(100vw + 48px), calc(100vw + 80px)"/>
              <img src="/images/yumani-services-ribbon-1440.webp" width="2172" height="724" alt="" loading="lazy" decoding="async" fetchPriority="low"/>
            </picture>
            <span className="process-line" aria-hidden="true"><span className="process-line-fill"/></span>
            <ol className="process-list">
              {steps.map(({ number, title, text, gets }) => <li key={number} data-reveal="">
                <span className="process-node" aria-hidden="true"/>
                <span className="process-number" aria-hidden="true">{number}</span>
                <h3>{title}</h3>
                <p className="process-text">{text}</p>
                <div className="process-gets">
                  <p className="process-gets-label">What you get</p>
                  <ul>{gets.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
              </li>)}
            </ol>
            <ProcessSteps />
          </div>
          <p className="process-throughout" data-reveal=""><span>Throughout</span>The same small team from the first call to long after launch, and one person from your side who knows how the work really runs, for about an hour a week.</p>
        </div>
      </section>

      <section className="faq-section wrap" id="faq" aria-labelledby="faq-title">
        <div className="faq-inner">
          <div className="faq-heading" data-reveal="">
            <h2 id="faq-title">Questions worth asking before we start.</h2>
            <p>Short answers to the things most worth knowing early. For anything else, the survey is the quickest way to reach us.</p>
            <a className="text-link blue-link" href={contactHref}>Ask us something else <ArrowUpRight size={16} aria-hidden="true"/></a>
          </div>
          <Faq />
        </div>
      </section>
    </main>
    <ClosingScreen/>
  </div>;
}
