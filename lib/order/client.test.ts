import { describe, expect, it } from 'vitest';
import { postOrder } from './client';

const ID = 'c'.repeat(36);
const reply = (status: number, body: unknown, type = 'application/json') => async () =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': type } });

describe('postOrder', () => {
  it('returns a 200 body as is', async () => {
    const mix = { kind: 'mix', layers: [{ skill: 's', evidenceIds: ['a#0'], rationale: 'r' }] };
    expect(await postOrder('an engineer', 't', ID, reply(200, mix))).toEqual(mix);
  });

  it('returns the house menu sent with 429', async () => {
    const menu = { kind: 'house-menu', reason: 'rate-limit', menu: { items: [] } };
    expect(await postOrder('an engineer', 't', ID, reply(429, menu))).toEqual(menu);
  });

  it.each([
    [403, { error: 'verification failed' }, 'verification'],
    [400, { error: 'invalid JSON' }, 'bad-request'],
    [502, '<html>Bad gateway</html>', 'network'],
    [200, 'not json', 'network'],
    [200, { unexpected: true }, 'network'],
  ])('maps %i %j to %s', async (status, body, reason) => {
    expect(await postOrder('an engineer', 't', ID, reply(status, body, typeof body === 'string' ? 'text/html' : 'application/json'))).toEqual({
      kind: 'error',
      reason,
    });
  });

  it('maps a network failure to network', async () => {
    const fail = async () => Promise.reject(new TypeError('Failed to fetch'));
    expect(await postOrder('an engineer', 't', ID, fail)).toEqual({ kind: 'error', reason: 'network' });
  });

  it('posts JSON text and token to /api/order', async () => {
    let seen: { url: string; init?: RequestInit } | undefined;
    const spy = async (url: string | URL | Request, init?: RequestInit) => {
      seen = { url: String(url), init };
      return new Response(JSON.stringify({ kind: 'none', message: 'm' }), { status: 200 });
    };
    await postOrder('an engineer', 'tok', ID, spy);
    expect(seen?.url).toBe('/api/order');
    expect(seen?.init?.method).toBe('POST');
    expect(new Headers(seen?.init?.headers).get('content-type')).toBe('application/json');
    expect(JSON.parse(String(seen?.init?.body))).toEqual({ text: 'an engineer', turnstileToken: 'tok', conversationId: ID });
    expect(seen?.init?.signal).toBeInstanceOf(AbortSignal);
  });
});
