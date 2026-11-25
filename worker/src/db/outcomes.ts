import { utcDay } from '../order/limits';

const COLUMNS = ['turns', 'followups', 'reworded', 'deeper', 'new_topic', 'yes', 'no', 'opened_source', 'receipt', 'interview'] as const;
export type OutcomeColumn = (typeof COLUMNS)[number];

/** Adds 1 to today's count. The column comes from the fixed list above, never from a request. */
export async function bump(db: D1Database, now: number, column: OutcomeColumn): Promise<void> {
  if (!COLUMNS.includes(column)) throw new Error(`unknown outcome column ${column}`);
  await db
    .prepare(`INSERT INTO daily_outcomes (day, ${column}) VALUES (?1, 1) ON CONFLICT (day) DO UPDATE SET ${column} = ${column} + 1`)
    .bind(utcDay(now))
    .run();
}

export type PreviousTurn = { id: number; text: string; chunkIds: string[]; vector: number[] | null; score: number };

/** The latest turn of a conversation, or null for its first order. */
export async function lastTurn(db: D1Database, conversationId: string): Promise<PreviousTurn | null> {
  const r = await db
    .prepare('SELECT id, text, chunk_ids, vector, score FROM turns WHERE conversation_id = ? ORDER BY seq DESC LIMIT 1')
    .bind(conversationId)
    .first<{ id: number; text: string; chunk_ids: string; vector: string | null; score: number }>();
  return r ? { id: r.id, text: r.text, chunkIds: JSON.parse(r.chunk_ids) as string[], vector: r.vector ? (JSON.parse(r.vector) as number[]) : null, score: r.score } : null;
}

export async function setScore(db: D1Database, turnId: number, score: number): Promise<void> {
  await db.prepare('UPDATE turns SET score = ? WHERE id = ?').bind(score, turnId).run();
}

/** Applies a signal to its turn's score. Read-then-write is fine: signals for one turn are capped at 20 and arrive one click at a time. */
export async function scoreSignal(db: D1Database, turnId: number, next: (score: number) => number): Promise<void> {
  const r = await db.prepare('SELECT score FROM turns WHERE id = ?').bind(turnId).first<{ score: number }>();
  if (r) await setScore(db, turnId, next(r.score));
}

/** The evidence ids that answered a stored turn. */
export async function chunkIdsOf(db: D1Database, turnId: number): Promise<string[]> {
  const r = await db.prepare('SELECT chunk_ids FROM turns WHERE id = ?').bind(turnId).first<{ chunk_ids: string }>();
  return r ? (JSON.parse(r.chunk_ids) as string[]) : [];
}
