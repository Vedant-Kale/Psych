import { readdirSync, readFileSync } from 'node:fs';
import { classifyFollowUp, tokenSimilarity } from '../worker/src/order/score.ts';
import { containsWord } from './run.ts';

// Replays scripted multi-turn conversations against a LOCAL Worker (Cloudflare's always-pass test Turnstile secret) and
// reports how many turns were satisfied and whether anything over-claimed. See md-files/plans/order-v2.md, Task 10.

const VALID_KINDS = ['mix', 'answer', 'fact', 'none', 'refused', 'house-menu'];
/** A local run is not counted by AI_DAILY_CAP, so it carries its own hard budget: 23 × 84 Neurons (the worst case per call) = 1,932. */
export const MAX_MODEL_TURNS = 23;
/** Never allowed in any answer, whatever the conversation: credentials nobody supplied, and hedging. */
const GLOBAL_FORBIDDEN = ['PhD', 'Stanford', 'MIT', 'Harvard', 'could', 'might', 'suggests', 'indicates', 'implies'];

export type Persona = { id: string; who: string; tone: string };
export type Expectation = { kinds: string[]; mustCite?: string[]; forbid?: string[] };
export type Turn = { text: string; expect: Expectation };
export type Conversation = { id: string; persona: string; turns: Turn[] };
type Result = { kind: string; [k: string]: unknown };
export type Row = { satisfied: boolean; overClaims: string[]; modelTurn: boolean };

const dir = (p: string) => new URL(`./${p}`, import.meta.url);

export function loadPersonas(): Persona[] {
  return readdirSync(dir('personas'))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(dir(`personas/${f}`), 'utf8')) as Persona);
}

export function loadConversations(set: 'train' | 'heldout' | 'all'): Conversation[] {
  const sets = set === 'all' ? ['train', 'heldout'] : [set];
  return sets.flatMap((s) =>
    readdirSync(dir(`conversations/${s}`))
      .filter((f) => f.endsWith('.json'))
      .sort()
      .flatMap((f) => JSON.parse(readFileSync(dir(`conversations/${s}/${f}`), 'utf8')) as Conversation[]),
  );
}

