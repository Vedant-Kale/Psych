import MiniSearch from 'minisearch';
import { createExecutionContext, createScheduledController, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { describe, expect, it, vi } from 'vitest';
import { searchOptions, type Chunk } from '../../lib/search/types';
import { purgeOld } from '../src/db/purge';
import { recordTurn } from '../src/db/turns';
import worker, { type Env } from '../src/index';
import { retrieveHybrid } from '../src/order/retrieve';
import { allowedMove, clampWeight, decayToward, decayWeights, learn, loadWeights, MAX_MOVE_PER_CONVERSATION, MAX_MOVE_PER_DAY, W_MAX, W_MIN } from '../src/order/weights';

const cid = (n: number) => `weights-conversation-${n}`.padEnd(30, 'x');
const NOW = Date.UTC(2026, 11, 25, 12);
const weightOf = async (id: string) => (await env.DB.prepare('SELECT weight FROM chunk_weights WHERE chunk_id = ?').bind(id).first<{ weight: number }>())?.weight;

describe('pure rules', () => {
  it('weights are clamped to [0.5, 2.0]', () => {
    expect([W_MIN, W_MAX]).toEqual([0.5, 2]);
    expect(clampWeight(0.1)).toBe(0.5);
    expect(clampWeight(9)).toBe(2);
    expect(clampWeight(1.3)).toBe(1.3);
    expect(clampWeight(Number.NaN)).toBe(1);
  });

  it('a score change moves a weight 0.01 a point, never past what is left of the caps', () => {
    expect(allowedMove(2, 0, 0)).toBeCloseTo(0.02);
    expect(allowedMove(-3, 0, 0)).toBeCloseTo(-0.03);
    expect(allowedMove(-3, 0.04, 0)).toBeCloseTo(-0.01); // 0.05 per conversation, 0.04 used
    expect(allowedMove(-3, 0.05, 0)).toBe(0);
    expect(allowedMove(3, 0, MAX_MOVE_PER_DAY - 0.01)).toBeCloseTo(0.01); // the day's cap is nearly used
    expect(allowedMove(0, 0, 0)).toBe(0);
    expect(MAX_MOVE_PER_CONVERSATION).toBe(0.05);
  });

  it('decay pulls a weight back toward its starting value', () => {
    expect(decayToward(1.5, 1)).toBeCloseTo(1.49);
    expect(decayToward(0.6, 1)).toBeCloseTo(0.608);
    expect(decayToward(1.3, 1.3)).toBe(1.3);
    expect(decayToward(1.2, 1.5)).toBeCloseTo(1.206);
  });
});

describe('learn', () => {
  it("moves the weights of the chunks it is given, and only those, from 1.0 or from the reviewed base", async () => {
    await learn(env.DB, cid(1), ['expense-track#0'], -3, {}, NOW);
    expect(await weightOf('expense-track#0')).toBeCloseTo(0.97);
    expect(await weightOf('why-bars-light-amber#0')).toBeUndefined();
    await learn(env.DB, cid(2), ['why-bars-light-amber#0'], 2, { 'why-bars-light-amber#0': 1.4 }, NOW);
    expect(await weightOf('why-bars-light-amber#0')).toBeCloseTo(1.42);
  });

  it('one conversation spamming No moves a weight by at most 0.05', async () => {
    for (let i = 0; i < 30; i++) await learn(env.DB, cid(3), ['spam#0'], -3, {}, NOW);
    expect(await weightOf('spam#0')).toBeCloseTo(0.95);
  });

  it('many conversations in one day still move a weight by at most 0.2', async () => {
    for (let i = 0; i < 40; i++) await learn(env.DB, cid(1000 + i), ['day#0'], -3, {}, NOW);
    expect(await weightOf('day#0')).toBeCloseTo(1 - MAX_MOVE_PER_DAY);
    await learn(env.DB, cid(2000), ['day#0'], -3, {}, NOW + 24 * 60 * 60_000); // the next day it can move again
    expect(await weightOf('day#0')).toBeLessThan(1 - MAX_MOVE_PER_DAY);
  });

  it('never leaves [0.5, 2.0], however many days of pressure', async () => {
    for (let day = 0; day < 40; day++) {
      for (let i = 0; i < 5; i++) await learn(env.DB, cid(5000 + day * 10 + i), ['floor#0'], -3, {}, NOW + day * 24 * 60 * 60_000);
    }
    expect(await weightOf('floor#0')).toBe(0.5);
    for (let day = 0; day < 60; day++) {
      for (let i = 0; i < 5; i++) await learn(env.DB, cid(9000 + day * 10 + i), ['ceil#0'], 3, { 'ceil#0': 1.9 }, NOW + day * 24 * 60 * 60_000);
    }
    expect(await weightOf('ceil#0')).toBe(2);
  });

  it('loadWeights returns the base overlaid with what D1 has learned', async () => {
    await learn(env.DB, cid(6), ['load#0'], 2, {}, NOW);
    const w = await loadWeights(env.DB, { 'base-only#0': 1.2, 'load#0': 1.5 });
    expect(w['base-only#0']).toBe(1.2);
    expect(w['load#0']).toBeCloseTo(1.02);
  });
});

describe('decayWeights and purge', () => {
  it('pulls every learned weight a little back toward its base each day', async () => {
    await env.DB.prepare('INSERT INTO chunk_weights (chunk_id, weight, updated_at) VALUES (?, ?, ?)').bind('decay#0', 1.5, NOW).run();
    await env.DB.prepare('INSERT INTO chunk_weights (chunk_id, weight, updated_at) VALUES (?, ?, ?)').bind('decay#1', 1.5, NOW).run();
    await decayWeights(env.DB, { 'decay#1': 1.5 }, NOW);
    expect(await weightOf('decay#0')).toBeCloseTo(1.49);
    expect(await weightOf('decay#1')).toBe(1.5);
  });

  it('the purge deletes old per-conversation move records but keeps the learned weights', async () => {
    const old = NOW - 31 * 24 * 60 * 60_000;
    await learn(env.DB, cid(7), ['keep#0'], 2, {}, old);
    await purgeOld(env.DB, NOW);
    expect((await env.DB.prepare("SELECT COUNT(*) AS n FROM weight_moves WHERE chunk_id = 'keep#0'").first<{ n: number }>())!.n).toBe(0);
    expect(await weightOf('keep#0')).toBeCloseTo(1.02);
  });

  it('the daily scheduled job decays the weights too', async () => {
    await env.DB.prepare('INSERT INTO chunk_weights (chunk_id, weight, updated_at) VALUES (?, ?, ?)').bind('sched#0', 1.5, NOW).run();
    const ctx = createExecutionContext();
    await worker.scheduled(createScheduledController({ scheduledTime: NOW, cron: '0 3 * * *' }), env as unknown as Env, ctx);
    await waitOnExecutionContext(ctx);
    expect(await weightOf('sched#0')).toBeCloseTo(1.49);
  });
});

describe('weights inside retrieval', () => {
  const chunk = (id: string, text: string): Chunk => ({ id, sourceId: id.split('#')[0]!, title: id, text });
  const chunks = [chunk('a#0', 'postgres security basics'), chunk('b#0', 'postgres security deep dive notes here'), chunk('c#0', 'warm amber lighting')];
  const index = (() => {
    const ms = new MiniSearch<Chunk>(searchOptions);
    ms.addAll(chunks);
    return ms.toJSON();
  })();
  const ai = { run: vi.fn(async () => ({ data: [[1, 0, 0]] })) };

  it('re-ranks what retrieval returned, and never adds a chunk it did not return', async () => {
    const plain = await retrieveHybrid(index, {}, ai, 'postgres security');
    expect(plain.map((c) => c.id)).toEqual(['a#0', 'b#0']);
    const boosted = await retrieveHybrid(index, {}, ai, 'postgres security', 6, undefined, { weights: { 'b#0': 2, 'c#0': 2 } });
    expect(boosted.map((c) => c.id)).toEqual(['b#0', 'a#0']); // c#0 has a weight but was not retrieved: not added
    const demoted = await retrieveHybrid(index, {}, ai, 'postgres security', 6, undefined, { weights: { 'a#0': 0.5 } });
    expect(demoted.map((c) => c.id)).toEqual(['b#0', 'a#0']);
  });

  it('clamps a weight outside the bounds when it is used', async () => {
    const wild = await retrieveHybrid(index, {}, ai, 'postgres security', 6, undefined, { weights: { 'b#0': 1e9, 'a#0': -5 } });
    expect(wild.map((c) => c.id)).toEqual(['b#0', 'a#0']);
    const tame = await retrieveHybrid(index, {}, ai, 'postgres security', 6, undefined, { weights: { 'b#0': 2, 'a#0': 0.5 } });
    expect(tame.map((c) => c.id)).toEqual(wild.map((c) => c.id));
  });
});

describe('learning through /api/signal', () => {
  it('a No on a turn lowers the weights of the chunks that answered it by 0.03', async () => {
    const id = cid(8);
    const turnId = await recordTurn(env.DB, { conversationId: id, text: 'an engineer', kind: 'mix', chunkIds: ['sig#0', 'sig#1'], now: Date.now() });
    const res = await worker.fetch(
      new Request('https://psych.test/api/signal', {
        method: 'POST',
        body: JSON.stringify({ conversationId: id, turnId, type: 'no' }),
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.22.0.1' },
      }),
      env,
      createExecutionContext(),
    );
    expect(res.status).toBe(204);
    expect(await weightOf('sig#0')).toBeCloseTo(0.97);
    expect(await weightOf('sig#1')).toBeCloseTo(0.97);
  });
});
