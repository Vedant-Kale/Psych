import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { allPosts, postBySlug } from '@/lib/content';
import { domainLabel, postTypeLabel, stageLabel } from '@/lib/content/labels';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = postBySlug((await params).slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({ params }: Props) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();

  return (
    <main className="page">
      <article>
        <header>
          <p className="meta">
            <span>{domainLabel[post.domain]}</span> · <span>{postTypeLabel[post.type]}</span> ·{' '}
            <span>{stageLabel[post.stage]}</span>
            {post.confidence && <> · <span>Confidence: {post.confidence}</span></>}
          </p>
          <h1>{post.title}</h1>
          <p className="meta">
            <time dateTime={post.date}>{post.date}</time>
          </p>
        </header>
        {/* Rendered from owner-authored markdown in git; raw HTML is not passed through. */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <JsonLd
        data={{
          '@type': 'Article',
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          author: { '@type': 'Person', name: 'Vedant Kale' },
        }}
      />
    </main>
  );
}
