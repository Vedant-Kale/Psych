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

/** No unstated numbers, no hedging, no people or business claim the cited text doesn't make itself. */
function claimIsSupported(claim: string, source: string): boolean {
  const supported = numbers(source);
  if ([...numbers(claim)].some((n) => !supported.has(n))) return false;
  if (HEDGE.test(claim)) return false;
  return !CLAIMS.some((re) => re.test(claim) && !re.test(source));
}

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

    if (!claimIsSupported(`${skill} ${rationale}`, cited.map((c) => c!.text).join('\n'))) continue;

    kept.push({ skill, evidenceIds: [...new Set(evidence_ids)], rationale });
    if (kept.length === MAX_LAYERS) break;
  }
  return kept;
}

export const MAX_ANSWER_WORDS = 80;
const rawSentence = z.object({ text: z.string().trim().min(1).max(300), evidence_ids: z.array(z.string()).min(1) });
// The answer is the owner speaking: a sentence about "he" or "Vedant" is the model narrating, so it is dropped.
const THIRD_PERSON = /\b(he|his|him|himself|vedant|kale)\b/i;

/**
 * The same guarantee for a behaviour answer: each sentence must cite evidence we supplied and be supported by it,
 * speak in the first person, and the whole answer stops at the last full sentence that fits in 80 words.
 * Null when nothing survives, so the visitor gets an honest "no" instead of a stretch.
 */
export function enforceAnswer(raw: unknown, chunks: Chunk[]): { text: string; evidenceIds: string[] } | null {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  const top = z.object({ sentences: z.array(z.unknown()) }).safeParse(value);
  if (!top.success) return null;

  const byId = new Map(chunks.map((c) => [c.id, c]));
  const kept: string[] = [];
  const ids = new Set<string>();
  let wordCount = 0;
  for (const candidate of top.data.sentences) {
    const parsed = rawSentence.safeParse(candidate);
    if (!parsed.success) continue;
    const { text, evidence_ids } = parsed.data;
    const cited = evidence_ids.map((id) => byId.get(id));
    if (cited.some((c) => c === undefined)) continue;
    if (THIRD_PERSON.test(text) || !claimIsSupported(text, cited.map((c) => c!.text).join('\n'))) continue;
    const n = text.split(/\s+/).length;
    if (wordCount + n > MAX_ANSWER_WORDS) break;
    wordCount += n;
    kept.push(text);
    evidence_ids.forEach((id) => ids.add(id));
  }
  return kept.length > 0 ? { text: kept.join(' '), evidenceIds: [...ids] } : null;
}
