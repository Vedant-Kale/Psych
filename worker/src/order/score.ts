export type SignalType = 'yes' | 'no' | 'opened-source' | 'receipt' | 'interview';
export type FollowUp = 'reworded' | 'deeper' | 'new-topic';

/** Decision #29. A signal is about the turn it was sent for. */
export const SIGNAL_SCORES: Record<SignalType, number> = { yes: 2, no: -3, 'opened-source': 1, receipt: 3, interview: 3 };

/** What the next order says about the one before it. */
const FOLLOW_UP_SCORE = { reworded: -2, deeper: 1, 'new-topic': 1 } as const;

/** The turn's new score after a signal or a follow-up. A new topic first halves the turn's demerits (toward zero). */
export function nextScore(score: number, event: SignalType | FollowUp): number {
  if (event === 'new-topic') return (score < 0 ? Math.trunc(score / 2) : score) + FOLLOW_UP_SCORE['new-topic'];
  return score + (event in FOLLOW_UP_SCORE ? FOLLOW_UP_SCORE[event as FollowUp] : SIGNAL_SCORES[event as SignalType]);
}

const words = (s: string) => new Set(s.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);

/** Share of words in common (Jaccard). Used when there are no embeddings, so scoring still works on keyword search alone. */
export function tokenSimilarity(a: string, b: string): number {
  const x = words(a);
  const y = words(b);
  if (x.size === 0 || y.size === 0) return 0;
  let both = 0;
  for (const w of x) if (y.has(w)) both++;
  return both / (x.size + y.size - both);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

// The two measures live on different scales, so each has its own bars. Starting guesses, to be tuned with the simulator.
const REWORDED_AT = { tokens: 0.5, embedding: 0.85 };
const DEEPER_AT = { tokens: 0.2, embedding: 0.6 };

/** `question`: closeness to the previous order. `answer`: closeness to the evidence that answered it. */
export function classifyFollowUp(s: { question: number; answer: number; measure: 'tokens' | 'embedding' }): FollowUp {
  if (s.question >= REWORDED_AT[s.measure] && s.question >= s.answer) return 'reworded';
  if (s.answer >= DEEPER_AT[s.measure]) return 'deeper';
  return 'new-topic';
}
