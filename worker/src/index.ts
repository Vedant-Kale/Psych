import { Hono } from 'hono';
import { handleOrder } from './order/handler';

export type Env = { ORDER_ENABLED: string; TURNSTILE_SECRET: string };

const app = new Hono<{ Bindings: Env }>().basePath('/api');

app.get('/health', (c) => c.json({ ok: true }));

app.use('/order', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
});
app.post('/order', handleOrder);

export default app;
