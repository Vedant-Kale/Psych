'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { postOrder, type OrderResponse } from '@/lib/order/client';
import { TURNSTILE_SITE_KEY } from '@/lib/site';
import { errorCopy, houseMenuCopy, refusalCopy, resultHeading, turnstileBlocked } from './copy';
import { Turnstile } from './Turnstile';

export type Sources = Record<string, { title: string; href: string }>;

const MAX = 500;

export function Order({ sources }: { sources: Sources }) {
  const [text, setText] = useState('');
  const [token, setToken] = useState('');
  const [checkFailed, setCheckFailed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<OrderResponse | null>(null);
  const inFlight = useRef(false); // state updates are async; this stops a double click sending twice
  const heading = useRef<HTMLHeadingElement>(null);
  const ids = { hint: useId(), count: useId(), status: useId() };

  useEffect(() => {
    if (result) heading.current?.focus();
  }, [result]);

  const submit = async () => {
    if (inFlight.current || !token) return;
    inFlight.current = true;
    setPending(true);
    const r = await postOrder(text.trim(), token);
    setToken('');
    setResetKey((k) => k + 1);
    setResult(r);
    setPending(false);
    inFlight.current = false;
  };

  const status = checkFailed ? null : pending ? 'Mixing your order…' : token ? null : 'Waiting for the human check…';

  return (
    <>
      <form
        className="order-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="order-text" className="order-label">
          Your order
        </label>
        <p id={ids.hint} className="meta">
          For example: an engineer who can ship secure AI agents.
        </p>
        <textarea
          id="order-text"
          className="order-text"
          rows={3}
          minLength={3}
          maxLength={MAX}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-describedby={`${ids.hint} ${ids.count}`}
        />
        <p id={ids.count} className="meta order-count">
          {text.length} of {MAX} characters
        </p>
        <Turnstile siteKey={TURNSTILE_SITE_KEY} resetKey={resetKey} onToken={(t) => {
            setToken(t);
            if (t) setCheckFailed(false); // the widget can recover after an error-callback
          }}
          onError={() => setCheckFailed(true)} />
        {checkFailed && (
          <p className="order-note" role="alert">
            {turnstileBlocked} Everything is also on the <Link href="/facts/">facts page</Link>.
          </p>
        )}
        <div className="order-actions">
          <button type="submit" className="order-button" disabled={pending || !token || checkFailed} aria-describedby={status ? ids.status : undefined}>
            Place order
          </button>
          {status && (
            <span id={ids.status} className="meta">
              {status}
            </span>
          )}
        </div>
      </form>

      <section className="order-result" aria-live="polite">
        {result && (
          <>
            <h2 ref={heading} tabIndex={-1}>
              {resultHeading[result.kind]}
            </h2>
            <Result result={result} sources={sources} onRetry={() => void submit()} canRetry={!!token && !pending} />
          </>
        )}
      </section>
    </>
  );
}

function Result({ result, sources, onRetry, canRetry }: { result: OrderResponse; sources: Sources; onRetry: () => void; canRetry: boolean }) {
  switch (result.kind) {
    case 'mix':
      return (
        <ol className="order-layers">
          {result.layers.map((l, i) => (
            <li key={i}>
              <strong>{l.skill}</strong>
              <p>{l.rationale}</p>
              <SourceLinks ids={l.evidenceIds} sources={sources} />
            </li>
          ))}
        </ol>
      );
    case 'fact':
      return (
        <>
          <p className="lead">{result.answer}</p>
          <SourceLinks ids={result.sourceIds} sources={sources} />
        </>
      );
    case 'none':
      return <p>{result.message}</p>;
    case 'refused':
      return <p>{refusalCopy[result.reason]}</p>;
    case 'house-menu':
      return (
        <>
          <p>{houseMenuCopy[result.reason]}</p>
          <ol className="order-layers">
            {result.menu.items.map((i, n) => (
              <li key={n}>
                <strong>{i.skill}</strong>
                <p>{i.rationale}</p>
                <SourceLinks ids={i.evidence} sources={sources} />
              </li>
            ))}
          </ol>
        </>
      );
    case 'error':
      return (
        <>
          <p>{errorCopy[result.reason]}</p>
          <button type="button" className="order-button" onClick={onRetry} disabled={!canRetry}>
            Try again
          </button>
        </>
      );
  }
}

/** `slug#n` evidence ids → one link per source page; an unknown slug stays plain text. */
function SourceLinks({ ids, sources }: { ids: string[]; sources: Sources }) {
  const slugs = [...new Set(ids.map((id) => id.split('#')[0]!))];
  return (
    <p className="meta">
      Proof:{' '}
      {slugs.map((slug, i) => {
        const s = sources[slug];
        return (
          <span key={slug}>
            {i > 0 && ', '}
            {s ? <Link href={s.href}>{s.title}</Link> : slug}
          </span>
        );
      })}
    </p>
  );
}
