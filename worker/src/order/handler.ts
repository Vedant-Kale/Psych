import type { Context } from 'hono';
import type { HouseMenu, Profile } from '../../../lib/content/schema';
import houseMenuJson from '../../generated/house-menu.json';
import profileJson from '../../generated/profile.json';
import type { Env } from '../index';
import { readBodyLimited } from './body';
import { answerFromProfile } from './facts';
import { houseMenu } from './house-menu';
import { checkRate, ipKey, takeBudget, utcDay } from './limits';
import { parseOrderRequest } from './request';
import { screenInput } from './screen';
import { verifyTurnstile } from './turnstile';
import type { OrderResult } from './types';

// Validated by Zod at build time (scripts/build-search-index.ts reads only validated collections).
const profile = profileJson as Profile;
const menu = houseMenuJson as HouseMenu;

/** Steps follow Architecture §4. The AI path (7–10) lands in tickets 14–15. */
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
    return await serve(c, parsed.text, ip);
  } catch {
    // D1 or any later failure: the visitor still gets something useful, never a 500.
    return c.json(houseMenu(menu, 'ai-error'));
  }
}

async function serve(c: Context<{ Bindings: Env }>, text: string, ip: string) {
  const now = Date.now();

  // 3 rate limit. Without the salt an IP hash is guessable, so fail closed and store nothing.
  if (!c.env.IP_SALT_SECRET) return c.json(houseMenu(menu, 'disabled'));
  const key = await ipKey(ip, c.env.IP_SALT_SECRET, utcDay(now));
  if (!(await checkRate(c.env.DB, key, now))) return c.json(houseMenu(menu, 'rate-limit'), 429);

  // 4 screen
  const screened = screenInput(text);
  if (!screened.ok) return c.json<OrderResult>({ kind: 'refused', reason: screened.reason });

  // 5 facts (no AI, no budget)
  const fact = answerFromProfile(text, profile);
  if (fact) return c.json<OrderResult>({ kind: 'fact', ...fact });

  // kill switch
  if (c.env.ORDER_ENABLED !== 'true') return c.json(houseMenu(menu, 'disabled'));

  // 6 daily AI budget
  if (!(await takeBudget(c.env.DB, now))) return c.json(houseMenu(menu, 'budget'));

  // shortcut: the model call (ticket 14) replaces this; production keeps ORDER_ENABLED=false until then.
  return c.json(houseMenu(menu, 'disabled'));
}
