import type { Answered } from './types';

export type OrderError = 'verification' | 'network' | 'bad-request';
export type OrderResponse = Answered | { kind: 'error'; reason: OrderError };
export type SignalType = 'yes' | 'no' | 'opened-source' | 'receipt' | 'interview';

const KINDS = new Set(['mix', 'fact', 'answer', 'none', 'refused', 'house-menu']);

/** POSTs an order. Never throws: every failure becomes `{ kind: 'error', reason }`, so the UI can't hang on a spinner. */
export async function postOrder(text: string, turnstileToken: string, conversationId: string, fetchFn: typeof fetch = fetch): Promise<OrderResponse> {
  const error = (reason: OrderError) => ({ kind: 'error', reason }) as const;
  try {
    const res = await fetchFn('/api/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, turnstileToken, conversationId }),
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status === 403) return error('verification');
    if (res.status === 400) return error('bad-request');
    if (res.status !== 200 && res.status !== 429) return error('network');
    const body = (await res.json()) as { kind?: unknown };
    // The 429 house menu is a normal answer, not a failure.
    return typeof body?.kind === 'string' && KINDS.has(body.kind) ? (body as Answered) : error('network');
  } catch {
    return error('network');
  }
}

/** Tells the bar what the visitor did with an answer. Fire and forget: a lost signal must never get in the visitor's way. */
export async function postSignal(conversationId: string, turnId: number, type: SignalType, fetchFn: typeof fetch = fetch): Promise<void> {
  try {
    await fetchFn('/api/signal', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId, turnId, type }),
      keepalive: true, // a source link navigates away; this lets the request finish anyway
    });
  } catch {
    // Ignored on purpose.
  }
}
