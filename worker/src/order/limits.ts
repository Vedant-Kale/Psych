export const BURST_LIMIT = 5;
export const BURST_WINDOW_MS = 10 * 60_000;
export const DAILY_LIMIT = 30;
// Worst case ≈ 84 Neurons/call (6 full chunks + 512 output tokens) × 100 = 8,400, under the 10,000/day free
// allowance however much content grows. Measured today: 17.9 avg, 24.7 max (md-files/Research.md §5).
export const DAILY_AI_CAP = 100;

export const utcDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** sha256 hex of `ip|salt|day`: one-way, and rotates every UTC day so keys can't be linked across days. */
export async function ipKey(ip: string, salt: string, day: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}|${salt}|${day}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Records the request and returns true only if it is within both limits.
 * One INSERT … SELECT … WHERE statement, so check-and-record is atomic.
 * The key already rotates per UTC day, so every row under it counts toward the daily limit.
 */
export async function checkRate(db: D1Database, key: string, now: number): Promise<boolean> {
  const { meta } = await db
    .prepare(
      `INSERT INTO rate_limits (key, ts)
       SELECT ?1, ?2
       WHERE (SELECT COUNT(*) FROM rate_limits WHERE key = ?1 AND ts > ?2 - ?3) < ?4
         AND (SELECT COUNT(*) FROM rate_limits WHERE key = ?1) < ?5`,
    )
    .bind(key, now, BURST_WINDOW_MS, BURST_LIMIT, DAILY_LIMIT)
    .run();
  return meta.changes === 1;
}

/** Takes one model call from today's budget; false once `cap` is reached. The UPDATE's WHERE makes it race-safe. */
export async function takeBudget(db: D1Database, now: number, cap = DAILY_AI_CAP): Promise<boolean> {
  const day = utcDay(now);
  const [, update] = await db.batch([
    db.prepare('INSERT INTO ai_budget (day, calls) VALUES (?1, 0) ON CONFLICT (day) DO NOTHING').bind(day),
    db.prepare('UPDATE ai_budget SET calls = calls + 1 WHERE day = ?1 AND calls < ?2 RETURNING calls').bind(day, cap),
  ]);
  return (update?.results.length ?? 0) === 1;
}
