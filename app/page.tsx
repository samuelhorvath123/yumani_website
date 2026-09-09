import { ArrowUpRight, ArrowDown, ArrowRight, Building2, Landmark, Sparkles, Check, HeartHandshake } from 'lucide-react';
import Services from './services';

const contactHref = 'mailto:samuel.horvath@yumaniautomation.com?subject=Let%E2%80%99s%20build%20something%20with%20Yumani';

function Brand() {
  return <a className="brand" href="#top" aria-label="Yumani Automation, home"><svg viewBox="0 0 38 40" fill="none" aria-hidden="true"><path d="M7 8L19 22M31 8L19 22V33" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="31" cy="30" r="3" fill="currentColor"/></svg><span className="brand-name">yumani<span className="brand-descriptor">automation</span></span></a>;
}

export default function Home() {
  return <div id="top">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header wrap">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#services">What we do</a><a href="#approach">How we work</a><a href="#about">About us</a></nav>
      <a className="nav-contact" href={contactHref}>Let’s talk <ArrowUpRight size={16} aria-hidden="true"/></a>
    </header>
    <main id="main">
      <div className="opening">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-art" aria-hidden="true"><img src="/images/yumani-ribbon.jpg" alt="" width="1536" height="1024" fetchPriority="high"/></div>
          <div className="hero-copy">
            <p className="eyebrow"><span className="little-spark" aria-hidden="true">✳</span> Technology with a human purpose</p>
            <h1 id="hero-title">More time for<br/><span>what matters.</span></h1>
            <p className="hero-description">We build software that takes care of the repetitive.<br className="desktop-break"/> So your people can get back to ideas, decisions,<br className="desktop-break"/> and the work only they can do.</p>
            <div className="hero-actions"><a className="primary-link" href={contactHref}>Let’s build something <ArrowUpRight size={18} aria-hidden="true"/></a><a className="text-link" href="#services">Explore what we do <ArrowDown size={16} aria-hidden="true"/></a></div>
          </div>
          <div className="hero-bottom"><span>Thoughtfully built. Made for tomorrow.</span><span className="art-caption"><span/> More possibility. Less routine.</span></div>
        </section>
        <div className="audience wrap"><p>A better everyday for</p><span><Building2 size={18} aria-hidden="true"/> Businesses</span><span><Landmark size={18} aria-hidden="true"/> Institutions</span><span><Sparkles size={18} aria-hidden="true"/> The people behind them</span></div>
      </div>

      <section className="services-section wrap" id="services" aria-labelledby="services-title">
        <div className="section-intro">
          <p className="section-label">What we do</p>
          <h2 id="services-title">Your challenges.<br/>Our kind of work.</h2>
          <p>From the task that takes an hour every morning to the system your whole organisation depends on. We make technology work for you.</p>
          <a className="text-link blue-link" href={contactHref}>Tell us what you have in mind <ArrowUpRight size={16} aria-hidden="true"/></a>
          <div className="small-note"><span className="note-line"/><span>Built around your needs.<br/>Never the other way around.</span></div>
        </div>
        <Services />
      </section>

      <section className="belief-section" id="about" aria-labelledby="belief-title">
        <div className="belief-inner wrap">
          <div className="belief-heading"><span className="belief-symbol" aria-hidden="true">✳</span><p className="section-label">The Yumani way</p><h2 id="belief-title">The future should<br/>feel more <span>human.</span></h2></div>
          <div className="belief-copy"><p className="belief-lead">Better technology starts with<br className="desktop-break"/> caring about the people using it.</p><p>We’re a small, hands-on team with an appetite for hard problems. We listen closely, ask the right questions, and put the work in until the details feel right.</p><p>Our ambition is simple: help businesses and institutions make the most of this century, and give their people room to do meaningful work.</p><div className="quality-promise"><Check size={17} aria-hidden="true"/><span>Plenty of possibilities. No shortcuts on quality.</span></div></div>
        </div>
        <div className="belief-principles wrap"><span><span>01</span> People before processes</span><span><span>02</span> Care in every detail</span><span><span>03</span> Built to keep moving forward</span></div>
      </section>

      <section className="approach-section wrap" id="approach" aria-labelledby="approach-title">
        <div className="approach-heading"><div><p className="section-label">How we work</p><h2 id="approach-title">Good things start<br/>with a conversation.</h2></div><p>We work closely with you, from the first question to the final details. Clear communication, shared decisions, and a team that cares as much as you do.</p></div>
        <ol className="process-list">
          <li><div className="process-top"><span>01</span><ArrowRight size={20} aria-hidden="true"/></div><h3>First, we listen.</h3><p>We get to know your people, your processes, and what’s getting in the way. Together, we define what better looks like.</p></li>
          <li><div className="process-top"><span>02</span><ArrowRight size={20} aria-hidden="true"/></div><h3>Then, we build.</h3><p>We turn the right ideas into working software. You see progress, share feedback, and help shape the solution as it takes form.</p></li>
          <li><div className="process-top"><span>03</span><Check size={20} aria-hidden="true"/></div><h3>Ready for the real world.</h3><p>We test the details, help your team get comfortable, and launch with a clear plan for what comes next.</p></li>
        </ol>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div className="contact-inner wrap"><div className="contact-heading"><p className="contact-kicker"><HeartHandshake size={20} strokeWidth={1.4} aria-hidden="true"/> Big idea or everyday challenge?</p><h2 id="contact-title">Let’s make room<br/>for <span>what’s next.</span></h2></div><div className="contact-copy"><p>Tell us what’s on your mind.<br/>We’ll figure out what’s possible, together.</p><a className="primary-link" href={contactHref}>Start a conversation <ArrowUpRight size={18} aria-hidden="true"/></a><a className="email-link" href="mailto:samuel.horvath@yumaniautomation.com">samuel.horvath@yumaniautomation.com <ArrowUpRight size={13} aria-hidden="true"/></a></div></div>
      </section>
    </main>
    <footer className="site-footer wrap"><div className="footer-top"><Brand/><p>Less routine. More human.</p><a className="back-top" href="#top">Back to top <ArrowUpRight size={15} aria-hidden="true"/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} yumani automation s.r.o.</span><span>Thoughtfully built, down to the last detail.</span></div></footer>
  </div>;
}
