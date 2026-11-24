import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { StatusBadge } from '@/components/StatusBadge';
import { allCertificates, allProjects, allRoadmap, profile } from '@/lib/content';
import { domainLabel } from '@/lib/content/labels';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Facts',
  description: 'Projects, skills, education and contact for Vedant Kale.',
};

export default function FactsPage() {
  const me = profile();
  const projects = allProjects();
  const roadmap = allRoadmap();
  const certificates = allCertificates();

  return (
    <main className="page">
      <h1>{me.name}</h1>
      <p className="lead">{me.headline}</p>
      <p className="meta">{me.location}</p>
      <p>
        <Link href="/order/">Order an engineer</Link> to see the work that matches what you need.
      </p>

      <h2>Projects</h2>
      <ul className="list">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/projects/${p.slug}/`}>{p.title}</Link> <StatusBadge status={p.status} />
            <p>{p.summary}</p>
            <p className="meta">{p.domains.map((d) => domainLabel[d]).join(' · ')}</p>
          </li>
        ))}
      </ul>

      {roadmap.length > 0 && (
        <>
          <h2>Next</h2>
          <ul className="list">
            {roadmap.map((r) => (
              <li key={r.slug}>
                {r.title} <StatusBadge status={r.status} />
                {r.target && <span className="meta"> · {r.target}</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Skills</h2>
      <ul className="list">
        {me.skills.map((s) => (
          <li key={s.name}>
            {s.name}
            <span className="meta">
              {' '}
              · shown in{' '}
              {s.evidence.map((slug, i) => (
                <span key={slug}>
                  {i > 0 && ', '}
                  <Link href={`/projects/${slug}/`}>{projects.find((p) => p.slug === slug)?.title ?? slug}</Link>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>

      <h2>Education</h2>
      <ul className="list">
        {me.education.map((e) => (
          <li key={e.degree}>
            {e.degree}, {e.institution} <span className="meta">· {e.status}</span>
          </li>
        ))}
      </ul>

      {certificates.length > 0 && (
        <>
          <h2>Certificates</h2>
          <ul className="list">
            {certificates.map((c) => (
              <li key={c.slug}>
                {c.url ? <a href={c.url}>{c.title}</a> : c.title} <span className="meta">· {c.issuer}, {c.date}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Work with people</h2>
      <ul className="list">
        {me.roles.map((r) => (
          <li key={r.title}>{r.title}</li>
        ))}
      </ul>

      <h2>Contact</h2>
      <ul className="list">
        <li>
          <a href={me.contact.github}>GitHub</a>
        </li>
        {me.contact.linkedin && (
          <li>
            <a href={me.contact.linkedin}>LinkedIn</a>
          </li>
        )}
        {me.contact.email && (
          <li>
            <a href={`mailto:${me.contact.email}`}>{me.contact.email}</a>
          </li>
        )}
      </ul>

      <JsonLd
        data={{
          '@type': 'Person',
          name: me.name,
          description: me.headline,
          url: `${SITE_URL}/facts/`,
          homeLocation: me.location,
          alumniOf: me.education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
          sameAs: [me.contact.github, me.contact.linkedin].filter(Boolean),
        }}
      />
    </main>
  );
}
