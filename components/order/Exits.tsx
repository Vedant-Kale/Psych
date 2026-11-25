import { useId, useState } from 'react';
import type { Profile } from '@/lib/content/schema';
import type { SignalType } from '@/lib/order/client';
import { interviewLink } from '@/lib/order/interview';
import { exitCopy } from './copy';
import { SourceLinks, type Sources } from './SourceLinks';

/** No answer is a dead end: ask if it helped, name the closest work, and offer the way to ask for an interview. */
export function Exits({
  kind,
  closest,
  ordered,
  profile,
  sources,
  send,
}: {
  kind: 'mix' | 'fact' | 'none';
  closest?: string;
  ordered: string;
  profile: Profile;
  sources: Sources;
  send: (type: SignalType) => void;
}) {
  const [verdict, setVerdict] = useState<'yes' | 'no' | null>(null);
  const [missing, setMissing] = useState('');
  const [copied, setCopied] = useState(false);
  const ids = { question: useId(), missing: useId() };
  const interview = interviewLink(profile, ordered, verdict === 'no' ? missing : '');

  const answer = (v: 'yes' | 'no') => {
    setVerdict(v);
    send(v);
  };

  const askForInterview = async () => {
    if (!interview) return;
    send('interview');
    try {
      await navigator.clipboard.writeText(interview.summary);
      setCopied(true);
    } catch {
      // Clipboard blocked: LinkedIn still opens; the visitor writes their own message.
    }
    window.open(interview.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="exits" aria-labelledby={ids.question}>
      {kind === 'none' && closest && <SourceLinks ids={[closest]} sources={sources} label={exitCopy.related} />}
      <p id={ids.question} className="exits-question">
        {exitCopy.question}
      </p>
      {verdict === null ? (
        <div className="order-actions">
          <button type="button" className="order-button" onClick={() => answer('yes')}>
            {exitCopy.yes}
          </button>
          <button type="button" className="order-button" onClick={() => answer('no')}>
            {exitCopy.no}
          </button>
        </div>
      ) : (
        <p role="status">
          {verdict === 'yes' ? exitCopy.thanksYes : interview ? exitCopy.sorryNo : exitCopy.thanksNo}
          {verdict === 'yes' && kind === 'mix' && ` ${exitCopy.receiptHint}`}
        </p>
      )}
      {verdict === 'no' && interview && (
        <>
          <label htmlFor={ids.missing}>{exitCopy.missingLabel}</label>
          <textarea id={ids.missing} className="order-text" rows={2} maxLength={300} value={missing} onChange={(e) => setMissing(e.target.value)} />
        </>
      )}
      {interview && (
        <div className="order-actions">
          <button type="button" className="order-button" onClick={() => void askForInterview()}>
            {exitCopy.interview}
          </button>
          {copied && <span role="status">{exitCopy.copied}</span>}
        </div>
      )}
    </section>
  );
}
