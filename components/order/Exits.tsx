import { useId, useState } from 'react';
import type { Profile } from '@/lib/content/schema';
import type { SignalType } from '@/lib/order/client';
import { interviewLink } from '@/lib/order/interview';
import { followUps } from '@/lib/order/followups';
import { exitCopy } from './copy';
import { SourceLinks, type Sources } from './SourceLinks';

/** No answer is a dead end: ask if it helped, name the closest work, and offer the way to ask for an interview. */
export function Exits({
  kind,
  closest,
  cited,
  onPick,
  ordered,
  profile,
  sources,
  send,
}: {
  kind: 'mix' | 'fact' | 'answer' | 'none';
  closest?: string;
  /** Evidence ids the answer used, so suggestions point at work it did not. */
  cited: string[];
  onPick: (order: string) => void;
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
      <FollowUpChips cited={cited} sources={sources} onPick={onPick} />
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

function FollowUpChips({ cited, sources, onPick }: { cited: string[]; sources: Sources; onPick: (order: string) => void }) {
  const ideas = followUps(cited, sources);
  if (ideas.length === 0) return null;
  return (
    <div className="exits-next">
      <p className="meta">{exitCopy.askNext}</p>
      <ul className="exits-chips">
        {ideas.map((idea) => (
          <li key={idea}>
            <button type="button" className="order-button" onClick={() => onPick(idea)}>
              {idea}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
