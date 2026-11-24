import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from '../src/order/turnstile';

const PASS = '1x0000000000000000000000000000000AA';
const FAIL = '2x0000000000000000000000000000000AA';

/** Stands in for siteverify: Cloudflare's test secrets always pass (1x…) or always fail (2x…). */
const siteverify = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
  const secret = (init?.body as FormData).get('secret');
  return Response.json({ success: secret === PASS });
});

describe('verifyTurnstile', () => {
  it('passes with the 1x… secret and fails with the 2x… secret', async () => {
    expect(await verifyTurnstile('tok', PASS, '203.0.113.7', siteverify)).toBe(true);
    expect(await verifyTurnstile('tok', FAIL, '203.0.113.7', siteverify)).toBe(false);
  });

  it('sends token, secret and visitor IP to siteverify', async () => {
    siteverify.mockClear();
    await verifyTurnstile('tok', PASS, '203.0.113.7', siteverify);
    const [url, init] = siteverify.mock.calls[0]!;
    expect(String(url)).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    const form = init?.body as FormData;
    expect([form.get('response'), form.get('remoteip')]).toEqual(['tok', '203.0.113.7']);
  });

  it('network error → false', async () => {
    expect(await verifyTurnstile('tok', PASS, '', () => Promise.reject(new Error('offline')))).toBe(false);
  });

  it('non-JSON or non-200 reply → false', async () => {
    expect(await verifyTurnstile('tok', PASS, '', async () => new Response('oops', { status: 500 }))).toBe(false);
  });

  it('missing secret → false (fail closed)', async () => {
    expect(await verifyTurnstile('tok', '', '', siteverify)).toBe(false);
  });
});