/** Every problem in the set, named by conversation id; empty when it is fit to run. */
export function validate(conversations: Conversation[], personas: Persona[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const known = new Set(personas.map((p) => p.id));
  for (const c of conversations) {
    if (seen.has(c.id)) problems.push(`duplicate id ${c.id}`);
    seen.add(c.id);
    if (!known.has(c.persona)) problems.push(`${c.id}: unknown persona ${c.persona}`);
    if (c.turns.length < 1 || c.turns.length > 4) problems.push(`${c.id}: needs 1 to 4 turns, has ${c.turns.length}`);
    for (const [i, t] of c.turns.entries()) {
      const n = t.text.trim().length;
      if (n < 3 || n > 500) problems.push(`${c.id}: turn ${i + 1} must be 3 to 500 characters, is ${n}`);
      const bad = (t.expect?.kinds ?? []).filter((k) => !VALID_KINDS.includes(k));
      if (!t.expect?.kinds?.length || bad.length) problems.push(`${c.id}: turn ${i + 1} has unusable kinds ${JSON.stringify(t.expect?.kinds)}`);
    }
  }
  return problems;
}

function citedSources(r: Result): string[] {
  const ids = r.kind === 'mix' ? (r.layers as { evidenceIds: string[] }[]).flatMap((l) => l.evidenceIds) : r.kind === 'answer' ? (r.evidenceIds as string[]) : r.kind === 'fact' ? (r.sourceIds as string[]) : [];
  return ids.map((id) => id.split('#')[0]!);
}

/** Over-claims are forbidden words in the answer. The house menu is the owner's own static text, so it is not checked. */
export function judgeTurn(expect: Expectation, r: Result): { satisfied: boolean; overClaims: string[] } {
  const text = r.kind === 'house-menu' ? '' : JSON.stringify(r);
  const overClaims = [...new Set([...(expect.forbid ?? []), ...GLOBAL_FORBIDDEN])].filter((w) => containsWord(text, w));
  const cites = ['mix', 'answer', 'fact'].includes(r.kind) ? (expect.mustCite ?? []).every((s) => citedSources(r).includes(s)) : true;
  return { satisfied: expect.kinds.includes(r.kind) && cites && overClaims.length === 0, overClaims };
}

/** The share of follow-up questions that repeat the one before them, judged by the same rule the Worker scores with. */
export function scriptedRephraseRate(conversations: Conversation[]): number {
  let followUps = 0;
  let reworded = 0;
  for (const c of conversations) {
    for (let i = 1; i < c.turns.length; i++) {
      followUps++;
      if (classifyFollowUp({ measure: 'tokens', question: tokenSimilarity(c.turns[i - 1]!.text, c.turns[i]!.text), answer: 0 }) === 'reworded') reworded++;
    }
  }
  return followUps === 0 ? 0 : reworded / followUps;
}

/** The whole set, rotated by the day number, so a run capped by its budget covers a different slice each day. */
export function pickBatch<T>(list: T[], day: number): T[] {
  if (list.length === 0) return [];
  const start = (day * 7) % list.length;
  return [...list.slice(start), ...list.slice(0, start)];
}

export function buildSummary(rows: Row[], rephrase: number) {
  const satisfied = rows.filter((r) => r.satisfied).length;
  return {
    turns: rows.length,
    satisfied,
    satisfiedRate: rows.length === 0 ? 0 : satisfied / rows.length,
    overClaims: rows.filter((r) => r.overClaims.length > 0).length,
    modelTurns: rows.filter((r) => r.modelTurn).length,
    scriptedRephraseRate: rephrase,
  };
}

// ---- command line ----

async function main() {
  const args = process.argv.slice(2);
  const flag = (name: string, fallback: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1]! : fallback);
  const set = flag('set', 'heldout') as 'train' | 'heldout' | 'all';
  const cap = Number(flag('max-model-turns', String(MAX_MODEL_TURNS)));
  const base = flag('url', process.env.EVAL_URL ?? 'http://localhost:8799').replace(/\/$/, '');
  const day = Number(flag('day', String(Math.floor(Date.now() / 86_400_000))));

  const conversations = loadConversations(set);
  const problems = validate(conversations, loadPersonas());
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  const rephrase = scriptedRephraseRate(conversations);
  if (args.includes('--dry-run')) {
    console.log(JSON.stringify({ mode: 'dry-run', set, conversations: conversations.length, turns: conversations.reduce((n, c) => n + c.turns.length, 0), scriptedRephraseRate: rephrase }));
    return;
  }

  const rows: Row[] = [];
  let ip = 0;
  let modelTurns = 0;
  run: for (const c of pickBatch(conversations, day)) {
    const conversationId = crypto.randomUUID();
    for (const t of c.turns) {
      if (modelTurns >= cap) break run;
      ip++;
      // A distinct client IP per turn, so the simulator never trips the visitor rate limit.
      const res = await fetch(`${base}/api/order`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.98.${Math.floor(ip / 250) % 250}.${(ip % 250) + 1}` },
        body: JSON.stringify({ text: t.text, turnstileToken: 'sim', conversationId }),
      });
      const result = (await res.json()) as Result;
      const verdict = res.ok || res.status === 429 ? judgeTurn(t.expect, result) : { satisfied: false, overClaims: [] };
      // A model call is anything that got as far as the model: counted generously so the budget is a ceiling.
      const modelTurn = ['mix', 'answer', 'none'].includes(result.kind);
      if (modelTurn) modelTurns++;
      rows.push({ ...verdict, modelTurn });
      console.log(`${verdict.satisfied ? 'ok  ' : 'MISS'} [${c.id}] ${t.text.slice(0, 60)} → ${result.kind}${verdict.overClaims.length ? `  OVER-CLAIM ${verdict.overClaims.join(', ')}` : ''}`);
    }
  }
  const summary = buildSummary(rows, rephrase);
  console.log(`\n${JSON.stringify({ set, ...summary })}`);
  if (summary.overClaims > 0) process.exit(1);
}

if (import.meta.main) await main();
