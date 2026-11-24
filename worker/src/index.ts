import { Hono } from 'hono';
import { purgeOld } from './db/purge';
import { handleOrder } from './order/handler';

export type Env = {
  ORDER_ENABLED: string;
  ORDER_MODEL: string;
  /** Per-environment daily AI cap; production + staging must stay ≤ 119 (md-files/plans/order-v2.md). */
  AI_DAILY_CAP?: string;
  TURNSTILE_SECRET: string;
  IP_SALT_SECRET: string;
  DB: D1Database;
  AI: Ai;
};

const app = new Hono<{ Bindings: Env }>().basePath('/api');

// Static assets get these from out/_headers; Worker responses don't, so set them here.
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
});

app.get('/health', (c) => c.json({ ok: true }));

app.use('/order', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
});
app.post('/order', handleOrder);

export default {
  fetch: app.fetch,
  /** Daily retention purge (cron in wrangler.jsonc). */
  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(purgeOld(env.DB, Date.now()));
  },
} satisfies ExportedHandler<Env>;
