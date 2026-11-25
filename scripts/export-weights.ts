import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHUNK_ID = /^[a-z0-9-]+#\d+$/;

/** What the staging beta learned, as a small reviewed file: only weights that moved, clamped and rounded. */
export function toBaseWeights(rows: { chunk_id: string; weight: number }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of [...rows].sort((a, b) => a.chunk_id.localeCompare(b.chunk_id))) {
    if (!CHUNK_ID.test(r.chunk_id) || typeof r.weight !== 'number' || !Number.isFinite(r.weight)) continue;
    const w = Math.round(Math.min(2, Math.max(0.5, r.weight)) * 100) / 100;
    if (w !== 1) out[r.chunk_id] = w;
  }
  return out;
}

function main() {
  // Uses your own wrangler login. Review the diff of worker/weights/base.json in a PR before it ships.
  const r = spawnSync('npx', ['wrangler', 'd1', 'execute', 'psych-staging', '--remote', '--env', 'staging', '--json', '--command', 'SELECT chunk_id, weight FROM chunk_weights'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  const json = r.stdout.slice(r.stdout.indexOf('['));
  const rows = (JSON.parse(json) as { results?: { chunk_id: string; weight: number }[] }[])[0]?.results ?? [];
  const weights = toBaseWeights(rows);
  writeFileSync('worker/weights/base.json', `${JSON.stringify(weights, null, 2)}\n`);
  console.log(`worker/weights/base.json: ${Object.keys(weights).length} weights from staging`);
}

if (import.meta.main) main();
