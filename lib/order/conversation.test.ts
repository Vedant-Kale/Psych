import { afterEach, describe, expect, it, vi } from 'vitest';
import { conversationId } from './conversation';

const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

afterEach(() => vi.unstubAllGlobals());

describe('conversationId', () => {
  it('is random, matches what the Worker accepts, and stays the same within one tab', () => {
    vi.stubGlobal('sessionStorage', store());
    const id = conversationId();
    expect(id).toMatch(/^[A-Za-z0-9_-]{22,64}$/);
    expect(conversationId()).toBe(id);
  });

  it('a new tab (empty sessionStorage) gets a different id', () => {
    vi.stubGlobal('sessionStorage', store());
    const a = conversationId();
    vi.stubGlobal('sessionStorage', store());
    expect(conversationId()).not.toBe(a);
  });

  it('when storage is blocked, still returns a valid id (the order works, nothing is remembered)', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    expect(conversationId()).toMatch(/^[A-Za-z0-9_-]{22,64}$/);
  });
});
