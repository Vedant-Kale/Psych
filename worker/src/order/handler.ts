import type { Context } from 'hono';
import type { HouseMenu, Profile } from '../../../lib/content/schema';
import houseMenuJson from '../../generated/house-menu.json';
import profileJson from '../../generated/profile.json';
import type { Env } from '../index';
import { readBodyLimited } from './body';
import { answerFromProfile } from './facts';
import { houseMenu } from './house-menu';
import { parseOrderRequest } from './request';
import { screenInput } from './screen';
import type { OrderResult } from './types';

// Validated by Zod at build time (scripts/build-search-index.ts reads only validated collections).
const profile = profileJson as Profile;
const menu = houseMenuJson as HouseMenu;

/** Steps follow Architecture §4. Turnstile (2), rate limit (3) and the AI path (6–10) land in tickets 12–15. */
export async function handleOrder(c: Context<{ Bindings: Env }>) {
  const raw = await readBodyLimited(c.req.raw);
  if (raw === null) return c.json({ error: 'body too large' }, 400);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: 'invalid JSON' }, 400);
  }
  const parsed = parseOrderRequest(body);
  if (!parsed.ok) return c.json({ error: 'expected {"text": string}' }, 400);

  const screened = screenInput(parsed.text);
  if (!screened.ok) return c.json<OrderResult>({ kind: 'refused', reason: screened.reason });

  const fact = answerFromProfile(parsed.text, profile);
  if (fact) return c.json<OrderResult>({ kind: 'fact', ...fact });

  // Kill switch. The AI path (ticket 14) goes after this check; until then every order past facts gets the menu.
  return c.json(houseMenu(menu, 'disabled'));
}
