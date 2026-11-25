import { mkdirSync, writeFileSync } from 'node:fs';
import MiniSearch from 'minisearch';
import type { Profile } from '../lib/content/schema.ts';
import { searchOptions, type Chunk } from '../lib/search/types.ts';

/** Markdown to readable text: keeps words and link text, drops syntax. */
export function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/(\*\*|__|\*|_|`)/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Splits text into pieces of at most `max` chars, breaking only at spaces. */
function splitLong(text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    // A single word longer than max can't be split at a space; hard-cut it rather than exceed the limit.
    for (let w = word; w.length > 0; w = w.slice(max)) {
      const piece = w.slice(0, max);
      if (!line) line = piece;
      else if (line.length + 1 + piece.length <= max) line += ` ${piece}`;
      else {
        out.push(line);
        line = piece;
      }
    }
  }
  if (line) out.push(line);
  return out;
}

/** Packs paragraphs into chunks of at most `maxChars`, splitting on paragraph boundaries first, then words. */
export function chunkDocument(slug: string, title: string, body: string, maxChars = 800): Chunk[] {
  const pieces = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => (p.length > maxChars ? splitLong(p, maxChars) : [p]));

  const texts: string[] = [];
  for (const piece of pieces) {
    const last = texts.at(-1);
    if (last !== undefined && last.length + 2 + piece.length <= maxChars) texts[texts.length - 1] = `${last}\n\n${piece}`;
    else texts.push(piece);
  }
  return texts.map((text, n) => ({ id: `${slug}#${n}`, sourceId: slug, title, text }));
}

/** Roles, education and skills as citable evidence: one plain sentence each, linked to /facts/ via sourceId `profile`. */
export function profileChunks(profile: Profile): Chunk[] {
  const texts = [
    ...profile.roles.map((r) => `Worked in ${r.kind}: ${r.title}.`),
    ...profile.education.map((e) => `Studying ${e.degree} at ${e.institution} (${e.status}).`),
    ...profile.skills.map((k) => `Skill: ${k.name}.`),
  ];
  return texts.map((text, n) => ({ id: `profile#${n}`, sourceId: 'profile', title: 'Facts', text }));
}

export function buildSearchIndex(chunks: Chunk[]): string {
  const index = new MiniSearch<Chunk>(searchOptions);
  index.addAll(chunks);
  return JSON.stringify(index);
}

/** Drops Content Collections bookkeeping so only schema fields reach the Worker. */
function stripMeta<T extends Record<string, unknown>>(doc: T) {
  const { _meta, content, html, ...rest } = doc as T & { _meta?: unknown; content?: unknown; html?: unknown };
  void _meta, void content, void html;
  return rest;
}

async function main() {
  // Reads the collections that `next build` just validated and generated.
  const { allPosts, allProjects, allProfiles, allHouseMenus } = await import('../.content-collections/generated/index.js');
  const docs = [
    ...allProjects.map((p) => ({ slug: p.slug, title: p.title, body: `${p.summary}\n\n${p.content}` })),
    ...allPosts.map((p) => ({ slug: p.slug, title: p.title, body: `${p.summary}\n\n${p.content}` })),
  ];
  const [profile] = allProfiles;
  const [houseMenu] = allHouseMenus;
  if (!profile || !houseMenu) throw new Error('content/profile.yaml and content/house-menu.yaml are required');
  const chunks = [...docs.flatMap((d) => chunkDocument(d.slug, d.title, toPlainText(d.body))), ...profileChunks(profile)];

  const out = 'worker/generated';
  mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/search-index.json`, buildSearchIndex(chunks));
  writeFileSync(`${out}/chunks.json`, JSON.stringify(chunks.map(({ id, text }) => ({ id, text }))));
  writeFileSync(`${out}/profile.json`, JSON.stringify(stripMeta(profile)));
  writeFileSync(`${out}/house-menu.json`, JSON.stringify(stripMeta(houseMenu)));
  console.log(`search index: ${chunks.length} chunks from ${docs.length} documents → ${out}/`);
}

if (import.meta.main) await main();
