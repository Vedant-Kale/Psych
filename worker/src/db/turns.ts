export const HISTORY_TURNS = 3;

export type Turn = { text: string; kind: string };

/** Stores one turn and returns its id. `seq` is picked inside the INSERT, so two orders in one conversation can't share a number. */
export async function recordTurn(
  db: D1Database,
  t: { conversationId: string; text: string; kind: string; chunkIds: string[]; now: number },
): Promise<number> {
  const { meta } = await db
    .prepare(
      `INSERT INTO turns (conversation_id, seq, text, kind, chunk_ids, created_at)
       VALUES (?1, (SELECT COALESCE(MAX(seq), 0) + 1 FROM turns WHERE conversation_id = ?1), ?2, ?3, ?4, ?5)`,
    )
    .bind(t.conversationId, t.text, t.kind, JSON.stringify(t.chunkIds), t.now)
    .run();
  return meta.last_row_id;
}

/** The last `n` turns of a conversation, oldest first. */
export async function history(db: D1Database, conversationId: string, n = HISTORY_TURNS): Promise<Turn[]> {
  const { results } = await db
    .prepare('SELECT text, kind FROM turns WHERE conversation_id = ? ORDER BY seq DESC LIMIT ?')
    .bind(conversationId, n)
    .all<Turn>();
  return results.reverse();
}
