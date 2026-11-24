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

      <h2>Pages</h2>
      <p>
        The site is static pages served by Cloudflare. Cloudflare processes each request to deliver it, under its own
        privacy policy. Reading the site stores nothing about you.
      </p>

      <h2>The Order</h2>
      <p>The Order is the bar where you describe the engineer you need. When you place an order:</p>
      <ul className="list">
        <li>
          <strong>A human check</strong> by Cloudflare Turnstile runs in your browser first, under Cloudflare&apos;s
          privacy policy.
        </li>
        <li>
          <strong>Your order is answered by Cloudflare Workers AI</strong> from excerpts of this site&apos;s own posts
          and projects. Cloudflare doesn&apos;t use it to train AI models. Answered orders aren&apos;t stored.
        </li>
        <li>
          <strong>Orders nothing here can answer</strong> are kept as text only, with no IP address or account, for 30
          days so the owner can write about them, then deleted.
        </li>
        <li>
          <strong>Rate-limit counters</strong> keep a one-way hash of your IP address mixed with a daily secret, never
          the address itself, for 30 days, then deleted.
        </li>
      </ul>
      <p>This page will change before anything new is collected.</p>
    </main>
  );
}
