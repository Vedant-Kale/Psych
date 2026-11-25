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
          and projects. Cloudflare doesn&apos;t use it to train AI models.
        </li>
        <li>
          <strong>The full text of your orders</strong> is kept for 30 days, then deleted, so the owner can see which
          questions the site answers badly and improve it. It is stored with a random conversation number, never with
          your IP address or an account. The number is made in your browser tab, kept in that tab&apos;s session
          storage (not a cookie), and forgotten when you close the tab.
        </li>
        <li>
          <strong>A conversation remembers your last three orders</strong>, so a follow-up question makes sense. They
          are sent to Workers AI as part of your next order.
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
