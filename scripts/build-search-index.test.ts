import { readFileSync } from 'node:fs';
import MiniSearch from 'minisearch';
import { describe, expect, it } from 'vitest';
import { searchOptions, type Chunk } from '../lib/search/types.ts';
import type { Profile } from '../lib/content/schema.ts';
import { buildSearchIndex, chunkDocument, postBody, profileChunks, toPlainText } from './build-search-index.ts';

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

describe('profileChunks', () => {
  const profile: Profile = {
    name: 'Test',
    headline: 'h',
    location: 'l',
    education: [{ degree: 'Master of AI', institution: 'RMIT University', status: 'in progress' }],
    roles: [
      { title: 'Bartending', kind: 'hospitality' },
      { title: 'Ushering at stadiums', kind: 'events' },
    ],
    skills: [{ name: 'Row-level security in Postgres', evidence: ['expense-track'] }],
    contact: { github: 'https://github.com/x' },
  };

  it('every role, education entry and skill is its own profile chunk, citable as profile#n', () => {
    const chunks = profileChunks(profile);
    expect(chunks.map((c) => c.id)).toEqual(['profile#0', 'profile#1', 'profile#2', 'profile#3']);
    expect(chunks.every((c) => c.sourceId === 'profile')).toBe(true);
    expect(chunks.map((c) => c.text)).toEqual([
      'Worked in hospitality: Bartending.',
      'Worked in events: Ushering at stadiums.',
      'Studying Master of AI at RMIT University (in progress).',
      'Skill: Row-level security in Postgres.',
    ]);
  });

  it('a search for customer-facing work finds a role chunk', () => {
    const index = MiniSearch.loadJSON<Chunk>(buildSearchIndex(profileChunks(profile)), searchOptions);
    expect(index.search('bartending hospitality')[0]?.id).toBe('profile#0');
  });
});

describe('postBody', () => {
  const post = { summary: 'A summary.', content: 'The body.' };

  it('is the summary then the body for an ordinary post', () => {
    expect(postBody(post)).toBe('A summary.\n\nThe body.');
  });

  it("puts a story's themes in the text, so a question about leadership can find it", () => {
    const body = postBody({ ...post, themes: ['leadership', 'pressure'] });
    expect(body).toBe('Themes: leadership, pressure.\n\nA summary.\n\nThe body.');
    const index = MiniSearch.loadJSON<Chunk>(buildSearchIndex(chunkDocument('captaincy', 'Captaincy', toPlainText(body))), searchOptions);
    expect(index.search('pressure')[0]?.id).toBe('captaincy#0');
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
