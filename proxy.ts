import { NextResponse, type NextRequest } from 'next/server';

// Baseline security headers for document responses. Static assets are covered
// by public/_headers instead, so the matcher skips them.
export default function proxy(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // HTTPS only from here on. Subdomains are left out on purpose until each one
  // is known to serve HTTPS.
  response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|fonts|images|favicon.svg).*)'],
};
