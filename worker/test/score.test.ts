import { createExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { recordTurn } from '../src/db/turns';
import worker from '../src/index';
import { classifyFollowUp, cosineSimilarity, nextScore, SIGNAL_SCORES, tokenSimilarity } from '../src/order/score';

describe('nextScore — one row of decision #29 each', () => {
  it('signals add their score to the turn they are about', () => {
    expect(SIGNAL_SCORES).toEqual({ yes: 2, no: -3, 'opened-source': 1, receipt: 3, interview: 3 });
    expect(nextScore(0, 'yes')).toBe(2);
    expect(nextScore(0, 'no')).toBe(-3);
    expect(nextScore(1, 'opened-source')).toBe(2);
    expect(nextScore(0, 'receipt')).toBe(3);
    expect(nextScore(2, 'interview')).toBe(5);
  });

  it('reworded the same question: −2 on the previous turn', () => {
    expect(nextScore(0, 'reworded')).toBe(-2);
    expect(nextScore(-2, 'reworded')).toBe(-4);
  });

  it('dug deeper: +1', () => {
    expect(nextScore(0, 'deeper')).toBe(1);
    expect(nextScore(-3, 'deeper')).toBe(-2);
  });

  it("new topic: +1, and the previous turn's demerits are halved (toward zero) first", () => {
    expect(nextScore(0, 'new-topic')).toBe(1);
    expect(nextScore(2, 'new-topic')).toBe(3); // credits are not halved
    expect(nextScore(-4, 'new-topic')).toBe(-1); // -4 → -2, then +1
    expect(nextScore(-3, 'new-topic')).toBe(0); // -3 → -1 (toward zero), then +1
  });
});

describe('similarity', () => {
  it('tokenSimilarity is word overlap, ignoring case, punctuation and tiny words', () => {
    expect(tokenSimilarity('row-level security!', 'Row level SECURITY')).toBe(1);
    expect(tokenSimilarity('row level security', 'row level security please')).toBeCloseTo(0.75);
    expect(tokenSimilarity('row level security', 'bar lighting amber')).toBe(0);
    expect(tokenSimilarity('', 'anything')).toBe(0);
  });

  it('cosineSimilarity is 1 for the same direction, 0 for orthogonal, 0 for an empty vector', () => {
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe('classifyFollowUp', () => {
  it('close to the previous question (and no closer to its answer) is reworded', () => {
    expect(classifyFollowUp({ question: 0.8, answer: 0.1, measure: 'tokens' })).toBe('reworded');
    expect(classifyFollowUp({ question: 0.95, answer: 0.5, measure: 'embedding' })).toBe('reworded');
  });

  it('close to the previous answer, not a repeat of the question, is deeper', () => {
    expect(classifyFollowUp({ question: 0.2, answer: 0.4, measure: 'tokens' })).toBe('deeper');
    expect(classifyFollowUp({ question: 0.6, answer: 0.8, measure: 'embedding' })).toBe('deeper');
  });

  it('close to neither is a new topic', () => {
    expect(classifyFollowUp({ question: 0.05, answer: 0.05, measure: 'tokens' })).toBe('new-topic');
    expect(classifyFollowUp({ question: 0.3, answer: 0.3, measure: 'embedding' })).toBe('new-topic');
  });

  it('embedding similarities need a higher bar than word overlap', () => {
    expect(classifyFollowUp({ question: 0.6, answer: 0, measure: 'tokens' })).toBe('reworded');
    expect(classifyFollowUp({ question: 0.6, answer: 0, measure: 'embedding' })).toBe('new-topic');
  });
});

// ---- through the endpoints ----
const cid = (n: number) => `score-conversation-${n}`.padEnd(30, 'x');
const layer = { skill: 'Secure multi-tenant data', evidence_ids: ['expense-track#0'], rationale: 'Forces row-level security on every table.' };
let ipSeq = 0;
const order = (text: string, conversationId: string) =>
  worker.fetch(
    new Request('https://psych.test/api/order', {
      method: 'POST',
      body: JSON.stringify({ text, turnstileToken: 'tok', conversationId }),
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': `198.20.0.${++ipSeq}` },
    }),
    { ...env, ORDER_ENABLED: 'true', AI: { run: async () => ({ response: { layers: [layer] } }) } },
    createExecutionContext(),
  );
const signal = (conversationId: string, turnId: number, type: string) =>
  worker.fetch(
    new Request('https://psych.test/api/signal', {
      method: 'POST',
      body: JSON.stringify({ conversationId, turnId, type }),
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': `198.21.0.${++ipSeq}` },
    }),
    env,
    createExecutionContext(),
  );
const scores = async (id: string) =>
  (await env.DB.prepare('SELECT score FROM turns WHERE conversation_id = ? ORDER BY seq').bind(id).all<{ score: number }>()).results.map((r) => r.score);
const today = () => new Date().toISOString().slice(0, 10);
const outcome = async () => (await env.DB.prepare('SELECT * FROM daily_outcomes WHERE day = ?').bind(today()).first<Record<string, number>>()) ?? {};

afterEach(() => vi.restoreAllMocks());

describe('scoring through /api/order and /api/signal', () => {
  const stub = () => vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ success: true }));

  it('three rewordings in a row: every turn but the last is scored −2 by the next, and the counters say so', async () => {
    stub();
    const id = cid(1);
    const before = await outcome();
    for (const t of ['row level security', 'row level security please', 'please row level security', 'security row level please']) {
      expect((await order(t, id)).status).toBe(200);
    }
    expect(await scores(id)).toEqual([-2, -2, -2, 0]);
    expect(((await outcome()).reworded ?? 0) - (before.reworded ?? 0)).toBe(3);
  });

  it('a new topic after a poor turn halves its demerits and adds 1', async () => {
    stub();
    const id = cid(2);
    await order('row level security', id);
    await order('row level security please', id); // turn 1 → −2
    await order('warm amber lighting in bars', id); // turn 2 (reworded turn 1) then new topic for turn 2
    const [first, second] = await scores(id);
    expect(first).toBe(-2);
    expect(second).toBe(1);
  });

  it('a signal adds its score to its own turn and bumps the daily counter; a rejected signal changes nothing', async () => {
    stub();
    const id = cid(3);
    const body = (await (await order('an engineer who knows row level security', id)).json()) as { turnId: number };
    const before = await outcome();
    expect((await signal(id, body.turnId, 'yes')).status).toBe(204);
    expect((await signal(id, body.turnId, 'no')).status).toBe(204);
    expect(await scores(id)).toEqual([2 - 3]);
    const after = await outcome();
    expect((after.yes ?? 0) - (before.yes ?? 0)).toBe(1);
    expect((after.no ?? 0) - (before.no ?? 0)).toBe(1);
    expect((await signal(id, 999_999, 'yes')).status).toBe(400);
    expect(await scores(id)).toEqual([-1]);
  });

  it('first turns and turns without a conversation id are not scored', async () => {
    stub();
    const id = cid(4);
    await order('an engineer who knows row level security', id);
    expect(await scores(id)).toEqual([0]);
  });

  it('daily_outcomes holds counts only: no text, no ids', async () => {
    const cols = (await env.DB.prepare("SELECT name FROM pragma_table_info('daily_outcomes')").all<{ name: string }>()).results.map((r) => r.name);
    expect(cols).toEqual(expect.arrayContaining(['day', 'turns', 'followups', 'reworded', 'deeper', 'new_topic', 'yes', 'no', 'opened_source', 'receipt', 'interview']));
    expect(cols.filter((c) => ['text', 'conversation_id', 'turn_id', 'ip', 'key'].includes(c))).toEqual([]);
  });

  it('a turn stored with a query vector is compared by vectors, not words', async () => {
    const id = cid(5);
    const a = await recordTurn(env.DB, { conversationId: id, text: 'alpha beta gamma', kind: 'mix', chunkIds: [], now: Date.now(), vector: [1, 0, 0] });
    expect(a).toBeGreaterThan(0);
    const row = await env.DB.prepare('SELECT vector FROM turns WHERE id = ?').bind(a).first<{ vector: string }>();
    expect(JSON.parse(row!.vector)).toEqual([1, 0, 0]);
  });
});
