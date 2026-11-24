/** Stores an order nothing in the content supports: the text only, never an IP or rate-limit key. */
export async function logUnknown(db: D1Database, text: string, now: number): Promise<void> {
  await db.prepare('INSERT INTO unknown_questions (text, created_at) VALUES (?, ?)').bind(text.trim(), now).run();
}
