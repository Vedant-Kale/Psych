import Link from 'next/link';
import { SITE_URL } from '@/lib/site';

export type Sources = Record<string, { title: string; href: string }>;

/** `slug#n` evidence ids → one link per source page; an unknown slug stays plain text. Print adds the full URL. */
export function SourceLinks({ ids, sources }: { ids: string[]; sources: Sources }) {
  const slugs = [...new Set(ids.map((id) => id.split('#')[0]!))];
  return (
    <p className="meta">
      Proof:{' '}
      {slugs.map((slug, i) => {
        const s = sources[slug];
        return (
          <span key={slug}>
            {i > 0 && ', '}
            {s ? (
              <>
                <Link href={s.href}>{s.title}</Link>
                <span className="print-only"> ({SITE_URL + s.href})</span>
              </>
            ) : (
              slug
            )}
          </span>
        );
      })}
    </p>
  );
}
