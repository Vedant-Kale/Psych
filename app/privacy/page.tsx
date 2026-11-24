import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What PSYCH collects, why, and how long it is kept.',
};

export default function PrivacyPage() {
  return (
    <main className="page">
      <h1>Privacy</h1>
      <p className="lead">PSYCH sets no cookies and runs no ads or trackers.</p>

      <h2>Today</h2>
      <p>
        The site is static pages served by Cloudflare. Cloudflare processes each request to deliver it, under its own
        privacy policy. PSYCH itself stores nothing about you.
      </p>

      <h2>When The Order opens</h2>
      <p>The Order is the bar where you describe what you need. When it launches it will keep only:</p>
      <ul className="list">
        <li>
          <strong>Questions it couldn&apos;t answer</strong>: the text only, with no IP address or account. Kept 30
          days so the owner can write about them, then deleted.
        </li>
        <li>
          <strong>Rate-limit counters</strong>: a one-way hash of your IP address mixed with a daily secret, never the
          address itself. Kept 30 days, then deleted.
        </li>
      </ul>
      <p>Questions are answered by Cloudflare Workers AI. Cloudflare doesn&apos;t use them to train AI models.</p>
      <p>This page will change before anything new is collected.</p>
    </main>
  );
}
