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
// The accordion's styles, imported from the server so they are inlined with the
// rest of the page rather than loaded by the client chunk (see services.tsx).
import './services.css';

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

      <section className="approach-section wrap" id="approach" aria-labelledby="approach-title">
        <div className="approach-heading" data-reveal=""><div><h2 id="approach-title">Good things start<br/>with a conversation.</h2></div><p>Every project follows the same three steps, whatever its size, so you always know where we are, what comes next and why.</p></div>
        <ol className="process-list">
          <li data-reveal=""><div className="process-top"><span>01</span></div><h3>First, we listen.</h3><p>We talk to the people who do the work, map where the time goes, and agree on what better looks like, with an estimate you can plan around.</p></li>
          <li data-reveal=""><div className="process-top"><span>02</span></div><h3>Then, we build.</h3><p>In short rounds, with working software to try every few weeks. You tell us what’s off, the next round fixes it, and nothing big is decided without you.</p></li>
          <li data-reveal=""><div className="process-top"><span>03</span></div><h3>Ready for the real world.</h3><p>We test with real data, move your existing records across, help your team get comfortable, and stay close after launch for fixes, questions and the next improvement.</p></li>
        </ol>
      </section>

      <section className="audience-section wrap" id="who" aria-labelledby="audience-title">
        <div className="audience-heading" data-reveal="">
          <div><h2 id="audience-title">Every organisation is really<br/>a few people holding it together.</h2></div>
          <p>Software should hand those people their time back, not give them another system to serve. That is who we build for, in companies, schools, hospitals and city offices alike.</p>
        </div>
        <ul className="audience-list">
          {audience.map(({ who, detail }) => <li key={who} data-reveal=""><span>{who}</span><p>{detail}</p></li>)}
        </ul>
        <div className="fit-block" data-reveal="">
          <h3 className="fit-title">When we’re not the right fit</h3>
          <dl className="fit-list">
            <div><dt>You need it finished by Friday.</dt><dd>Real work takes weeks. Pretending otherwise would be the first thing we got wrong.</dd></div>
            <div><dt>The decision will be made on price alone.</dt><dd>We are not the cheapest, and we would rather say that now than surprise you later.</dd></div>
            <div><dt>Nobody on your side can spare an hour a week.</dt><dd>Someone who knows how the work really runs has to be in the room, or we are only guessing.</dd></div>
            <div><dt>You want AI because everyone else has it.</dt><dd>We add AI where it saves real time, and we’ll tell you when a simple rule would do the job better.</dd></div>
          </dl>
        </div>
      </section>
    </main>
    <ClosingScreen/>
  </div>;
}
