import { describe, expect, it } from 'vitest';
import { judge } from './run.ts';

describe('judge', () => {
  it('passes a mix that cites the required source', () => {
    expect(judge({ group: 'g', order: 'o', expectKind: 'mix', mustCite: ['a'] }, { kind: 'mix', layers: [{ evidenceIds: ['a#0'] }] })).toEqual([]);
  });

  it('fails a missing citation and a wrong kind', () => {
    expect(judge({ group: 'g', order: 'o', expectKind: 'mix', mustCite: ['a'] }, { kind: 'none', message: 'x' })).toEqual([
      'kind none, expected mix',
      'did not cite a',
    ]);
  });

  it('forbidden words match whole words only, any case', () => {
    const c = { group: 'g', order: 'o', mustNotContain: ['MIT'] };
    expect(judge(c, { kind: 'none', message: 'rate limit reached' })).toEqual([]);
    expect(judge(c, { kind: 'none', message: 'a phd from mit' })).toEqual(['contains "MIT"']);
  });
});
