import { utcDay } from './limits';

export const W_MIN = 0.5;
export const W_MAX = 2;
const STEP_PER_POINT = 0.01; // a score change of 3 moves a weight by 0.03
export const MAX_MOVE_PER_CONVERSATION = 0.05;
export const MAX_MOVE_PER_DAY = 0.2;
const DAILY_DECAY = 0.02; // each day a weight closes 2% of its distance to its base

export type Weights = Record<string, number>;

export const clampWeight = (w: number) => (Number.isFinite(w) ? Math.min(W_MAX, Math.max(W_MIN, w)) : 1);

/** How far a score change may move a weight, given what this conversation and this day have already moved it. */
export function allowedMove(delta: number, movedByConversation: number, movedToday: number): number {
  const room = Math.max(0, Math.min(MAX_MOVE_PER_CONVERSATION - movedByConversation, MAX_MOVE_PER_DAY - movedToday));
  const wanted = delta * STEP_PER_POINT;
  return room === 0 || wanted === 0 ? 0 : Math.sign(wanted) * Math.min(Math.abs(wanted), room);
}

export const decayToward = (w: number, base: number) => clampWeight(w + (base - w) * DAILY_DECAY);

/**
 * Moves the weights of the chunks that answered a turn after that turn's score changed by `delta`.
 * A conversation can move one chunk by at most 0.05 in total, and a whole day by at most 0.2, so no visitor or crowd
 * can steer the ranking. Reads and writes are separate statements: two clicks at the same instant could overshoot a cap
 * by one step (0.03), which the clamp to [0.5, 2.0] still bounds.
 */
export async function learn(db: D1Database, conversationId: string, chunkIds: string[], delta: number, base: Weights, now: number): Promise<void> {
  if (delta === 0) return;
  const day = `day:${utcDay(now)}`;
  for (const id of new Set(chunkIds)) {
    const [row, moves] = await Promise.all([
      db.prepare('SELECT weight FROM chunk_weights WHERE chunk_id = ?').bind(id).first<{ weight: number }>(),
      db.prepare('SELECT conversation_id, moved FROM weight_moves WHERE chunk_id = ? AND conversation_id IN (?, ?)').bind(id, conversationId, day).all<{ conversation_id: string; moved: number }>(),
    ]);
    const movedBy = (key: string) => moves.results.find((m) => m.conversation_id === key)?.moved ?? 0;
    const move = allowedMove(delta, movedBy(conversationId), movedBy(day));
    if (move === 0) continue;
    const upsertMove = (key: string) =>
      db
        .prepare('INSERT INTO weight_moves (conversation_id, chunk_id, moved, created_at) VALUES (?1, ?2, ?3, ?4) ON CONFLICT (conversation_id, chunk_id) DO UPDATE SET moved = moved + ?3')
        .bind(key, id, Math.abs(move), now);
    await db.batch([
      db
        .prepare('INSERT INTO chunk_weights (chunk_id, weight, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT (chunk_id) DO UPDATE SET weight = ?2, updated_at = ?3')
        .bind(id, clampWeight((row?.weight ?? base[id] ?? 1) + move), now),
      upsertMove(conversationId),
      upsertMove(day),
    ]);
  }
}

/** The reviewed base weights overlaid with whatever has been learned since. */
export async function loadWeights(db: D1Database, base: Weights): Promise<Weights> {
  const { results } = await db.prepare('SELECT chunk_id, weight FROM chunk_weights').all<{ chunk_id: string; weight: number }>();
  return { ...base, ...Object.fromEntries(results.map((r) => [r.chunk_id, r.weight])) };
}

/** Daily: every learned weight closes a little of its distance to its base, so old opinions fade. */
export async function decayWeights(db: D1Database, base: Weights, now: number): Promise<void> {
  const { results } = await db.prepare('SELECT chunk_id, weight FROM chunk_weights').all<{ chunk_id: string; weight: number }>();
  const stale = results.map((r) => ({ id: r.chunk_id, next: decayToward(r.weight, base[r.chunk_id] ?? 1), was: r.weight })).filter((r) => Math.abs(r.next - r.was) > 1e-9);
  if (stale.length === 0) return;
  await db.batch(stale.map((r) => db.prepare('UPDATE chunk_weights SET weight = ?, updated_at = ? WHERE chunk_id = ?').bind(r.next, now, r.id)));
}
