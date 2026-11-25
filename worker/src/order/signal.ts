import type { Context } from 'hono';
import type { Env } from '../index';
import { readBodyLimited } from './body';
import { baseWeights } from './handler';
import { bump, chunkIdsOf, scoreSignal, type OutcomeColumn } from '../db/outcomes';
import { checkRate, ipKey, utcDay } from './limits';
import { CONVERSATION_ID } from './request';
import { nextScore, SIGNAL_SCORES, type SignalType } from './score';
import { learn } from './weights';

export const SIGNAL_TYPES = ['yes', 'no', 'opened-source', 'receipt', 'interview'] as const;
export const MAX_SIGNALS_PER_CONVERSATION = 20;
// A visitor clicks a handful of things per answer; far above the order limits' 5 per 10 minutes, far below spam.
const SIGNAL_BURST = 20;
const SIGNAL_DAILY = 100;
const MAX_SIGNAL_BODY = 1024;

/**
 * POST /api/signal { conversationId, turnId, type } → 204.
 * A signal counts only for a stored turn of that same conversation, so every one traces back to an order that passed
 * Turnstile. Capped per conversation and rate-limited per IP hash, so nobody can mint ids to steer the learning.
 */
export async function handleSignal(c: Context<{ Bindings: Env }>) {
  // A cross-site form can only send form or plain-text types; JSON makes a browser ask first, and we never answer that.
  if (!c.req.header('content-type')?.toLowerCase().startsWith('application/json')) return c.json({ error: 'expected application/json' }, 415);
  const raw = await readBodyLimited(c.req.raw, MAX_SIGNAL_BODY);
  if (raw === null) return c.json({ error: 'body too large' }, 400);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: 'invalid JSON' }, 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return c.json({ error: 'invalid body' }, 400);
  const { conversationId, turnId, type } = body as Record<string, unknown>;
  if (
    typeof conversationId !== 'string' ||
    !CONVERSATION_ID.test(conversationId) ||
    typeof turnId !== 'number' ||
    !Number.isSafeInteger(turnId) ||
    turnId < 1 ||
    typeof type !== 'string' ||
    !(SIGNAL_TYPES as readonly string[]).includes(type)
  ) {
    return c.json({ error: 'invalid signal' }, 400);
  }

  // Without the salt an IP hash is guessable, so fail closed and store nothing.
  if (!c.env.IP_SALT_SECRET) return c.json({ error: 'unavailable' }, 503);
  const now = Date.now();
  // "signal:" keeps this bucket apart from the order limits, so clicking never uses up a visitor's orders.
  const key = await ipKey(`signal:${c.req.header('cf-connecting-ip') ?? ''}`, c.env.IP_SALT_SECRET, utcDay(now));
  if (!(await checkRate(c.env.DB, key, now, SIGNAL_BURST, SIGNAL_DAILY))) return c.json({ error: 'too many signals' }, 429);

  const { meta } = await c.env.DB
    .prepare(
      `INSERT INTO signals (conversation_id, turn_id, type, created_at)
       SELECT ?1, ?2, ?3, ?4
       WHERE EXISTS (SELECT 1 FROM turns WHERE id = ?2 AND conversation_id = ?1)
         AND (SELECT COUNT(*) FROM signals WHERE conversation_id = ?1) < ?5`,
    )
    .bind(conversationId, turnId, type, now, MAX_SIGNALS_PER_CONVERSATION)
    .run();
  if (meta.changes !== 1) return c.json({ error: 'rejected' }, 400);
  await scoreSignal(c.env.DB, turnId, (score) => nextScore(score, type as SignalType));
  await learn(c.env.DB, conversationId, await chunkIdsOf(c.env.DB, turnId), SIGNAL_SCORES[type as SignalType], baseWeights, now);
  await bump(c.env.DB, now, type.replace('-', '_') as OutcomeColumn);
  return c.body(null, 204);
}
