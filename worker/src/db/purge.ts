import { utcDay } from '../order/limits';

export const RETENTION_DAYS = 30;

/** Deletes everything older than the retention window. Returns rows deleted across all tables. */
export async function purgeOld(db: D1Database, now: number, days = RETENTION_DAYS): Promise<number> {
  const cutoff = now - days * 24 * 60 * 60_000;
  const results = await db.batch([
    db.prepare('DELETE FROM unknown_questions WHERE created_at < ?').bind(cutoff),
    db.prepare('DELETE FROM rate_limits WHERE ts < ?').bind(cutoff),
    db.prepare('DELETE FROM turns WHERE created_at < ?').bind(cutoff),
    db.prepare('DELETE FROM signals WHERE created_at < ?').bind(cutoff),
    db.prepare('DELETE FROM weight_moves WHERE created_at < ?').bind(cutoff),
    db.prepare('DELETE FROM ai_budget WHERE day < ?').bind(utcDay(cutoff)),
  ]);
  return results.reduce((n, r) => n + (r.meta.changes ?? 0), 0);
}
