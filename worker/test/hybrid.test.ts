import MiniSearch from 'minisearch';
import { describe, expect, it, vi } from 'vitest';
import { searchOptions, type Chunk } from '../../lib/search/types';
import { MIN_COSINE, retrieveHybrid } from '../src/order/retrieve';

const chunk = (id: string, text: string, title = id): Chunk => ({ id, sourceId: id.split('#')[0]!, title, text });

// "business acumen" shares no word with the story, so only meaning can find it.
const chunks: Chunk[] = [
  chunk('expense-track#0', 'Postgres row-level security is forced on every table.'),
  chunk('bar-story#0', 'I changed the closing routine so the till balanced every night and the owner stopped losing money.', 'Closing the till'),
  chunk('lighting#0', 'Warm, low light steers where people look.'),
];
const index = (() => {
  const ms = new MiniSearch<Chunk>(searchOptions);
  ms.addAll(chunks);
  return ms.toJSON();
})();

// Toy 3-d "embeddings": axis 0 = money/decisions, axis 1 = security, axis 2 = light.
const vectors = { 'bar-story#0': [1, 0, 0], 'expense-track#0': [0, 1, 0], 'lighting#0': [0, 0, 1] };
const ai = (vec: number[]) => ({ run: vi.fn(async () => ({ shape: [1, 3], data: [vec] })) });

describe('retrieveHybrid', () => {
  it('finds by meaning what keyword search cannot: "business acumen" → the till story', async () => {
    const got = await retrieveHybrid(index, vectors, ai([0.95, 0.05, 0]), 'business acumen');
    expect(got.map((c) => c.id)).toEqual(['bar-story#0']);
    expect(got[0]).toEqual(chunks[1]); // full chunk, same shape as keyword retrieval
  });

  it('keeps keyword hits and adds the semantic ones, a chunk found by both ranking first', async () => {
    const got = await retrieveHybrid(index, vectors, ai([0, 1, 0]), 'postgres security');
    expect(got.map((c) => c.id)).toEqual(['expense-track#0']);
    const both = await retrieveHybrid(index, vectors, ai([0.7, 0.7, 0]), 'postgres security');
    expect(both.map((c) => c.id)).toEqual(['expense-track#0', 'bar-story#0']);
  });

  it('does not add a chunk whose similarity is below the threshold', async () => {
    // Equal on all three axes: cosine 0.577 to each chunk, under MIN_COSINE.
    expect(MIN_COSINE).toBeGreaterThan(0.58);
    expect(await retrieveHybrid(index, vectors, ai([1, 1, 1]), 'zzzqqq')).toEqual([]);
  });

  it('takes at most 2 chunks from one source', async () => {
    const many = [chunk('post#0', 'security a'), chunk('post#1', 'security b'), chunk('post#2', 'security c'), chunk('other#0', 'security d')];
    const ms = new MiniSearch<Chunk>(searchOptions);
    ms.addAll(many);
    const got = await retrieveHybrid(ms.toJSON(), {}, ai([1, 0, 0]), 'security');
    expect(got.filter((c) => c.sourceId === 'post')).toHaveLength(2);
    expect(got.map((c) => c.id)).toContain('other#0');
  });

  it('falls back to keyword results when the embeddings call fails, times out or answers oddly', async () => {
    const down = { run: vi.fn(async () => Promise.reject(new Error('AI down'))) };
    const hung = { run: vi.fn(() => new Promise<never>(() => {})) };
    const odd = { run: vi.fn(async () => ({ data: 'nope' })) };
    const wrongSize = { run: vi.fn(async () => ({ data: [[1, 2]] })) };
    for (const broken of [down, hung, odd, wrongSize]) {
      const got = await retrieveHybrid(index, vectors, broken, 'postgres security', 6, 30);
      expect(got.map((c) => c.id)).toEqual(['expense-track#0']);
    }
  });

  it('with no vectors it is keyword search and never calls the model', async () => {
    const spy = ai([1, 0, 0]);
    const got = await retrieveHybrid(index, {}, spy, 'postgres security');
    expect(got.map((c) => c.id)).toEqual(['expense-track#0']);
    expect(spy.run).not.toHaveBeenCalled();
  });

  it('ignores a vector whose chunk no longer exists', async () => {
    const got = await retrieveHybrid(index, { ...vectors, 'deleted#0': [1, 0, 0] }, ai([1, 0, 0]), 'business acumen');
    expect(got.map((c) => c.id)).toEqual(['bar-story#0']);
  });
});
