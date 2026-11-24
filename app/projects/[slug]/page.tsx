import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { allProjects } from '@/lib/content';
import { domainLabel } from '@/lib/content/labels';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

const find = (slug: string) => allProjects().find((p) => p.slug === slug);

export function generateStaticParams() {
  return allProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = find((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const project = find((await params).slug);
  if (!project) notFound();

  return (
    <main className="page">
      <article>
        <header>
          <p className="meta">
            <StatusBadge status={project.status} /> · {project.domains.map((d) => domainLabel[d]).join(' · ')} ·
            started <time dateTime={project.started}>{project.started}</time>
          </p>
          <h1>{project.title}</h1>
          <p className="lead">{project.summary}</p>
        </header>
        {/* Rendered from owner-authored markdown in git; raw HTML is not passed through. */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: project.html }} />
        <ul className="list">
          {project.repo && (
            <li>
              <a href={project.repo}>Code on GitHub</a>
            </li>
          )}
          {project.trail && (
            <li>
              <Link href={`/palace/${project.trail}/`}>The thinking behind it</Link>
            </li>
          )}
          <li>
            <Link href="/facts/">All facts</Link>
          </li>
        </ul>
      </article>
    </main>
  );
}
