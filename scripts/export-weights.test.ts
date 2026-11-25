import { describe, expect, it } from 'vitest';
import { toBaseWeights } from './export-weights.ts';

describe('toBaseWeights', () => {
  it('keeps only weights that differ from neutral, rounded to 2 decimals, sorted by id', () => {
    expect(
      toBaseWeights([
        { chunk_id: 'b#0', weight: 1.2349 },
        { chunk_id: 'a#1', weight: 0.8051 },
        { chunk_id: 'c#0', weight: 1.001 }, // rounds to 1.00: nothing learned
      ]),
    ).toEqual({ 'a#1': 0.81, 'b#0': 1.23 });
    expect(Object.keys(toBaseWeights([{ chunk_id: 'b#0', weight: 1.2 }, { chunk_id: 'a#0', weight: 1.3 }]))).toEqual(['a#0', 'b#0']);
  });

  it('clamps to [0.5, 2.0] and drops bad ids and bad numbers, so a hand-edited export cannot ship surprises', () => {
    expect(
      toBaseWeights([
        { chunk_id: 'hi#0', weight: 9 },
        { chunk_id: 'lo#0', weight: -1 },
        { chunk_id: 'not a chunk id', weight: 1.5 },
        { chunk_id: 'nan#0', weight: Number.NaN },
        { chunk_id: 'str#0', weight: '1.5' as unknown as number },
      ]),
    ).toEqual({ 'hi#0': 2, 'lo#0': 0.5 });
  });

  it('is empty when nothing has been learned', () => {
    expect(toBaseWeights([])).toEqual({});
  });
});
