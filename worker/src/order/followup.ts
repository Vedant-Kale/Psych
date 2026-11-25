import type { AsPlainObject } from 'minisearch';
import { bump, lastTurn, setScore } from '../db/outcomes';
import { chunkTexts, type Vectors } from './retrieve';
import { classifyFollowUp, cosineSimilarity, nextScore, tokenSimilarity } from './score';
import { learn, type Weights } from './weights';

/**
 * Scores the previous turn by what the new order says about it: a repeat (−2), a step deeper (+1) or a new topic (+1).
 * With embeddings for both orders it compares meaning, reusing the vectors already computed (no extra AI call);
 * otherwise it compares words, so scoring keeps working on keyword search alone.
 */
export async function scoreFollowUp(
  db: D1Database,
  now: number,
  conversationId: string,
  text: string,
  queryVector: number[] | undefined,
  index: AsPlainObject,
  vectors: Vectors,
  base: Weights,
): Promise<void> {
  const prev = await lastTurn(db, conversationId);
  if (!prev) return;
  const answerVectors = prev.chunkIds.map((id) => vectors[id]).filter((v): v is number[] => !!v);
  const follow =
    queryVector && prev.vector
      ? classifyFollowUp({
          measure: 'embedding',
          question: cosineSimilarity(prev.vector, queryVector),
          answer: Math.max(0, ...answerVectors.map((v) => cosineSimilarity(queryVector, v))),
        })
      : classifyFollowUp({
          measure: 'tokens',
          question: tokenSimilarity(prev.text, text),
          answer: tokenSimilarity(text, chunkTexts(index, prev.chunkIds).join(' ')),
        });
  const score = nextScore(prev.score, follow);
  await setScore(db, prev.id, score);
  await learn(db, conversationId, prev.chunkIds, score - prev.score, base, now);
  await bump(db, now, 'followups');
  await bump(db, now, follow === 'new-topic' ? 'new_topic' : follow);
}
