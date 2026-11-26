import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { evaluateGates, renderReport, type GateInputs } from './gates.ts';
import { loadConversations, loadPersonas, validate } from './simulate.ts';

const sim = (over: Partial<Record<'turns' | 'satisfied' | 'overClaims' | 'modelTurns', number>> = {}) => ({ turns: 85, satisfied: 80, overClaims: 0, modelTurns: 60, ...over });
const good: GateInputs = {
  simulations: [sim()],
  topQuestions: { turns: 30, satisfied: 30, overClaims: 0 },
  outcomes: { followups: 100, reworded: 6 },
  ratings: Array.from({ length: 12 }, () => 4.5),
  dailyCalls: [40, 60, 80],
  cap: 100,
};
const status = (inputs: GateInputs, name: string) => evaluateGates(inputs).gates.find((g) => g.name === name)!.status;

describe('evaluateGates', () => {
  it('passes every gate, and is launch-ready, on good data', () => {
    const r = evaluateGates(good);
    expect(r.gates.map((g) => g.status)).toEqual(['pass', 'pass', 'pass', 'pass', 'pass', 'pass']);
    expect(r.launchReady).toBe(true);
    expect(r.gates.map((g) => g.name)).toEqual(['Over-claims', 'Satisfied on held-out', 'Rephrase rate', 'Top 30 interview questions', 'Beta average', 'Cost']);
  });

  it('any over-claim, in the held-out run or the top 30, fails the first gate', () => {
    expect(status({ ...good, simulations: [sim({ overClaims: 1 })] }, 'Over-claims')).toBe('fail');
    expect(status({ ...good, topQuestions: { turns: 30, satisfied: 29, overClaims: 1 } }, 'Over-claims')).toBe('fail');
    expect(evaluateGates({ ...good, simulations: [sim({ overClaims: 1 })] }).launchReady).toBe(false);
  });

  it('satisfied needs 80% across all the held-out runs added together', () => {
    expect(status({ ...good, simulations: [sim({ satisfied: 68 })] }, 'Satisfied on held-out')).toBe('pass'); // 80.0%
    expect(status({ ...good, simulations: [sim({ satisfied: 67 })] }, 'Satisfied on held-out')).toBe('fail');
    expect(status({ ...good, simulations: [sim({ turns: 40, satisfied: 20 }), sim({ turns: 45, satisfied: 45 })] }, 'Satisfied on held-out')).toBe('fail'); // 65 of 85
    expect(status({ ...good, simulations: [sim({ turns: 40, satisfied: 40 }), sim({ turns: 45, satisfied: 40 })] }, 'Satisfied on held-out')).toBe('pass');
  });

  it('rephrase rate is at most 10% of follow-ups', () => {
    expect(status({ ...good, outcomes: { followups: 100, reworded: 10 } }, 'Rephrase rate')).toBe('pass');
    expect(status({ ...good, outcomes: { followups: 100, reworded: 11 } }, 'Rephrase rate')).toBe('fail');
  });

  it('the top 30 must all have a documented answer or an honest redirect', () => {
    expect(status({ ...good, topQuestions: { turns: 30, satisfied: 29, overClaims: 0 } }, 'Top 30 interview questions')).toBe('fail');
  });

  it('beta average is at least 4 out of 5', () => {
    expect(status({ ...good, ratings: Array.from({ length: 10 }, () => 4) }, 'Beta average')).toBe('pass');
    expect(status({ ...good, ratings: Array.from({ length: 10 }, () => 3.9) }, 'Beta average')).toBe('fail');
  });

  it('cost: no day went over the cap, and the average day is within it', () => {
    expect(status({ ...good, dailyCalls: [100, 100] }, 'Cost')).toBe('pass');
    expect(status({ ...good, dailyCalls: [20, 101] }, 'Cost')).toBe('fail');
  });

  it('too little data is "no data", never a pass: the launch is not ready', () => {
    expect(status({ ...good, simulations: [sim({ turns: 30, satisfied: 30 })] }, 'Satisfied on held-out')).toBe('no-data');
    expect(status({ ...good, outcomes: { followups: 20, reworded: 0 } }, 'Rephrase rate')).toBe('no-data');
    expect(status({ ...good, ratings: [5, 5, 5] }, 'Beta average')).toBe('no-data');
    expect(status({ ...good, dailyCalls: [] }, 'Cost')).toBe('no-data');
    expect(status({ ...good, topQuestions: undefined }, 'Top 30 interview questions')).toBe('no-data');
    const none = evaluateGates({});
    expect(none.gates.every((g) => g.status === 'no-data')).toBe(true);
    expect(none.launchReady).toBe(false);
  });

  it('a failed gate beats missing data in the overall verdict', () => {
    const r = evaluateGates({ ...good, simulations: [sim({ overClaims: 2 })], ratings: [] });
    expect(r.launchReady).toBe(false);
    expect(r.gates.find((g) => g.name === 'Over-claims')!.status).toBe('fail');
  });
});

describe('renderReport', () => {
  it('is a markdown table with the numbers, a verdict, and the date', () => {
    const md = renderReport(evaluateGates(good), new Date('2026-12-05T00:00:00Z'));
    expect(md).toContain('2026-12-05');
    expect(md).toMatch(/\| Over-claims \| 0 \| 0 \| pass \|/);
    expect(md).toMatch(/\| Satisfied on held-out \| ≥ 80% \| 94% \| pass \|/);
    expect(md).toMatch(/\| Beta average \| ≥ 4\/5 \| 4\.5 \(12 ratings\) \| pass \|/);
    expect(md).toMatch(/all gates pass/i);
    expect(md).toMatch(/the owner decides/i);
  });

  it('says which gates are blocking when it is not ready', () => {
    const md = renderReport(evaluateGates({ ...good, ratings: [] }), new Date('2026-12-05T00:00:00Z'));
    expect(md).toMatch(/not ready/i);
    expect(md).toMatch(/Beta average.*no-data/);
  });
});

describe('the top 30 interview questions', () => {
  const questions = JSON.parse(readFileSync(new URL('./top-questions.json', import.meta.url), 'utf8')) as string[];

  it('are 30 distinct, askable questions', () => {
    expect(questions).toHaveLength(30);
    expect(new Set(questions.map((q) => q.toLowerCase())).size).toBe(30);
    expect(questions.every((q) => q.length >= 10 && q.length <= 200)).toBe(true);
  });

  it('run as a simulator set that has to be answered or honestly redirected, never refused', () => {
    const set = loadConversations('top30');
    expect(set).toHaveLength(30);
    expect(validate(set, loadPersonas())).toEqual([]);
    expect(set.every((c) => c.turns.length === 1 && !c.turns[0]!.expect.kinds.includes('refused') && !c.turns[0]!.expect.kinds.includes('house-menu'))).toBe(true);
  });
});
