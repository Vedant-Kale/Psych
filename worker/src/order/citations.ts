import { z } from 'zod';
import type { Chunk } from '../../../lib/search/types';
import type { Layer } from './types';

export const MAX_LAYERS = 5;

const rawLayer = z.object({
  skill: z.string().trim().min(1).max(120),
  evidence_ids: z.array(z.string()).min(1),
  rationale: z.string().trim().min(1).max(400),
});

const numbers = (s: string) => new Set(s.match(/\d+(?:[.,]\d+)?/g) ?? []);

/**
 * The guarantee behind The Order: a layer survives only if every evidence id is one we supplied
 * and every number in its rationale appears, as a whole number, in the chunks it cites.
 * Anything else the model wrote (including free-text notes) is dropped.
 */
export function enforceCitations(raw: unknown, chunks: Chunk[]): Layer[] {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  const top = z.object({ layers: z.array(z.unknown()) }).safeParse(value);
  if (!top.success) return [];

  const byId = new Map(chunks.map((c) => [c.id, c]));
  const kept: Layer[] = [];
  for (const candidate of top.data.layers) {
    const parsed = rawLayer.safeParse(candidate);
    if (!parsed.success) continue;
    const { skill, evidence_ids, rationale } = parsed.data;
    const cited = evidence_ids.map((id) => byId.get(id));
    if (cited.some((c) => c === undefined)) continue;

    const supported = numbers(cited.map((c) => c!.text).join('\n'));
    if ([...numbers(`${skill} ${rationale}`)].some((n) => !supported.has(n))) continue;

    kept.push({ skill, evidenceIds: [...new Set(evidence_ids)], rationale });
    if (kept.length === MAX_LAYERS) break;
  }
  return kept;
}
