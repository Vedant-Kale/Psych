import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { checkRate, ipKey, takeBudget, utcDay } from '../src/order/limits';

const T0 = Date.UTC(2026, 10, 24, 9, 0, 0);
const min = 60_000;

describe('ipKey', () => {
  it('never equals or contains the raw ip', async () => {
    for (const ip of ['203.0.113.7', '2001:db8::1']) {
      const key = await ipKey(ip, 'salt', '2026-11-24');
      expect(key).toMatch(/^[0-9a-f]{64}$/);
      expect(key).not.toContain(ip);
    }
  });

  it('changes with the day and the salt', async () => {
    const a = await ipKey('203.0.113.7', 'salt', '2026-11-24');
    expect(await ipKey('203.0.113.7', 'salt', '2026-11-25')).not.toBe(a);
    expect(await ipKey('203.0.113.7', 'other', '2026-11-24')).not.toBe(a);
  });
});

describe('checkRate', () => {
  it('6th request inside 10 minutes is blocked', async () => {
    const results = [];
    for (let i = 0; i < 6; i++) results.push(await checkRate(env.DB, 'k-burst', T0 + i * min));
    expect(results).toEqual([true, true, true, true, true, false]);
    expect(await checkRate(env.DB, 'k-burst', T0 + 11 * min)).toBe(true);
  });

  it('31st request in a UTC day is blocked', async () => {
    let allowed = 0;
    for (let i = 0; i < 31; i++) if (await checkRate(env.DB, 'k-day', T0 + i * 11 * min)) allowed++;
    expect(allowed).toBe(30);
  });

  it('blocked requests are not counted', async () => {
    for (let i = 0; i < 8; i++) await checkRate(env.DB, 'k-blocked', T0);
    const { n } = (await env.DB.prepare('SELECT COUNT(*) AS n FROM rate_limits WHERE key = ?').bind('k-blocked').first<{ n: number }>())!;
    expect(n).toBe(5);
  });

  it('no raw IP is stored anywhere', async () => {
    const key = await ipKey('198.51.100.23', 'salt', utcDay(T0));
    await checkRate(env.DB, key, T0);
    const { results } = await env.DB.prepare('SELECT * FROM rate_limits').all();
    expect(JSON.stringify(results)).not.toContain('198.51.100.23');
  });
});

describe('takeBudget', () => {
  it('allows exactly cap calls', async () => {
    const day = Date.UTC(2026, 0, 1, 12);
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await takeBudget(env.DB, day, 3));
    expect(results).toEqual([true, true, true, false]);
  });

  it('two concurrent takes at cap-1 → exactly one true', async () => {
    const day = Date.UTC(2026, 0, 2, 12);
    for (let i = 0; i < 9; i++) await takeBudget(env.DB, day, 10);
    const both = await Promise.all([takeBudget(env.DB, day, 10), takeBudget(env.DB, day, 10)]);
    expect(both.filter(Boolean)).toHaveLength(1);
  });

  it('new UTC day starts at zero', async () => {
    const lastMs = Date.UTC(2026, 0, 3, 23, 59, 59, 999);
    expect(await takeBudget(env.DB, lastMs, 1)).toBe(true);
    expect(await takeBudget(env.DB, lastMs, 1)).toBe(false);
    expect(await takeBudget(env.DB, lastMs + 1, 1)).toBe(true);
  });
});
