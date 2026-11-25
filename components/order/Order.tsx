'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Profile } from '@/lib/content/schema';
import { postOrder, postSignal, type OrderResponse, type SignalType } from '@/lib/order/client';
import { conversationId } from '@/lib/order/conversation';
import { TURNSTILE_SITE_KEY } from '@/lib/site';
import { errorCopy, houseMenuCopy, refusalCopy, resultHeading, turnstileBlocked } from './copy';
import { Pour } from './Pour';
import { Receipt } from './Receipt';
import { Exits } from './Exits';
import { SourceLinks, type Sources } from './SourceLinks';
import { Turnstile } from './Turnstile';

const MAX = 500;

export function Order({ sources, profile }: { sources: Sources; profile: Profile }) {
  const [text, setText] = useState('');
  const [token, setToken] = useState('');
  const [checkFailed, setCheckFailed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<OrderResponse | null>(null);
  const [ordered, setOrdered] = useState(''); // the text as sent; the box may change afterwards
  const inFlight = useRef(false); // state updates are async; this stops a double click sending twice
  const heading = useRef<HTMLHeadingElement>(null);
  const resultBox = useRef<HTMLElement>(null);
  const sent = useRef(new Set<string>()); // one signal of each type per answer, however often it is clicked
  const ids = { hint: useId(), count: useId(), status: useId() };

  useEffect(() => {
    if (result) heading.current?.focus();
  }, [result]);

  const turnId = result && 'turnId' in result ? result.turnId : undefined;
  const signal = useCallback(
    (type: SignalType) => {
      if (turnId === undefined || sent.current.has(`${turnId}:${type}`)) return;
      sent.current.add(`${turnId}:${type}`);
      void postSignal(conversationId(), turnId, type);
    },
    [turnId],
  );

  // Clicks on a source link or the receipt's print button are signals too; one listener covers every result kind.
  useEffect(() => {
    const box = resultBox.current;
    if (!box) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const a = target.closest('a');
      if (a && Object.values(sources).some((s) => s.href === a.getAttribute('href'))) signal('opened-source');
      if (target.closest('.receipt-print')) signal('receipt');
    };
    box.addEventListener('click', onClick);
    return () => box.removeEventListener('click', onClick);
  }, [signal, sources]);

  const submit = async () => {
    if (inFlight.current || !token) return;
    inFlight.current = true;
    setPending(true);
    const sent = text.trim();
    const r = await postOrder(sent, token, conversationId());
    setOrdered(sent);
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
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          resetKey={resetKey}
          onToken={(t) => {
            setToken(t);
            if (t) setCheckFailed(false); // the widget can recover after an error-callback
          }}
          onError={() => setCheckFailed(true)}
        />
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

      <section ref={resultBox} className="order-result" aria-live="polite">
        {result && (
          <>
            <h2 ref={heading} tabIndex={-1}>
              {resultHeading[result.kind]}
            </h2>
            <Result result={result} sources={sources} profile={profile} ordered={ordered} onRetry={() => void submit()} canRetry={!!token && !pending} />
            {turnId !== undefined && (result.kind === 'mix' || result.kind === 'fact' || result.kind === 'none') && (
              <Exits
                key={turnId}
                kind={result.kind}
                closest={result.kind === 'none' ? result.closest : undefined}
                ordered={ordered}
                profile={profile}
                sources={sources}
                send={signal}
              />
            )}
          </>
        )}
      </section>
    </>
  );
}

function Result({
  result,
  sources,
  profile,
  ordered,
  onRetry,
  canRetry,
}: {
  result: OrderResponse;
  sources: Sources;
  profile: Profile;
  ordered: string;
  onRetry: () => void;
  canRetry: boolean;
}) {
  switch (result.kind) {
    case 'mix':
      return (
        <>
          <Pour layers={result.layers} />
          <Receipt order={ordered} layers={result.layers} sources={sources} profile={profile} />
        </>
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
