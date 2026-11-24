import { exports } from 'cloudflare:workers';
import { expect, it } from 'vitest';

it('health returns 200 ok', async () => {
  const res = await exports.default.fetch('https://psych.test/api/health');
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

it('API responses carry the security headers (_headers does not apply to Worker responses)', async () => {
  const res = await exports.default.fetch('https://psych.test/api/health');
  expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
  expect(res.headers.get('strict-transport-security')).toBe('max-age=63072000; includeSubDomains');
  expect(res.headers.get('content-security-policy')).toBe("default-src 'none'; frame-ancestors 'none'");
});
