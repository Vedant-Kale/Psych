import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PSYCH — Vedant Kale', template: '%s — PSYCH — Vedant Kale' },
  description: 'An immersive portfolio by Vedant Kale, AI engineer.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
