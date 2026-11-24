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

// The model guessing past the evidence ("could indicate he values feedback").
const HEDGE = /\b(could|may|might|suggests?|suggesting|indicates?|indicating|implies|imply|implying|likely|possibly|perhaps|probably|seems?)\b/i;

// People and business claims must be said in so many words by the cited text; technical work alone never proves them.
const CLAIMS = [
  /\b(lead\w*|led)\b/i,
  /\bmanag\w*/i,
  /\bmentor\w*/i,
  /\bteams?\b/i,
  /\bbusiness\w*/i,
  /\bacumen\b/i,
  /\b(customers?|clients?|guests?)\b/i,
  /\bstakeholders?\b/i,
  /\bfeedback\b/i,
  /\bcommunicat\w*/i,
  /\bcollaborat\w*/i,
];

/**
 * The guarantee behind The Order: a layer survives only if every evidence id is one we supplied,
 * every number in it appears in the chunks it cites, it doesn't hedge, and any people or business
 * claim (leadership, customers, feedback…) is stated by those chunks themselves.
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

    const source = cited.map((c) => c!.text).join('\n');
    const claim = `${skill} ${rationale}`;
    const supported = numbers(source);
    if ([...numbers(claim)].some((n) => !supported.has(n))) continue;
    if (HEDGE.test(claim)) continue;
    if (CLAIMS.some((re) => re.test(claim) && !re.test(source))) continue;

    kept.push({ skill, evidenceIds: [...new Set(evidence_ids)], rationale });
    if (kept.length === MAX_LAYERS) break;
  }
  return kept;
}
