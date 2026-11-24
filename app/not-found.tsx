import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Not found' };

/** Replaces Next's default 404, which uses inline styles the CSP blocks. */
export default function NotFound() {
  return (
    <main className="page">
      <h1>Nothing on this table</h1>
      <p className="lead">That page doesn&apos;t exist.</p>
      <p>
        <Link href="/facts/">Go to the facts</Link> or <Link href="/">back to the start</Link>.
      </p>
    </main>
  );
}
