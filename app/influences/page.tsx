import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Influences',
  description: 'Credits for every library and borrowed idea in PSYCH.',
};

/** Libraries shipped in the site today. Ideas are added as each borrowed piece lands. */
const libraries = [
  { name: 'Next.js', url: 'https://nextjs.org', licence: 'MIT', use: 'Builds every page ahead of time' },
  { name: 'React', url: 'https://react.dev', licence: 'MIT', use: 'Renders the pages' },
  { name: 'Hono', url: 'https://hono.dev', licence: 'MIT', use: 'Routes the /api Worker' },
  { name: 'Zod', url: 'https://zod.dev', licence: 'MIT', use: 'Checks every piece of content before it ships' },
  { name: 'Content Collections', url: 'https://content-collections.dev', licence: 'MIT', use: 'Loads posts and projects from markdown' },
];

export default function InfluencesPage() {
  return (
    <main className="page">
      <h1>Influences</h1>
      <p className="lead">PSYCH stands on other people&apos;s work. Every library and borrowed idea is credited here.</p>
      <h2>Libraries</h2>
      <ul className="list">
        {libraries.map((l) => (
          <li key={l.name}>
            <a href={l.url}>{l.name}</a> <span className="meta">· {l.licence}</span>
            <p>{l.use}</p>
          </li>
        ))}
      </ul>
      <h2>Ideas</h2>
      <p>Borrowed ideas are credited here as each one lands in the site.</p>
    </main>
  );
}
