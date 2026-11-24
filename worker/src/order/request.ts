export type ParsedOrder = { ok: true; text: string } | { ok: false; status: 400 };

/** Shape check only. Length and content are judged by screenInput, so the visitor gets a polite refusal, not a 400. */
export function parseOrderRequest(body: unknown): ParsedOrder {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false, status: 400 };
  const { text } = body as Record<string, unknown>;
  if (typeof text !== 'string') return { ok: false, status: 400 };
  return { ok: true, text };
}
