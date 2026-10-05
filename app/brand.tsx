// The wordmark. On the home page it scrolls back to the top; everywhere else it
// goes home. A plain anchor on purpose: the whole site navigates with native
// anchors.
export default function Brand({ href = '/#top' }: { href?: string }) {
  return <a className="brand" href={href} aria-label="Yumani Automation, home"><span className="brand-name">yumani<span className="brand-descriptor"><span className="brand-descriptor-word">automation</span></span></span></a>;
}
