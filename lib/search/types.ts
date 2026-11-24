import type { Options } from 'minisearch';

/** A retrievable piece of content. `id` is `<slug>#<n>`, stable for a given body. */
export type Chunk = { id: string; sourceId: string; title: string; text: string };

/** Shared by the build (to create the index) and the Worker (to load it): both sides must match. */
export const searchOptions: Options<Chunk> = {
  fields: ['title', 'text'],
  storeFields: ['sourceId', 'title', 'text'],
  searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2 },
};
