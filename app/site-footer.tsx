import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { company } from '@/lib/company';
import CookieSettingsButton from './cookie-settings-button';
import LegalMenu from './legal-menu';
import './closing.css';

/**
 * The foot of every page, kept to what is needed: who we are, in the words Slovak
 * law requires on a website (the trading name, the registered office, the company
 * ID and the commercial register entry), and one Legal drop-down that holds the policies. On the home page it is the bottom edge of the
 * closing screen; on every other page it stands on its own in the same deep blue.
 * It is never hidden behind a reveal: the identity has to be there the moment the
 * page is.
 */
export default function SiteFooter({ home = false }: { home?: boolean }) {
  const footer = <footer className="closing-foot">
    <div className="closing-foot-inner wrap">
      <div className="closing-id">
        <p>{company.name} · {company.street}, {company.city}, {company.country}</p>
        <p>Company ID (IČO) <span className="figure">{company.ico}</span> · Commercial Register of the Municipal Court Bratislava III, Section Sro, File No. <span className="figure">193404/B</span> · © {new Date().getFullYear()}</p>
      </div>
      <div className="closing-links">
        <LegalMenu>
          <a href="/privacy">Privacy Policy <ArrowUpRight size={15} aria-hidden="true"/></a>
          <a href="/cookies">Cookie Policy <ArrowUpRight size={15} aria-hidden="true"/></a>
          <a href="/terms">Terms and Conditions <ArrowUpRight size={15} aria-hidden="true"/></a>
          <CookieSettingsButton>Cookie settings <SlidersHorizontal size={15} aria-hidden="true"/></CookieSettingsButton>
          <p className="legal-menu-note">No advertising. No tracking without your say-so.</p>
        </LegalMenu>
      </div>
    </div>
  </footer>;
  return home ? footer : <div className="closing-screen closing-compact">{footer}</div>;
}
