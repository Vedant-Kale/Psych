import type { RefusalReason } from './types';

export const MIN_CHARS = 3;
export const MAX_CHARS = 500;

// First line of defence only: citation enforcement (ticket 14) is what keeps the model honest.
const injection = [
  /\b(ignore|disregard|forget|override)\b[^.?!]{0,40}\b(instructions?|rules|prompts?|guidelines|directions)\b/i,
  /\bsystem\s+prompt\b/i,
  /\byou\s+are\s+now\b/i,
  /\b(jailbreak|developer\s+mode|DAN)\b/,
  /<\/?(system|assistant|instructions?)>/i,
];

const offTopic = [
  /\b(write|compose|tell|give)\b[^.?!]{0,30}\b(poems?|stor(y|ies)|jokes?|songs?|lyrics|essays?|limericks?|haikus?)\b/i,
  /\b(recipes?|weather|horoscope|lottery)\b/i,
];

export function screenInput(text: string): { ok: true } | { ok: false; reason: RefusalReason } {
  const t = text.trim();
  if (t.length < MIN_CHARS) return { ok: false, reason: 'empty' };
  if (t.length > MAX_CHARS) return { ok: false, reason: 'too_long' };
  if (injection.some((r) => r.test(t))) return { ok: false, reason: 'injection' };
  if (offTopic.some((r) => r.test(t))) return { ok: false, reason: 'off_topic' };
  return { ok: true };
}
