'use client';

import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile missing')));
    s.onerror = () => {
      loading = undefined; // a later mount may retry
      reject(new Error('turnstile blocked'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Cloudflare's human check. `onToken('')` means the token expired. A new `resetKey` renders a fresh widget (tokens are single-use). */
export function Turnstile({ siteKey, resetKey, onToken, onError }: { siteKey: string; resetKey: number; onToken: (t: string) => void; onError: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef({ onToken, onError });
  useEffect(() => {
    cb.current = { onToken, onError }; // latest callbacks without re-rendering the widget
  });

  useEffect(() => {
    let id: string | undefined;
    let live = true;
    loadTurnstile()
      .then((t) => {
        if (!live || !box.current) return;
        id = t.render(box.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (token: string) => cb.current.onToken(token),
          'expired-callback': () => cb.current.onToken(''),
          'error-callback': () => cb.current.onError(),
        });
      })
      .catch(() => live && cb.current.onError());
    return () => {
      live = false;
      if (id) window.turnstile?.remove(id);
    };
  }, [siteKey, resetKey]);

  return <div ref={box} className="order-check" />;
}
