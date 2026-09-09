import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yumani Automation | More time for what matters',
  description: 'Custom software, task automation and information systems for businesses and institutions. Thoughtfully built around your people. No shortcuts on quality.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
