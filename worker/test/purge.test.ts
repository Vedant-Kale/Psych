import { createExecutionContext, createScheduledController, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { purgeOld } from '../src/db/purge';
import worker, { type Env } from '../src/index';
import { utcDay } from '../src/order/limits';

const day = 24 * 60 * 60_000;
const NOW = Date.UTC(2026, 11, 31, 3, 0, 0);

async function seed(now: number) {
  const old = now - 31 * day;
  const fresh = now - 29 * day;
  await env.DB.batch([
    env.DB.prepare('INSERT INTO unknown_questions (text, created_at) VALUES (?, ?)').bind('old question', old),
    env.DB.prepare('INSERT INTO unknown_questions (text, created_at) VALUES (?, ?)').bind('fresh question', fresh),
    env.DB.prepare('INSERT INTO rate_limits (key, ts) VALUES (?, ?)').bind('old-key', old),
    env.DB.prepare('INSERT INTO rate_limits (key, ts) VALUES (?, ?)').bind('fresh-key', fresh),
    env.DB.prepare('INSERT INTO ai_budget (day, calls) VALUES (?, 5)').bind(utcDay(old)),
    env.DB.prepare('INSERT INTO ai_budget (day, calls) VALUES (?, 5)').bind(utcDay(fresh)),
  ]);
}

const count = async (sql: string) => (await env.DB.prepare(sql).first<{ n: number }>())!.n;

describe('purgeOld', () => {
  it('deletes rows older than 30 days, keeps newer, returns deleted count', async () => {
    await seed(NOW);
    expect(await purgeOld(env.DB, NOW)).toBe(3);
    expect(await count("SELECT COUNT(*) AS n FROM unknown_questions WHERE text = 'old question'")).toBe(0);
    expect(await count("SELECT COUNT(*) AS n FROM unknown_questions WHERE text = 'fresh question'")).toBe(1);
    expect(await count("SELECT COUNT(*) AS n FROM rate_limits WHERE key = 'fresh-key'")).toBe(1);
    expect(await count('SELECT COUNT(*) AS n FROM ai_budget')).toBe(1);
    expect(await purgeOld(env.DB, NOW)).toBe(0);
  });
});

describe('scheduled handler', () => {
  it('runs the purge', async () => {
    const now = Date.now();
    await seed(now);
    const before = await count('SELECT COUNT(*) AS n FROM unknown_questions');
    const ctx = createExecutionContext();
    await worker.scheduled(createScheduledController({ scheduledTime: now, cron: '0 3 * * *' }), env as unknown as Env, ctx);
    await waitOnExecutionContext(ctx);
    expect(await count('SELECT COUNT(*) AS n FROM unknown_questions')).toBe(before - 1);
  });
});
