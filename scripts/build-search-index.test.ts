import { readFileSync } from 'node:fs';
import MiniSearch from 'minisearch';
import { describe, expect, it } from 'vitest';
import { searchOptions, type Chunk } from '../lib/search/types.ts';
import { buildSearchIndex, chunkDocument, toPlainText } from './build-search-index.ts';

const para = (n: number, word = 'word') => Array.from({ length: n }, () => word).join(' ');

describe('chunkDocument', () => {
  it('chunk ids are stable and sequential', () => {
    const body = [para(100), para(100), para(100)].join('\n\n');
    const a = chunkDocument('my-post', 'My post', body);
    const b = chunkDocument('my-post', 'My post', body);
    expect(a.map((c) => c.id)).toEqual(a.map((_, i) => `my-post#${i}`));
    expect(a).toEqual(b);
    expect(a.every((c) => c.sourceId === 'my-post' && c.title === 'My post')).toBe(true);
  });

  it('no chunk exceeds 800 chars', () => {
    const body = [para(50), para(400), para(30), para(300)].join('\n\n');
    const chunks = chunkDocument('s', 'S', body);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(800);
  });

  it('never splits mid-word', () => {
    const body = para(400, 'abcdefg');
    for (const c of chunkDocument('s', 'S', body)) {
      expect(c.text.split(' ').every((w) => w === 'abcdefg')).toBe(true);
    }
  });

  it('packs short paragraphs together and keeps all the text', () => {
    const chunks = chunkDocument('s', 'S', 'one\n\ntwo\n\nthree');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.text).toBe('one\n\ntwo\n\nthree');
  });

  it('returns no chunks for an empty body', () => {
    expect(chunkDocument('s', 'S', '  \n\n ')).toEqual([]);
  });
});

describe('toPlainText', () => {
  it('drops markdown syntax but keeps link text', () => {
    expect(toPlainText('## Head\n\n**bold** and [a link](https://x.test) `code`')).toBe('Head\n\nbold and a link code');
  });
});

describe('buildSearchIndex', () => {
  it("round-trip: loaded index finds 'row-level security' in the expense-track project chunk", () => {
    const md = readFileSync('content/projects/expense-track.md', 'utf8').replace(/^---[\s\S]*?\n---\n/, '');
    const chunks: Chunk[] = [
      ...chunkDocument('expense-track', 'expense-track-agent', toPlainText(md)),
      ...chunkDocument('other', 'Other', 'Coffee, walks and football captaincy.'),
    ];
    const index = MiniSearch.loadJSON<Chunk>(buildSearchIndex(chunks), searchOptions);
    const [top] = index.search('row-level security');
    expect(top?.id).toBe('expense-track#0');
    expect(top?.sourceId).toBe('expense-track');
    expect(String(top?.text)).toMatch(/row-level security/i);
  });
});
