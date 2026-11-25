import MiniSearch, { type AsPlainObject } from 'minisearch';
import { searchOptions, type Chunk } from '../../../lib/search/types';
import { clampWeight, type Weights } from './weights';

const cache = new WeakMap<AsPlainObject, MiniSearch<Chunk>>();

function load(index: AsPlainObject): MiniSearch<Chunk> {
  let ms = cache.get(index);
  if (!ms) {
    ms = MiniSearch.loadJS<Chunk>(index, searchOptions);
    cache.set(index, ms);
  }
  return ms;
}

/** Top-k chunks by BM25. The index is loaded once per isolate. */
export function retrieve(index: AsPlainObject, text: string, k = 6): Chunk[] {
  return load(index)
    .search(text)
    .slice(0, k)
    .map((r) => ({ id: String(r.id), sourceId: r.sourceId as string, title: r.title as string, text: r.text as string }));
}

export const EMBED_MODEL = '@cf/baai/bge-small-en-v1.5';
/** Chunk id → embedding, built at deploy time (scripts/embed-chunks.ts). `{}` means keyword search only. */
export type Vectors = Record<string, number[]>;
type AiRunner = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };

/** Below this cosine similarity a chunk is not "about" the order. A conservative starting point, to be tuned with the simulator. */
export const MIN_COSINE = 0.65;
const RRF_K = 60; // reciprocal-rank fusion: 1 / (RRF_K + rank), summed over both rankings
const MAX_PER_SOURCE = 2;
const EMBED_TIMEOUT_MS = 2500;

const cosine = (a: number[], b: number[]) => {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
};

/** The order as one embedding, or null on any failure or timeout, so retrieval can fall back to keywords. */
async function embedQuery(ai: AiRunner, text: string, dims: number, timeoutMs: number): Promise<number[] | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const out = (await Promise.race([
      ai.run(EMBED_MODEL, { text: [text] }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('embedding timed out')), timeoutMs);
      }),
    ])) as { data?: unknown } | null;
    const v = Array.isArray(out?.data) ? (out.data as unknown[])[0] : undefined;
    return Array.isArray(v) && v.length === dims && v.every((n) => typeof n === 'number') ? (v as number[]) : null;
  } catch {
    return null;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Keyword (BM25) and meaning (embedding cosine) rankings fused by rank, at most 2 chunks per source.
 * Any embeddings problem, or no vectors at all, gives plain keyword results: the order is still answered.
 */
export async function retrieveHybrid(
  index: AsPlainObject,
  vectors: Vectors,
  ai: AiRunner,
  text: string,
  k = 6,
  timeoutMs = EMBED_TIMEOUT_MS,
  /** `weights` re-rank what was found (never add to it); `queryVector` receives the order's embedding so scoring can reuse it. */
  extra?: { queryVector?: number[]; weights?: Weights },
): Promise<Chunk[]> {
  const keyword = retrieve(index, text, k * 2);
  const first = Object.values(vectors)[0];
  const query = first ? await embedQuery(ai, text, first.length, timeoutMs) : null;

  if (query && extra) extra.queryVector = query;
  const byId = new Map(keyword.map((c) => [c.id, c]));
  const score = new Map<string, number>();
  const add = (id: string, rank: number) => score.set(id, (score.get(id) ?? 0) + 1 / (RRF_K + rank));
  keyword.forEach((c, rank) => add(c.id, rank));

  if (query) {
    const ms = load(index);
    Object.entries(vectors)
      .map(([id, v]) => [id, cosine(query, v)] as const)
      .filter(([id, sim]) => sim >= MIN_COSINE && ms.has(id))
      .sort((a, b) => b[1] - a[1])
      .slice(0, k * 2)
      .forEach(([id], rank) => {
        add(id, rank);
        if (!byId.has(id)) {
          const f = ms.getStoredFields(id)!;
          byId.set(id, { id, sourceId: f.sourceId as string, title: f.title as string, text: f.text as string });
        }
      });
  }

  const perSource = new Map<string, number>();
  const out: Chunk[] = [];
  const weighted = [...score].map(([id, s]) => [id, s * clampWeight(extra?.weights?.[id] ?? 1)] as const);
  for (const [id] of weighted.sort((a, b) => b[1] - a[1])) {
    const c = byId.get(id)!;
    if ((perSource.get(c.sourceId) ?? 0) >= MAX_PER_SOURCE) continue;
    perSource.set(c.sourceId, (perSource.get(c.sourceId) ?? 0) + 1);
    out.push(c);
    if (out.length === k) break;
  }
  return out;
}

/** The text of chunks by id, for comparing an order with the evidence that answered the one before it. Unknown ids are skipped. */
export function chunkTexts(index: AsPlainObject, ids: string[]): string[] {
  const ms = load(index);
  return ids.filter((id) => ms.has(id)).map((id) => String(ms.getStoredFields(id)!.text));
}
