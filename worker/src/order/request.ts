export type ParsedOrder = { ok: true; text: string; turnstileToken: string } | { ok: false };

/** Shape check only. Length and content are judged by screenInput, so the visitor gets a polite refusal, not a 400. */
export function parseOrderRequest(body: unknown): ParsedOrder {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false };
  const { text, turnstileToken } = body as Record<string, unknown>;
  if (typeof text !== 'string') return { ok: false };
  if (typeof turnstileToken !== 'string' || turnstileToken.length === 0 || turnstileToken.length > 2048) {
    return { ok: false };
  }
  return { ok: true, text, turnstileToken };
}
