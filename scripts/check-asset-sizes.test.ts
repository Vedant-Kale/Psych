import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { findOversized } from './check-asset-sizes.ts';

const MiB = 1024 * 1024;
const dir = mkdtempSync(join(tmpdir(), 'psych-sizes-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('findOversized', () => {
  it('flags a 21 MiB file and passes a 19 MiB file, in nested folders', () => {
    mkdirSync(join(dir, 'deep/er'), { recursive: true });
    writeFileSync(join(dir, 'ok.bin'), Buffer.alloc(19 * MiB));
    writeFileSync(join(dir, 'deep/er/big.bin'), Buffer.alloc(21 * MiB));
    expect(findOversized(dir)).toEqual([join(dir, 'deep/er/big.bin')]);
  });

  it('a file exactly at the limit passes', () => {
    const d = mkdtempSync(join(tmpdir(), 'psych-sizes-edge-'));
    writeFileSync(join(d, 'edge.bin'), Buffer.alloc(20 * MiB));
    expect(findOversized(d)).toEqual([]);
    rmSync(d, { recursive: true, force: true });
  });
});
