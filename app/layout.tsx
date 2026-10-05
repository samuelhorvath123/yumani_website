import type { Metadata, Viewport } from 'next';
import './globals.css';
import './cookie-consent.css';
import CookieConsent from './cookie-consent';

const title = 'Yumani Automation | More time for what matters';
const description = 'Web applications, custom software, system integration and practical AI for businesses and institutions. Built around your people. No shortcuts on quality.';
const ogImage = { url: '/images/og.jpg', width: 1200, height: 630, alt: 'Yumani Automation. More time for what matters.' };

// Content below the hero rises into place as it reaches the viewport. The bootstrap
// injects the hidden state itself, before the body paints, so nothing flashes in late.
// That keeps the page complete without JavaScript and leaves every element React owns
// untouched, so hydration stays clean.
// The styles are inlined into the page, but React still knows each stylesheet by its
// URL: after hydration it preloads it and inserts a <link> for it (which vinext then
// removes), downloading every file a second time. React skips both when a stylesheet
// link with that URL already exists, and a disabled one is never fetched.
// The same script pauses the drifting light fields while their section is off screen:
// an endless animation nobody can see still keeps the compositor producing frames. It
// writes to its own style element for the same reason as above.
const revealBootstrap = `(function(){var inlined=document.querySelectorAll('style[data-href]');for(var i=0;i<inlined.length;i++){var placeholder=document.createElement('link');placeholder.setAttribute('disabled','');placeholder.rel='stylesheet';placeholder.href=inlined[i].getAttribute('data-href');document.head.appendChild(placeholder);}if(!('IntersectionObserver' in window))return;var style=document.createElement('style');style.textContent="@media screen and (prefers-reduced-motion: no-preference){[data-reveal]:not([data-revealed='true']):not(:focus-within){opacity:0;transform:translate3d(0,var(--rise-depth,56px),0)}}[data-reveal]:focus-within{transition-duration:160ms;transition-delay:0ms}";document.head.appendChild(style);document.addEventListener('DOMContentLoaded',function(){try{var nodes=document.querySelectorAll('[data-reveal]'),observer=new IntersectionObserver(function(entries){for(var i=0;i<entries.length;i++){if(!entries[i].isIntersecting)continue;entries[i].target.setAttribute('data-revealed','true');observer.unobserve(entries[i].target);}},{rootMargin:'0px 0px -12% 0px'});for(var i=0;i<nodes.length;i++)observer.observe(nodes[i]);}catch(error){style.remove();}try{var calm=document.createElement('style'),fields=new Map(),drift=new IntersectionObserver(function(entries){for(var i=0;i<entries.length;i++)fields.get(entries[i].target).hidden=!entries[i].isIntersecting;var css='';fields.forEach(function(field){if(field.hidden)css+=field.selector+' .bloom{animation-play-state:paused}';});calm.textContent=css;});document.head.appendChild(calm);['.opening'].forEach(function(selector){var section=document.querySelector(selector);if(!section)return;fields.set(section,{selector:selector,hidden:false});drift.observe(section);});}catch(error){}});})();`;

// Only facts already published in the commercial register and on the page itself.
// Nothing about clients, results or size, because there is nothing there we could
// honestly claim.
const organisation = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'yumani automation s. r. o.',
  url: 'https://yumaniautomation.com',
  email: 'info@yumaniautomation.com',
  description,
  logo: 'https://yumaniautomation.com/apple-touch-icon.png',
  foundingDate: '2025-11-12',
  taxID: '57307253',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Šaldova 10831/7',
    addressLocality: 'Bratislava – Vajnory',
    postalCode: '831 07',
    addressCountry: 'SK',
  },
  areaServed: { '@type': 'Country', name: 'Slovakia' },
  knowsLanguage: ['en', 'sk'],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://yumaniautomation.com'),
  title,
  description,
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  openGraph: {
    type: 'website',
    siteName: 'Yumani Automation',
    url: '/',
    title,
    description,
    locale: 'en_GB',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage.url],
  },
};

// The pale page colour, so mobile browser chrome carries the brand rather than white.
export const viewport: Viewport = { themeColor: '#f8fafd' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <head>
      {/* The weight that carries the largest above-the-fold text (the h1). The
          wordmark's font is inlined in the stylesheet and needs no preload. */}
      <link rel="preload" href="/fonts/manrope-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
      <script dangerouslySetInnerHTML={{ __html: revealBootstrap }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisation) }}/>
    </head>
    <body><CookieConsent/>{children}</body>
  </html>;
}
