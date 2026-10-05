import { ArrowUpRight } from 'lucide-react';
import SiteFooter from './site-footer';
import './closing.css';

/**
 * Where the page ends: one screen of deep blue that holds the invitation and the
 * footer together, so the last thing a visitor meets is a way to begin, with the
 * company's details beneath it rather than on a separate strip.
 */
export default function ClosingScreen() {
  return <div className="closing-screen">
    <section className="closing" id="contact" aria-labelledby="closing-title">
      <div className="closing-main wrap">
        <h2 id="closing-title" data-reveal="">Let’s make room<br/>for <span>what’s next.</span></h2>
        <div className="closing-actions" data-reveal="">
          <a className="primary-link" href="/contact">Start a conversation <ArrowUpRight size={18} aria-hidden="true"/></a>
        </div>
      </div>
    </section>
    <SiteFooter home/>
  </div>;
}
