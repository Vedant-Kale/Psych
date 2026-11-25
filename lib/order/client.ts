import type { OrderResult } from './types';

export type OrderError = 'verification' | 'network' | 'bad-request';
export type OrderResponse = OrderResult | { kind: 'error'; reason: OrderError };

const KINDS = new Set(['mix', 'fact', 'none', 'refused', 'house-menu']);

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
    return typeof body?.kind === 'string' && KINDS.has(body.kind) ? (body as OrderResult) : error('network');
  } catch {
    return error('network');
  }
}
