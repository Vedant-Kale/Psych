import { readFileSync } from 'node:fs';

// The launch gates from md-files/plans/order-v2.md, Task 12. Pure: the numbers come in as files, the verdict comes out.
// A gate with too little data says "no-data". It never passes by default, and the AI only goes on in production with the owner's yes.

export type Status = 'pass' | 'fail' | 'no-data';
export type Gate = { name: string; target: string; value: string; status: Status };
type SimRun = { turns: number; satisfied: number; overClaims: number; modelTurns?: number };
export type GateInputs = {
  /** Summaries of held-out simulator runs (each run covers a slice, so they are added together). */
  simulations?: SimRun[];
  /** The simulator summary for `--set top30`. */
  topQuestions?: { turns: number; satisfied: number; overClaims: number } | undefined;
  /** Staging `daily_outcomes`, summed over the beta. */
  outcomes?: { followups: number; reworded: number };
  /** Beta testers' ratings out of 5. */
  ratings?: number[];
  /** Model calls per day on staging (`ai_budget`). */
  dailyCalls?: number[];
  /** The daily AI cap in force (AI_DAILY_CAP); production plus staging must stay at or under 119. */
  cap?: number;
};

const MIN_HELDOUT_TURNS = 80; // the whole held-out set is about 85 turns
const MIN_FOLLOWUPS = 50;
const MIN_RATINGS = 10;
const pct = (x: number) => `${Math.round(x * 100)}%`;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const noData = (name: string, target: string): Gate => ({ name, target, value: '—', status: 'no-data' });
const verdict = (name: string, target: string, value: string, ok: boolean): Gate => ({ name, target, value, status: ok ? 'pass' : 'fail' });

export function evaluateGates(i: GateInputs): { gates: Gate[]; launchReady: boolean } {
  const sims = i.simulations ?? [];
  const turns = sims.reduce((n, s) => n + s.turns, 0);
  const satisfied = sims.reduce((n, s) => n + s.satisfied, 0);
  const top = i.topQuestions;
  const ratings = i.ratings ?? [];
  const calls = i.dailyCalls ?? [];
  const cap = i.cap ?? 100;
  const overClaims = sims.reduce((n, s) => n + s.overClaims, 0) + (top?.overClaims ?? 0);

  const gates: Gate[] = [
    sims.length === 0 && !top ? noData('Over-claims', '0') : verdict('Over-claims', '0', String(overClaims), overClaims === 0),
    turns < MIN_HELDOUT_TURNS ? noData('Satisfied on held-out', '≥ 80%') : verdict('Satisfied on held-out', '≥ 80%', pct(satisfied / turns), satisfied / turns >= 0.8),
    !i.outcomes || i.outcomes.followups < MIN_FOLLOWUPS
      ? noData('Rephrase rate', '≤ 10%')
      : verdict('Rephrase rate', '≤ 10%', pct(i.outcomes.reworded / i.outcomes.followups), i.outcomes.reworded / i.outcomes.followups <= 0.1),
    !top || top.turns < 30
      ? noData('Top 30 interview questions', '30 of 30')
      : verdict('Top 30 interview questions', '30 of 30', `${top.satisfied} of ${top.turns}`, top.satisfied === top.turns),
    ratings.length < MIN_RATINGS
      ? noData('Beta average', '≥ 4/5')
      : verdict('Beta average', '≥ 4/5', `${mean(ratings).toFixed(1)} (${ratings.length} ratings)`, mean(ratings) >= 4),
    calls.length === 0
      ? noData('Cost', `≤ ${cap} calls a day`)
      : verdict('Cost', `≤ ${cap} calls a day`, `peak ${Math.max(...calls)}, average ${Math.round(mean(calls))}`, Math.max(...calls) <= cap),
  ];
  return { gates, launchReady: gates.every((g) => g.status === 'pass') };
}

/** Markdown for md-files/Research.md §7: a table and one line the owner can act on. */
export function renderReport(result: { gates: Gate[]; launchReady: boolean }, now: Date): string {
  const rows = result.gates.map((g) => `| ${g.name} | ${g.target} | ${g.value} | ${g.status} |`);
  const blocking = result.gates.filter((g) => g.status !== 'pass').map((g) => `${g.name} (${g.status})`);
  return [
    `### Launch gate report ${now.toISOString().slice(0, 10)}`,
    '',
    '| Gate | Target | Result | Status |',
    '|---|---|---|---|',
    ...rows,
    '',
    result.launchReady ? 'All gates pass. The owner decides whether to switch the AI on in production.' : `Not ready: ${blocking.join(', ')}.`,
    '',
  ].join('\n');
}

// ---- command line ----
// node evals/gates.ts --simulations a.json,b.json --top30 top.json --outcomes outcomes.json --ratings ratings.json --calls calls.json [--cap 100]
const read = <T>(path: string | undefined): T | undefined => (path ? (JSON.parse(readFileSync(path, 'utf8')) as T) : undefined);

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (n: string) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
  const result = evaluateGates({
    simulations: flag('simulations')?.split(',').map((f) => read<SimRun>(f)!),
    topQuestions: read(flag('top30')),
    outcomes: read(flag('outcomes')),
    ratings: read(flag('ratings')),
    dailyCalls: read(flag('calls')),
    cap: flag('cap') ? Number(flag('cap')) : undefined,
  });
  process.stdout.write(renderReport(result, new Date()));
  process.exit(result.launchReady ? 0 : 1);
}
