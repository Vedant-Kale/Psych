import type { AsPlainObject } from 'minisearch';
import type { Context } from 'hono';
import type { HouseMenu, Profile } from '../../../lib/content/schema';
import houseMenuJson from '../../generated/house-menu.json';
import profileJson from '../../generated/profile.json';
import searchIndexJson from '../../generated/search-index.json';
import vectorsJson from '../../generated/vectors.json';
import { history, recordTurn } from '../db/turns';
import type { Env } from '../index';
import { readBodyLimited } from './body';
import { enforceCitations } from './citations';
import { answerFromProfile } from './facts';
import { checkRate, DAILY_AI_CAP, ipKey, takeBudget, utcDay } from './limits';
import { callModel } from './model';
import { buildMessages } from './prompt';
import { parseOrderRequest } from './request';
import { retrieve, retrieveHybrid, type Vectors } from './retrieve';
import { screenInput } from './screen';
import { verifyTurnstile } from './turnstile';
import type { Answered, HouseMenuReason, OrderResult } from './types';
import { logUnknown } from './unknown';

// Validated by Zod at build time (scripts/build-search-index.ts reads only validated collections).
const profile = profileJson as Profile;
const menu = houseMenuJson as HouseMenu;
const searchIndex = searchIndexJson as unknown as AsPlainObject;
const vectors = vectorsJson as Vectors;

const houseMenu = (reason: HouseMenuReason): OrderResult => ({ kind: 'house-menu', reason, menu });

export const NOTHING_SUPPORTS = 'Nothing in my work supports that yet — noted for a future post.';

/** Steps follow Architecture §4. */
export async function handleOrder(c: Context<{ Bindings: Env }>) {
  // 1 parse
  const raw = await readBodyLimited(c.req.raw);
  if (raw === null) return c.json({ error: 'body too large' }, 400);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: 'invalid JSON' }, 400);
  }
  const parsed = parseOrderRequest(body);
  if (!parsed.ok) return c.json({ error: 'expected {"text": string, "turnstileToken": string}' }, 400);

  // 2 Turnstile
  const ip = c.req.header('cf-connecting-ip') ?? '';
  if (!(await verifyTurnstile(parsed.turnstileToken, c.env.TURNSTILE_SECRET, ip))) {
    return c.json({ error: 'verification failed' }, 403);
  }

  try {
    return await serve(c, parsed.text, ip, parsed.conversationId);
  } catch {
    // D1 or any later failure: the visitor still gets something useful, never a 500.
    return c.json(houseMenu('ai-error'));
  }
}

async function serve(c: Context<{ Bindings: Env }>, text: string, ip: string, conversationId?: string) {
  const now = Date.now();

  /** Answers, and keeps the turn (full text, 30 days) when the visitor sent a conversation id. House-menu answers aren't kept: nothing was answered. */
  const answer = async (result: OrderResult, chunkIds: string[] = []) => {
    if (conversationId && result.kind !== 'house-menu') {
      const turnId = await recordTurn(c.env.DB, { conversationId, text: text.trim(), kind: result.kind, chunkIds, now });
      return c.json<Answered>({ ...result, turnId });
    }
    return c.json<OrderResult>(result);
  };

  // 3 rate limit. Without the salt an IP hash is guessable, so fail closed and store nothing.
  if (!c.env.IP_SALT_SECRET) return c.json(houseMenu('disabled'));
  const key = await ipKey(ip, c.env.IP_SALT_SECRET, utcDay(now));
  if (!(await checkRate(c.env.DB, key, now))) return c.json(houseMenu('rate-limit'), 429);

  // 4 screen
  const screened = screenInput(text);
  if (!screened.ok) return c.json<OrderResult>({ kind: 'refused', reason: screened.reason });

  // 5 facts (no AI, no budget)
  const fact = answerFromProfile(text, profile);
  if (fact) return answer({ kind: 'fact', ...fact });

  // kill switch
  if (c.env.ORDER_ENABLED !== 'true') return c.json(houseMenu('disabled'));

  // 7 keyword retrieval first: it's local and free, so with no vectors an order nothing matches never spends budget
  if (Object.keys(vectors).length === 0 && retrieve(searchIndex, text).length === 0) return nothingSupports(c, text, now, answer);

  // 6 daily AI budget. One slot covers the query embedding (under 1 Neuron) and the model call.
  const cap = Number(c.env.AI_DAILY_CAP ?? DAILY_AI_CAP);
  if (!(await takeBudget(c.env.DB, now, Number.isInteger(cap) && cap >= 0 ? cap : DAILY_AI_CAP))) return c.json(houseMenu('budget'));

  // 7b hybrid retrieval: keywords plus meaning; any embeddings failure falls back to keywords
  const chunks = await retrieveHybrid(searchIndex, vectors, c.env.AI, text);
  if (chunks.length === 0) return nothingSupports(c, text, now, answer);

  // 8 model (throws → house menu via the caller) · 9 citations · 10 nothing survived
  const past = conversationId ? await history(c.env.DB, conversationId) : [];
  const raw = await callModel(c.env.AI, c.env.ORDER_MODEL, buildMessages(text, chunks, past));
  const layers = enforceCitations(raw, chunks);
  const chunkIds = chunks.map((k) => k.id);
  if (layers.length === 0) return nothingSupports(c, text, now, (r) => answer(r, chunkIds), chunks[0]?.id);
  return answer({ kind: 'mix', layers }, chunkIds);
}

/** Step 10: an honest "no", and the order is kept (text only) so it can become a future post. */
async function nothingSupports(
  c: Context<{ Bindings: Env }>,
  text: string,
  now: number,
  answer: (r: OrderResult) => Promise<Response>,
  closest?: string,
) {
  await logUnknown(c.env.DB, text, now);
  return answer({ kind: 'none', message: NOTHING_SUPPORTS, ...(closest ? { closest } : {}) });
}
