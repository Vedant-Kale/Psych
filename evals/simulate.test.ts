import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  type Conversation,
  type Persona,
  buildSummary,
  judgeTurn,
  loadConversations,
  loadPersonas,
  pickBatch,
  scriptedRephraseRate,
  validate,
  MAX_MODEL_TURNS,
} from './simulate.ts';

const personas = loadPersonas();
const all = loadConversations('all');
const train = loadConversations('train');
const heldout = loadConversations('heldout');

describe('the shipped personas and conversations', () => {
  it('has the five personas', () => {
    expect(personas.map((p) => p.id).sort()).toEqual(['hiring-manager', 'in-a-hurry', 'recruiter', 'reference', 'sceptical']);
  });

  it('has at least 200 conversations, split 80/20 into training and held-out', () => {
    expect(all.length).toBeGreaterThanOrEqual(200);
    expect(train.length + heldout.length).toBe(all.length);
    expect(heldout.length / all.length).toBeGreaterThanOrEqual(0.18);
    expect(heldout.length / all.length).toBeLessThanOrEqual(0.22);
  });

  it('every persona appears in both sets, and ids are unique', () => {
    for (const set of [train, heldout]) {
      expect(new Set(set.map((c) => c.persona))).toEqual(new Set(personas.map((p) => p.id)));
    }
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
  });

  it('no conversation is in both sets, and the files are exactly the two folders', () => {
    const inTrain = new Set(train.map((c) => c.id));
    expect(heldout.some((c) => inTrain.has(c.id))).toBe(false);
    expect(readdirSync(new URL('./conversations', import.meta.url)).sort()).toEqual(['heldout', 'train']);
  });

  it('passes its own validation', () => {
    expect(validate(all, personas)).toEqual([]);
  });

  it('is multi-turn, and keeps scripted rewordings rare enough for the 10% rephrase gate', () => {
    expect(all.filter((c) => c.turns.length >= 2).length).toBeGreaterThan(all.length * 0.7);
    expect(scriptedRephraseRate(all)).toBeLessThanOrEqual(0.1);
  });
});

const persona: Persona = { id: 'recruiter', who: 'x', tone: 'y' };
const conv = (over: Partial<Conversation> = {}): Conversation => ({
  id: 'c1',
  persona: 'recruiter',
  turns: [{ text: 'tell me about his projects', expect: { kinds: ['answer', 'none'] } }],
  ...over,
});

describe('validate', () => {
  it('accepts a good conversation and names every problem in a bad one', () => {
    expect(validate([conv()], [persona])).toEqual([]);
    const problems = validate(
      [
        conv({ id: 'dup' }),
        conv({ id: 'dup' }),
        conv({ id: 'bad-persona', persona: 'nobody' }),
        conv({ id: 'no-turns', turns: [] }),
        conv({ id: 'short', turns: [{ text: 'hi', expect: { kinds: ['none'] } }] }),
        conv({ id: 'long', turns: [{ text: 'x'.repeat(501), expect: { kinds: ['none'] } }] }),
        conv({ id: 'bad-kind', turns: [{ text: 'a fine question', expect: { kinds: ['banana'] } }] }),
        conv({ id: 'too-many', turns: Array.from({ length: 5 }, () => ({ text: 'a fine question', expect: { kinds: ['none'] } })) }),
      ],
      [persona],
    );
    expect(problems.join('\n')).toMatch(/duplicate id dup/);
    for (const id of ['bad-persona', 'no-turns', 'short', 'long', 'bad-kind', 'too-many']) expect(problems.join('\n')).toContain(id);
  });
});

