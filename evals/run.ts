import { readFileSync } from 'node:fs';

type Case = { group: string; order: string; expectKind?: string; mustCite?: string[]; mustNotContain?: string[] };
type Result =
  | { kind: 'mix'; layers: { evidenceIds: string[] }[] }
  | { kind: 'fact'; sourceIds: string[] }
  | { kind: string; [k: string]: unknown };

const BASE = (process.env.EVAL_URL ?? 'http://localhost:8799').replace(/\/$/, '');
const cases = JSON.parse(readFileSync(new URL('./order-cases.json', import.meta.url), 'utf8')) as Case[];

/** Sources a response cites: chunk ids map to their source slug (`<slug>#<n>`). */
function cited(r: Result): string[] {
  if (r.kind === 'mix') return (r as Extract<Result, { kind: 'mix' }>).layers.flatMap((l) => l.evidenceIds.map((id) => id.split('#')[0]!));
  if (r.kind === 'fact') return (r as Extract<Result, { kind: 'fact' }>).sourceIds;
  if (r.kind === 'answer') return (r as unknown as { evidenceIds: string[] }).evidenceIds.map((id) => id.split('#')[0]!);
  return [];
}

/** Whole-word, case-insensitive: "MIT" must not match "limit". */
const containsWord = (haystack: string, needle: string) =>
  new RegExp(`(^|[^\\p{L}\\p{N}])${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'iu').test(haystack);

export function judge(c: Case, r: Result): string[] {
  const problems: string[] = [];
  if (c.expectKind && r.kind !== c.expectKind) problems.push(`kind ${r.kind}, expected ${c.expectKind}`);
  const sources = cited(r);
  for (const s of c.mustCite ?? []) if (!sources.includes(s)) problems.push(`did not cite ${s}`);
  const text = JSON.stringify(r);
  for (const w of c.mustNotContain ?? []) if (containsWord(text, w)) problems.push(`contains "${w}"`);
  return problems;
}

async function main() {
  let failed = 0;
  for (const [i, c] of cases.entries()) {
    const res = await fetch(`${BASE}/api/order`, {
      method: 'POST',
      // A distinct client IP per case so the eval run never trips the visitor rate limit.
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.99.0.${i + 1}` },
      body: JSON.stringify({ text: c.order, turnstileToken: 'eval' }),
    });
    const body = (await res.json()) as Result;
    const problems = res.ok ? judge(c, body) : [`HTTP ${res.status}`];
    if (problems.length) failed++;
    const mark = problems.length ? 'FAIL' : 'pass';
    console.log(`${mark}  [${c.group}] ${c.order.slice(0, 70)} → ${body.kind}${problems.length ? `  (${problems.join('; ')})` : ''}`);
  }
  console.log(`\n${cases.length - failed}/${cases.length} passed`);
  if (failed) process.exit(1);
}

if (import.meta.main) await main();
