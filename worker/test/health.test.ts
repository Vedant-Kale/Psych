import { exports } from 'cloudflare:workers';
import { expect, it } from 'vitest';

it('health returns 200 ok', async () => {
  const res = await exports.default.fetch('https://psych.test/api/health');
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});
