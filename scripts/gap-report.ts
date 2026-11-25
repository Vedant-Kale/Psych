import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export type TurnRow = { text: string; score: number; chunk_ids: string };
export type OutcomeRow = Partial<Record<'turns' | 'followups' | 'reworded' | 'deeper' | 'new_topic' | 'yes' | 'no', number>>;

// The interview themes from the story schema. A keyword rule, so no AI call and no text leaves this file.
const THEMES: [string, RegExp][] = [
  ['leadership', /\b(lead|led|leader|leadership|manage[dr]?|captain\w*)\b/i],
  ['feedback', /\bfeedback|criticism|code review\b/i],
  ['customers', /\bcustomers?|clients?|face to face|stakeholders?\b/i],
  ['pressure', /\bpressure|deadlines?|stress\w*|under fire|busy\b/i],
  ['teamwork', /\bteam\w*|collaborat\w*|together\b/i],
  ['mistake', /\bmistakes?|failures?|got wrong|went wrong\b/i],
  ['decision', /\bdecisions?|decid\w*|trade-?offs?|business\b/i],
  ['learning', /\blearn\w*|upskill\w*|new tools?\b/i],
];

export const themeOf = (text: string): string => THEMES.find(([, re]) => re.test(text))?.[0] ?? 'other';

/** ISO 8601 week, e.g. 2026-W48. */
export function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7)); // the Thursday of this week
  const week = Math.ceil(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

const CHUNK_ID = /^[a-z0-9-]+#\d+$/;
/** Counts under this are hidden: a count of 1 or 2 could point at one visitor. */
const MIN_PUBLIC = 3;
const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : 'n/a');
const shown = (n: number) => (n < MIN_PUBLIC ? '<3' : String(n));

/**
 * The public issue body. The repo is public, so this carries themes, counts and chunk ids only: never a visitor's words.
 * Chunk ids are accepted only if they look like one, so nothing else can ride along in that column.
 */
export function buildReport(turns: TurnRow[], outcomes: OutcomeRow | undefined, now: Date): string {
  const lines = [`# Gap report ${isoWeek(now)}`, ''];
  if (turns.length === 0 && !outcomes?.turns) return [...lines, 'No orders in the last 7 days.', ''].join('\n');

  const demerited = turns.filter((t) => t.score < 0);
  const o = outcomes ?? {};
  lines.push(`Last 7 days: ${o.turns ?? turns.length} orders, ${demerited.length} of them scored below zero.`);
  lines.push(`Rephrase rate: ${pct(o.reworded ?? 0, o.followups ?? 0)}. Satisfied: ${pct(o.yes ?? 0, (o.yes ?? 0) + (o.no ?? 0))} of answered.`, '');

  const byTheme = new Map<string, number>();
  const byChunk = new Map<string, number>();
  for (const t of demerited) {
    byTheme.set(themeOf(t.text), (byTheme.get(themeOf(t.text)) ?? 0) + 1);
    let ids: unknown = [];
    try {
      ids = JSON.parse(t.chunk_ids);
    } catch {
      // A malformed row just contributes no evidence ids.
    }
    for (const id of Array.isArray(ids) ? ids : []) if (typeof id === 'string' && CHUNK_ID.test(id)) byChunk.set(id, (byChunk.get(id) ?? 0) + 1);
  }

  lines.push('## Themes with orders that missed', '', '| Theme | Orders |', '|---|---|');
  for (const [theme, n] of [...byTheme].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) lines.push(`| ${theme} | ${shown(n)} |`);
  lines.push('', '## Weak evidence', '', 'Evidence that three or more missed orders were answered from:', '');
  const weak = [...byChunk].filter(([, n]) => n >= MIN_PUBLIC).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (weak.length === 0) lines.push('None yet.');
  for (const [id, n] of weak) lines.push(`- ${id} (${n})`);
  lines.push('', 'The orders themselves are private. To read them, run `npm run gaps:raw` with your own Cloudflare login.', '');
  return lines.join('\n');
}

// ---- command line ----

/** wrangler prints its rows as `[{ "results": [...] }]`, sometimes after a banner line. */
const rowsOf = <T>(json: string): T[] => {
  const start = json.indexOf('[');
  return start < 0 ? [] : ((JSON.parse(json.slice(start)) as { results?: T[] }[])[0]?.results ?? []);
};

function main() {
  const [cmd, turnsFile, outcomesFile] = process.argv.slice(2);
  if (cmd === 'report' && turnsFile) {
    const turns = rowsOf<TurnRow>(readFileSync(turnsFile, 'utf8'));
    const outcomes = outcomesFile ? rowsOf<OutcomeRow>(readFileSync(outcomesFile, 'utf8'))[0] : undefined;
    process.stdout.write(buildReport(turns, outcomes, new Date()));
  } else if (cmd === 'raw') {
    // Private: prints visitors' words to your own terminal, using your own wrangler login.
    for (const env of ['', '--env staging']) {
      const r = spawnSync(
        'npx',
        ['wrangler', 'd1', 'execute', env ? 'psych-staging' : 'psych', '--remote', ...env.split(' ').filter(Boolean), '--command', 'SELECT score, text, created_at FROM turns WHERE score < 0 ORDER BY created_at DESC LIMIT 100'],
        { stdio: 'inherit' },
      );
      if (r.status !== 0) process.exit(r.status ?? 1);
    }
  } else {
    console.error('usage: gap-report.ts report <turns.json> [outcomes.json] | raw');
    process.exit(2);
  }
}

if (import.meta.main) main();
