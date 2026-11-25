import { createExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { recordTurn } from '../src/db/turns';
import worker from '../src/index';

const cid = (n: number) => `signal-conversation-${n}`.padEnd(30, 'x');
let ipSeq = 0;
const post = (body: unknown, ip = `198.18.0.${++ipSeq}`, raw = false) =>
  worker.fetch(
    new Request('https://psych.test/api/signal', {
      method: 'POST',
      body: raw ? (body as string) : JSON.stringify(body),
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
    }),
    env,
    createExecutionContext(),
  );
const turn = (conversationId: string) => recordTurn(env.DB, { conversationId, text: 'an engineer', kind: 'mix', chunkIds: [], now: Date.now() });
const count = async (sql: string, ...args: unknown[]) => (await env.DB.prepare(sql).bind(...args).first<{ n: number }>())!.n;

describe('POST /api/signal', () => {
  it('stores a signal for a turn of that conversation and answers 204 with no body', async () => {
    const id = cid(1);
    const turnId = await turn(id);
    const res = await post({ conversationId: id, turnId, type: 'yes' });
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const row = await env.DB.prepare('SELECT * FROM signals WHERE conversation_id = ?').bind(id).first();
    expect(row).toMatchObject({ turn_id: turnId, type: 'yes' });
    expect(Object.keys(row!).sort()).toEqual(['conversation_id', 'created_at', 'id', 'turn_id', 'type']);
  });

  it.each(['yes', 'no', 'opened-source', 'receipt', 'interview'])('accepts %s', async (type) => {
    const id = cid(2);
    const turnId = await turn(id);
    expect((await post({ conversationId: id, turnId, type })).status).toBe(204);
  });

  it("rejects a turn that belongs to another conversation, or that doesn't exist, and stores nothing", async () => {
    const mine = cid(3);
    const theirs = cid(4);
    const theirTurn = await turn(theirs);
    expect((await post({ conversationId: mine, turnId: theirTurn, type: 'no' })).status).toBe(400);
    expect((await post({ conversationId: mine, turnId: 999_999, type: 'no' })).status).toBe(400);
    expect(await count('SELECT COUNT(*) AS n FROM signals WHERE conversation_id IN (?, ?)', mine, theirs)).toBe(0);
  });

  it('rejects a bad type, bad conversation id, bad turn id or a non-object body', async () => {
    const id = cid(5);
    const turnId = await turn(id);
    const bad: unknown[] = [
      { conversationId: id, turnId, type: 'upvote' },
      { conversationId: id, turnId, type: 5 },
      { conversationId: 'short', turnId, type: 'yes' },
      { conversationId: id, turnId: 0, type: 'yes' },
      { conversationId: id, turnId: -1, type: 'yes' },
      { conversationId: id, turnId: 1.5, type: 'yes' },
      { conversationId: id, turnId: String(turnId), type: 'yes' },
      { conversationId: id, type: 'yes' },
      ['yes'],
      null,
    ];
    for (const b of bad) expect((await post(b)).status).toBe(400);
    expect((await post('not json{', undefined, true)).status).toBe(400);
    expect((await post('x'.repeat(5_000), undefined, true)).status).toBe(400);
    expect(await count('SELECT COUNT(*) AS n FROM signals WHERE conversation_id = ?', id)).toBe(0);
  });

  it('keeps at most 20 signals per conversation, across different IPs', async () => {
    const id = cid(6);
    const turnId = await turn(id);
    for (let i = 0; i < 20; i++) expect((await post({ conversationId: id, turnId, type: 'opened-source' })).status).toBe(204);
    expect((await post({ conversationId: id, turnId, type: 'yes' })).status).toBe(400);
    expect(await count('SELECT COUNT(*) AS n FROM signals WHERE conversation_id = ?', id)).toBe(20);
  });

  it('rate-limits one visitor (IP hash) with a 429, and stores no raw IP', async () => {
    const ip = '203.0.113.200';
    let limited = 0;
    for (let i = 0; i < 25; i++) {
      const id = cid(100 + i);
      const turnId = await turn(id);
      if ((await post({ conversationId: id, turnId, type: 'yes' }, ip)).status === 429) limited++;
    }
    expect(limited).toBeGreaterThan(0);
    const keys = await env.DB.prepare('SELECT DISTINCT key FROM rate_limits').all<{ key: string }>();
    expect(JSON.stringify(keys.results)).not.toContain(ip);
  });

  it('only accepts application/json, so a cross-site form post cannot send a signal', async () => {
    const id = cid(11);
    const turnId = await turn(id);
    const res = await worker.fetch(
      new Request('https://psych.test/api/signal', {
        method: 'POST',
        body: JSON.stringify({ conversationId: id, turnId, type: 'yes' }),
        headers: { 'content-type': 'text/plain', 'cf-connecting-ip': '198.18.8.8' },
      }),
      env,
      createExecutionContext(),
    );
    expect(res.status).toBe(415);
    expect(await count('SELECT COUNT(*) AS n FROM signals WHERE conversation_id = ?', id)).toBe(0);
  });

  it('fails closed without the IP salt', async () => {
    const id = cid(7);
    const turnId = await turn(id);
    const res = await worker.fetch(
      new Request('https://psych.test/api/signal', {
        method: 'POST',
        body: JSON.stringify({ conversationId: id, turnId, type: 'yes' }),
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.18.9.9' },
      }),
      { ...env, IP_SALT_SECRET: '' },
      createExecutionContext(),
    );
    expect(res.status).toBe(503);
    expect(await count('SELECT COUNT(*) AS n FROM signals WHERE conversation_id = ?', id)).toBe(0);
  });
});

describe('POST /api/order — turn id and closest work', () => {
  const layer = { skill: 'Secure multi-tenant data', evidence_ids: ['expense-track#0'], rationale: 'Forces row-level security on every table.' };
  const orderFrom = (text: string, AI: unknown, conversationId?: string) =>
    worker.fetch(
      new Request('https://psych.test/api/order', {
        method: 'POST',
        body: JSON.stringify({ text, turnstileToken: 'tok', ...(conversationId ? { conversationId } : {}) }),
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': `198.19.0.${++ipSeq}` },
      }),
      { ...env, ORDER_ENABLED: 'true', AI },
      createExecutionContext(),
    );
  const ai = (layers: unknown[]) => ({ run: async () => ({ response: { layers } }) });

  it('a stored answer carries its turnId, matching the stored row', async () => {
    const { vi } = await import('vitest');
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ success: true }));
    const id = cid(8);
    const body = (await (await orderFrom('an engineer who understands row-level security', ai([layer]), id)).json()) as { kind: string; turnId: number };
    expect(body.kind).toBe('mix');
    const row = await env.DB.prepare('SELECT id FROM turns WHERE conversation_id = ?').bind(id).first<{ id: number }>();
    expect(body.turnId).toBe(row!.id);

    const noId = (await (await orderFrom('an engineer who understands row-level security', ai([layer]))).json()) as Record<string, unknown>;
    expect(noId).not.toHaveProperty('turnId');
    vi.restoreAllMocks();
  });

  it("a 'none' answer with retrieved evidence names the closest documented work", async () => {
    const { vi } = await import('vitest');
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ success: true }));
    const body = (await (await orderFrom('an engineer who understands row-level security', ai([]), cid(9))).json()) as { kind: string; closest?: string };
    expect(body.kind).toBe('none');
    expect(body.closest).toMatch(/^[a-z0-9-]+#\d+$/);

    const nothing = (await (await orderFrom('zzzqqq xxyyzz', ai([]), cid(10))).json()) as { kind: string; closest?: string };
    expect(nothing.kind).toBe('none');
    expect(nothing).not.toHaveProperty('closest');
    vi.restoreAllMocks();
  });
});
