import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // The whole site is one page with about 13 KB of compressed CSS. Inlining it
    // removes three render-blocking requests from the first paint, which matters
    // more here than caching the stylesheets for a second visit.
    inlineCss: true,
  },
};

export default nextConfig;
