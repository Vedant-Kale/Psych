import { describe, expect, it } from 'vitest';
import { clarify, withChoice } from './clarify';

describe('clarify', () => {
  it.each([
    'a developer',
    'an engineer',
    'someone good',
    'a reliable person who communicates well and learns fast', // long, but no domain in it
    'somebody smart for my team',
  ])('asks about a vague role order: %s', (text) => {
    const c = clarify(text);
    expect(c).not.toBeNull();
    expect(c!.question).toMatch(/\?$/);
    expect(c!.options).toEqual(['a product users touch', 'internal tools', 'research', 'data and security']);
  });

  it.each([
    'an engineer who can ship secure AI agents',
    'Postgres expert',
    'someone who knows row-level security',
    'a developer for internal tools',
    'frontend developer',
    'an engineer for a fintech startup',
  ])('does not ask when the order already names a domain: %s', (text) => {
    expect(clarify(text)).toBeNull();
  });

  it('only role orders are clarified: facts, behaviour questions and empty text never are', () => {
    expect(clarify('where does he study?')).toBeNull();
    expect(clarify('how can I contact him?')).toBeNull();
    expect(clarify('how did he handle feedback?')).toBeNull();
    expect(clarify('tell me about a developer')).toBeNull();
    expect(clarify('')).toBeNull();
    expect(clarify('   ')).toBeNull();
  });

  it('every option gives the order a domain, so the answer is never a second question', () => {
    for (const option of clarify('a developer')!.options) {
      expect(clarify(withChoice('a developer', option)), option).toBeNull();
    }
  });
});

describe('withChoice', () => {
  it('appends the chosen option to what the visitor wrote', () => {
    expect(withChoice('a developer', 'internal tools')).toBe('a developer, for internal tools');
    expect(withChoice('  an engineer  ', 'research')).toBe('an engineer, for research');
  });

  it('strips a trailing full stop or comma first, and stays within the 500 character limit', () => {
    expect(withChoice('a developer.', 'research')).toBe('a developer, for research');
    expect(withChoice('x'.repeat(500), 'research').length).toBeLessThanOrEqual(500);
  });
});
