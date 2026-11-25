export type ParsedOrder = { ok: true; text: string; turnstileToken: string; conversationId?: string } | { ok: false };

/** Random per browser tab (a UUID is 36 chars). Too short to be unguessable, or any other character, is rejected. */
const CONVERSATION_ID = /^[A-Za-z0-9_-]{22,64}$/;

/** Shape check only. Length and content are judged by screenInput, so the visitor gets a polite refusal, not a 400. */
export function parseOrderRequest(body: unknown): ParsedOrder {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false };
  const { text, turnstileToken, conversationId } = body as Record<string, unknown>;
  if (typeof text !== 'string') return { ok: false };
  if (typeof turnstileToken !== 'string' || turnstileToken.length === 0 || turnstileToken.length > 2048) {
    return { ok: false };
  }
  if (conversationId === undefined) return { ok: true, text, turnstileToken };
  if (typeof conversationId !== 'string' || !CONVERSATION_ID.test(conversationId)) return { ok: false };
  return { ok: true, text, turnstileToken, conversationId };
}
