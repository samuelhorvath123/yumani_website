/**
 * The visitor's cookie choice: what is remembered, how it is written, and the
 * small store the banner and the footer share.
 *
 * Nothing optional runs on the site today. The choice is recorded anyway, so an
 * optional tool added later (analytics, say) has something honest to ask:
 *
 *   const { record } = consent.getSnapshot();
 *   if (record?.analytics) startAnalytics();
 *   consent.subscribe(() => { ... });   // fires when the choice changes
 *
 * Bump CONSENT_VERSION whenever a new optional category is added or the meaning
 * of an existing one changes. Every stored choice from an older version is then
 * ignored and the banner asks again.
 */
export const CONSENT_COOKIE = 'yumani_consent';
export const CONSENT_VERSION = 1;
// Six months, then we ask again. Keep in step with the Cookie Policy.
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type ConsentChoices = {
  /** Optional measurement of which pages are read. Off unless the visitor opts in. */
  analytics: boolean;
};

export type ConsentRecord = ConsentChoices & {
  version: number;
  /** When the choice was made, in seconds since the epoch. */
  savedAt: number;
};

export type ConsentReady = {
  ready: true;
  /** The stored choice, or null while the visitor has not made one. */
  record: ConsentRecord | null;
  /** True when the visitor reopened the banner to change an earlier choice. */
  editing: boolean;
};
// Until the browser has been asked (on the server, and while hydrating) there is
// nothing to show.
export type ConsentState = { ready: false } | ConsentReady;

export type ConsentEnvironment = {
  /** The page's cookie string, as document.cookie returns it. */
  readCookies: () => string;
  writeCookie: (cookie: string) => void;
  /** Milliseconds since the epoch. */
  now: () => number;
  /** Whether the page is served over HTTPS, which decides the Secure flag. */
  secure: () => boolean;
};

function readCookie(cookies: string, name: string): string | null {
  for (const part of cookies.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return null;
}

/**
 * The stored choice, or null when there is none worth trusting: no cookie, one
 * that does not parse, one from an older notice, or one older than it should be.
 * Null always means "ask again", never "assume yes".
 */
export function parseConsent(cookies: string, nowMs: number): ConsentRecord | null {
  const raw = readCookie(cookies, CONSENT_COOKIE);
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof value !== 'object' || value === null) return null;
    const { v, analytics, at } = value as Record<string, unknown>;
    if (v !== CONSENT_VERSION) return null;
    if (typeof analytics !== 'boolean') return null;
    if (typeof at !== 'number' || !Number.isFinite(at)) return null;
    const age = nowMs / 1000 - at;
    if (age < 0 || age > CONSENT_MAX_AGE_SECONDS) return null;
    return { version: v, analytics, savedAt: at };
  } catch {
    return null;
  }
}

export function serializeConsent(record: ConsentRecord, secure: boolean): string {
  const value = encodeURIComponent(
    JSON.stringify({ v: record.version, analytics: record.analytics, at: record.savedAt }),
  );
  return `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function createConsentStore(env: ConsentEnvironment) {
  let state: ConsentReady | undefined;
  const listeners = new Set<() => void>();

  const current = (): ConsentReady => {
    state ??= { ready: true, record: parseConsent(env.readCookies(), env.now()), editing: false };
    return state;
  };
  const publish = (next: ConsentReady) => {
    state = next;
    for (const listener of listeners) listener();
  };

  return {
    /** Stable between changes, as useSyncExternalStore requires. */
    getSnapshot: (): ConsentReady => current(),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    save(choices: ConsentChoices): ConsentRecord {
      const record: ConsentRecord = {
        version: CONSENT_VERSION,
        analytics: choices.analytics,
        savedAt: Math.floor(env.now() / 1000),
      };
      env.writeCookie(serializeConsent(record, env.secure()));
      publish({ ready: true, record, editing: false });
      return record;
    },
    /** Opens the banner again so the visitor can change their mind. */
    reopen() {
      publish({ ...current(), editing: true });
    },
    /** Closes a reopened banner without changing the choice. */
    dismiss() {
      const { record } = current();
      if (record) publish({ ready: true, record, editing: false });
    },
  };
}
