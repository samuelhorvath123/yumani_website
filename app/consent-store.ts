import { createConsentStore } from '@/lib/consent';

// One store for the whole page, shared by the banner and every "Cookie settings"
// button. Nothing here touches the browser until a client component asks for the
// snapshot, so importing it on the server is harmless.
export const consent = createConsentStore({
  readCookies: () => document.cookie,
  writeCookie: (cookie) => {
    document.cookie = cookie;
  },
  now: () => Date.now(),
  secure: () => window.location.protocol === 'https:',
});
