'use client';

import type { ReactNode } from 'react';
import { consent } from './consent-store';

/** Opens the cookie banner again, wherever a link to "Cookie settings" is needed. */
export default function CookieSettingsButton({ className = 'link-button', children = 'Cookie settings' }: { className?: string; children?: ReactNode }) {
  return <button type="button" className={className} onClick={() => consent.reopen()}>{children}</button>;
}
