import { ArrowLeft } from 'lucide-react';
import Brand from './brand';
// Imported here, from a server module, so the styles are inlined with the page.
import './page-bar.css';

/** The quiet bar at the top of every page except the home page: the wordmark, and a way back. */
export default function PageBar() {
  return <header className="page-bar wrap">
    <Brand/>
    {/* A plain anchor on purpose: the site navigates with native anchors. */}
    <a className="text-link" href="/"><ArrowLeft size={16} aria-hidden="true"/> Back to the site</a>
  </header>;
}
