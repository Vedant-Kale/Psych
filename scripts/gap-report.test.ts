import { describe, expect, it } from 'vitest';
import { buildReport, isoWeek, themeOf, type OutcomeRow, type TurnRow } from './gap-report.ts';

describe('themeOf', () => {
  it.each([
    ['tell me about a time he led a team', 'leadership'],
    ['how does he handle feedback from a senior developer?', 'feedback'],
    ['has he worked face to face with real customers', 'customers'],
    ['how does he cope under pressure and tight deadlines', 'pressure'],
    ['is he a good team player', 'teamwork'],
    ['describe a mistake he made', 'mistake'],
    ['a time he made a hard decision with business impact', 'decision'],
    ['how fast does he learn new tools', 'learning'],
    ['an engineer who knows kubernetes', 'other'],
    ['', 'other'],
  ])('%s → %s', (text, theme) => {
    expect(themeOf(text)).toBe(theme);
  });
});

describe('isoWeek', () => {
  it('labels a date with its ISO year and week', () => {
    expect(isoWeek(new Date('2026-11-25T00:00:00Z'))).toBe('2026-W48');
    expect(isoWeek(new Date('2026-01-01T00:00:00Z'))).toBe('2026-W01');
    expect(isoWeek(new Date('2027-01-01T00:00:00Z'))).toBe('2026-W53');
  });
});

const turn = (text: string, score: number, chunkIds: string[] = []): TurnRow => ({ text, score, chunk_ids: JSON.stringify(chunkIds) });
const outcomes: OutcomeRow = { turns: 40, followups: 20, reworded: 4, deeper: 8, new_topic: 8, yes: 10, no: 5 };

describe('buildReport — a public issue body from private rows', () => {
  const rows = [
    turn('tell me about a time he led a team', -2, ['expense-track#0']),
    turn('how did he lead the SECRET-PROJECT-ALPHA rollout', -3, ['expense-track#0', 'why-bars-light-amber#0']),
    turn('who led the sales team at 0412 345 678 acme corp', -2, ['expense-track#0']),
    turn('how does he handle feedback', -1, []),
    turn('an engineer who knows kubernetes', -2, ['why-bars-light-amber#0']),
    turn('a happy visitor question', 3, ['expense-track#0']),
  ];
  const md = buildReport(rows, outcomes, new Date('2026-11-25T00:00:00Z'));

  it('names the week and the totals', () => {
    expect(md).toContain('Gap report 2026-W48');
    expect(md).toMatch(/40 orders/);
    expect(md).toMatch(/5 of them scored below zero/);
    expect(md).toMatch(/rephrase rate.*20%/i); // 4 rewordings in 20 follow-ups
    expect(md).toMatch(/satisfied.*67%/i); // 10 yes of 15 answered
  });

  it('counts demerited orders by theme, hiding counts under 3', () => {
    expect(md).toMatch(/leadership \| 3/);
    expect(md).toMatch(/feedback \| <3/);
    expect(md).toMatch(/other \| <3/);
  });

  it('lists weak evidence ids that three or more demerited orders used, ids only', () => {
    expect(md).toMatch(/expense-track#0.*3/);
    expect(md).not.toContain('why-bars-light-amber#0'); // only 2 uses
  });

  it('never contains any visitor question text', () => {
    // Words that only appear inside the fixture orders.
    for (const secret of ['SECRET-PROJECT-ALPHA', 'rollout', '0412', '345 678', 'acme', 'sales', 'kubernetes', 'happy', 'senior']) {
      expect(md.toLowerCase()).not.toContain(secret.toLowerCase());
    }
  });

  it('drops evidence ids that do not look like a chunk id, so nothing else can ride along', () => {
    const odd = [1, 2, 3].map(() => turn('led a team', -2, ['not an id: leaked text', 'expense-track#0']));
    const out = buildReport(odd, outcomes, new Date('2026-11-25T00:00:00Z'));
    expect(out).toContain('expense-track#0');
    expect(out).not.toContain('leaked');
  });

  it('says so when there is nothing to report, and copes with missing outcomes and bad chunk_ids json', () => {
    const empty = buildReport([], undefined, new Date('2026-11-25T00:00:00Z'));
    expect(empty).toMatch(/no orders/i);
    const bad = buildReport([{ text: 'x', score: -2, chunk_ids: 'not json' }], outcomes, new Date('2026-11-25T00:00:00Z'));
    expect(bad).toContain('Gap report');
  });
});