describe('judgeTurn', () => {
  const expectation = { kinds: ['answer', 'mix'], mustCite: ['expense-track'], forbid: ['Kubernetes'] };

  it('is satisfied by an allowed kind that cites what it must', () => {
    expect(judgeTurn(expectation, { kind: 'answer', text: 'I did it.', evidenceIds: ['expense-track#0'] })).toEqual({ satisfied: true, overClaims: [] });
  });

  it('is not satisfied by the wrong kind or a missing citation, but that is not an over-claim', () => {
    expect(judgeTurn(expectation, { kind: 'refused', reason: 'off_topic' }).satisfied).toBe(false);
    expect(judgeTurn(expectation, { kind: 'answer', text: 'x', evidenceIds: ['other#0'] })).toEqual({ satisfied: false, overClaims: [] });
  });

  it('a none answer never has to cite anything', () => {
    expect(judgeTurn({ kinds: ['none', 'answer'], mustCite: ['expense-track'] }, { kind: 'none', message: 'Nothing in my work supports that yet.' }).satisfied).toBe(true);
  });

  it('over-claims are forbidden words from the conversation or from the global list, and always fail the turn', () => {
    const got = judgeTurn(expectation, { kind: 'answer', text: 'I ran Kubernetes and hold a PhD.', evidenceIds: ['expense-track#0'] });
    expect(got.satisfied).toBe(false);
    expect(got.overClaims).toEqual(expect.arrayContaining(['Kubernetes', 'PhD']));
    expect(judgeTurn({ kinds: ['mix'] }, { kind: 'mix', layers: [{ skill: 's', evidenceIds: ['a#0'], rationale: 'It might help.' }] }).overClaims).toEqual(['might']);
  });

  it('whole words only: "limit" is not "MIT"', () => {
    expect(judgeTurn({ kinds: ['none'] }, { kind: 'none', message: 'rate limit reached' }).overClaims).toEqual([]);
  });
});

describe('scriptedRephraseRate', () => {
  const turns = (...texts: string[]) => texts.map((text) => ({ text, expect: { kinds: ['none'] } }));

  it('is the share of follow-ups that repeat the question before them', () => {
    expect(scriptedRephraseRate([conv({ turns: turns('how does he keep data private', 'how does he keep data private please', 'tell me about amber lighting in bars') })])).toBe(0.5);
  });

  it('is 0 with no follow-ups', () => {
    expect(scriptedRephraseRate([conv()])).toBe(0);
    expect(scriptedRephraseRate([])).toBe(0);
  });
});

describe('pickBatch — a hard budget, and a different slice each day', () => {
  const list = Array.from({ length: 10 }, (_, i) => conv({ id: `c${i}` }));

  it('starts from the day number, wraps around, and covers everything over enough days', () => {
    expect(pickBatch(list, 0).map((c) => c.id)).toEqual(list.map((c) => c.id));
    expect(pickBatch(list, 3)[0]!.id).toBe('c1'); // (3 * 7) % 10
    expect(pickBatch(list, 3)).toHaveLength(10);
    expect(new Set(pickBatch(list, 3).map((c) => c.id)).size).toBe(10);
  });

  it('the per-run model-turn cap keeps a run under 2,000 Neurons at the worst case of 84 each', () => {
    expect(MAX_MODEL_TURNS * 84).toBeLessThanOrEqual(2000);
  });
});

describe('buildSummary', () => {
  const rows = [
    { satisfied: true, overClaims: [] as string[], modelTurn: true },
    { satisfied: true, overClaims: [] as string[], modelTurn: false },
    { satisfied: false, overClaims: ['PhD'], modelTurn: true },
    { satisfied: false, overClaims: [] as string[], modelTurn: true },
  ];

  it('reports counts, the satisfied share and over-claims, with the model turns it spent', () => {
    expect(buildSummary(rows, 0.04)).toEqual({ turns: 4, satisfied: 2, satisfiedRate: 0.5, overClaims: 1, modelTurns: 3, scriptedRephraseRate: 0.04 });
  });

  it('copes with nothing run', () => {
    expect(buildSummary([], 0)).toEqual({ turns: 0, satisfied: 0, satisfiedRate: 0, overClaims: 0, modelTurns: 0, scriptedRephraseRate: 0 });
  });
});

describe('the two sets on disk are valid JSON arrays of conversations', () => {
  it('every file parses', () => {
    for (const set of ['train', 'heldout']) {
      for (const f of readdirSync(new URL(`./conversations/${set}`, import.meta.url))) {
        const data = JSON.parse(readFileSync(new URL(`./conversations/${set}/${f}`, import.meta.url), 'utf8')) as unknown;
        expect(Array.isArray(data), `${set}/${f}`).toBe(true);
      }
    }
  });
});
