import { describe, expect, it, vi } from 'vitest';
import { assertSmallEnough, embedChunks, VECTORS_LIMIT } from './embed-chunks.ts';

describe('embedChunks', () => {
  it('embeds in batches, maps each vector to its chunk id and rounds to 4 decimals', async () => {
    const calls: string[][] = [];
    const embed = vi.fn(async (texts: string[]) => {
      calls.push(texts);
      return texts.map((t) => [t.length + 0.123456789, 0.5]);
    });
    const chunks = Array.from({ length: 45 }, (_, i) => ({ id: `s#${i}`, text: 'x'.repeat(i + 1) }));
    const got = await embedChunks(chunks, embed, 20);
    expect(calls.map((c) => c.length)).toEqual([20, 20, 5]);
    expect(Object.keys(got)).toHaveLength(45);
    expect(got['s#0']).toEqual([1.1235, 0.5]);
    expect(got['s#44']).toEqual([45.1235, 0.5]);
  });

  it('returns nothing for no chunks and never calls the API', async () => {
    const embed = vi.fn();
    expect(await embedChunks([], embed)).toEqual({});
    expect(embed).not.toHaveBeenCalled();
  });

  it('fails when the API returns a different number of vectors than texts', async () => {
    await expect(embedChunks([{ id: 'a#0', text: 'a' }, { id: 'a#1', text: 'b' }], async () => [[1]])).rejects.toThrow(/2 texts but 1 vectors/);
  });
});

describe('assertSmallEnough', () => {
  it('passes under the limit and throws over it, so a huge vectors file cannot reach the Worker', () => {
    expect(() => assertSmallEnough('{}')).not.toThrow();
    expect(() => assertSmallEnough('x'.repeat(VECTORS_LIMIT + 1))).toThrow(/over the .* limit/);
  });
});
