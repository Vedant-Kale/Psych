import { useId } from 'react';
import type { Profile } from '@/lib/content/schema';
import type { Layer } from '@/lib/order/types';
import { SITE_URL } from '@/lib/site';
import { SourceLinks, type Sources } from './SourceLinks';

const bare = (url: string) => url.replace(/^https?:\/\//, '');

/** The tailored one-page résumé: who, what was ordered, and each layer with its proof. Printing shows only this. */
export function Receipt({ order, layers, sources, profile }: { order: string; layers: Layer[]; sources: Sources; profile: Profile }) {
  const id = useId();
  const { contact } = profile;
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <section className="receipt" aria-labelledby={id}>
      <h3 id={id}>Receipt</h3>
      <p className="receipt-name">{profile.name}</p>
      <p>
        {profile.headline}. {profile.location}.
      </p>
      <p className="meta">
        <a href={contact.github}>{bare(contact.github)}</a>
        {contact.linkedin && (
          <>
            , <a href={contact.linkedin}>{bare(contact.linkedin)}</a>
          </>
        )}
        {contact.email && (
          <>
            , <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </>
        )}
      </p>
      <p className="receipt-ordered">
        <strong>Ordered:</strong> {order}
      </p>
      <ol className="receipt-layers">
        {layers.map((l, i) => (
          <li key={i}>
            <strong>{l.skill}</strong>
            <p>{l.rationale}</p>
            <SourceLinks ids={l.evidenceIds} sources={sources} />
          </li>
        ))}
      </ol>
      <p className="meta">
        Mixed {date} at {bare(SITE_URL)}/order/
      </p>
      <button type="button" className="order-button receipt-print" onClick={() => window.print()}>
        Print or save as PDF
      </button>
    </section>
  );
}
