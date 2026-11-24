import MiniSearch, { type AsPlainObject } from 'minisearch';
import { searchOptions, type Chunk } from '../../../lib/search/types';

const cache = new WeakMap<AsPlainObject, MiniSearch<Chunk>>();

/** Top-k chunks by BM25. The index is loaded once per isolate. */
export function retrieve(index: AsPlainObject, text: string, k = 6): Chunk[] {
  let ms = cache.get(index);
  if (!ms) {
    ms = MiniSearch.loadJS<Chunk>(index, searchOptions);
    cache.set(index, ms);
  }
  return ms
    .search(text)
    .slice(0, k)
    .map((r) => ({ id: String(r.id), sourceId: r.sourceId as string, title: r.title as string, text: r.text as string }));
}
