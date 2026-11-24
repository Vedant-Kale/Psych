import { Hono } from 'hono';
import { purgeOld } from './db/purge';
import { handleOrder } from './order/handler';

export type Env = {
  ORDER_ENABLED: string;
  ORDER_MODEL: string;
  TURNSTILE_SECRET: string;
  IP_SALT_SECRET: string;
  DB: D1Database;
  AI: Ai;
};

const app = new Hono<{ Bindings: Env }>().basePath('/api');

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
