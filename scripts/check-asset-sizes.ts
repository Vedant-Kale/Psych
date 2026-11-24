import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Cloudflare refuses assets over 25 MiB; we stop at 20 MiB to leave headroom. */
export const ASSET_LIMIT = 20 * 1024 * 1024;

export function findOversized(dir: string, limitBytes = ASSET_LIMIT): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name))
    .filter((f) => statSync(f).size > limitBytes)
    .sort();
}

if (import.meta.main) {
  const big = findOversized('out');
  if (big.length > 0) {
    for (const f of big) console.error(`${f}: ${(statSync(f).size / 1024 / 1024).toFixed(1)} MiB is over the 20 MiB limit`);
    process.exit(1);
  }
  console.log('assets: every file in out/ is ≤ 20 MiB');
}
