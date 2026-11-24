import { describe, expect, it } from 'vitest';
import { buildGraph, validateLinks, type GraphPost, type GraphProject } from './build-graph.ts';

const post = (over: Partial<GraphPost> = {}): GraphPost => ({
  file: 'content/posts/a.md',
  slug: 'a',
  title: 'A',
  type: 'spark',
  domain: 'psychology',
  stage: 'seedling',
  links: [],
  ...over,
});
const project = (over: Partial<GraphProject> = {}): GraphProject => ({
  file: 'content/projects/p.md',
  slug: 'p',
  title: 'P',
  domains: ['finance'],
  ...over,
});

describe('validateLinks', () => {
  it('reports a link to an unknown slug', () => {
    expect(validateLinks([post({ links: ['ghost'] })], [])).toEqual(["content/posts/a.md: link to unknown slug 'ghost'"]);
  });

  it('reports a trail project and a project trail that do not exist', () => {
    const errors = validateLinks([post({ type: 'trail', project: 'nope' })], [project({ trail: 'missing' })]);
    expect(errors).toEqual([
      "content/posts/a.md: link to unknown slug 'nope'",
      "content/projects/p.md: link to unknown slug 'missing'",
    ]);
  });

  it('reports duplicate slugs, including across posts and projects', () => {
    expect(validateLinks([post(), post({ file: 'content/posts/a2.md' })], [])).toEqual(["duplicate slug 'a'"]);
    expect(validateLinks([post({ slug: 'p' })], [project()])).toEqual(["duplicate slug 'p'"]);
  });

  it('accepts links between posts and projects', () => {
    expect(validateLinks([post({ links: ['p'] })], [project({ trail: 'a' })])).toEqual([]);
  });
});

describe('buildGraph', () => {
  const posts = [
    post(),
    post({ file: 'b', slug: 'b', type: 'deep-dive', domain: 'ai-agents', links: ['a', 'p'] }),
    post({ file: 'c', slug: 'c', type: 'trail', domain: 'finance', project: 'p' }),
  ];
  const projects = [project({ domains: ['finance', 'ai-agents'], trail: 'c' })];

  it('links every post to its domain node', () => {
    const g = buildGraph(posts, projects);
    for (const p of posts) {
      expect(g.links).toContainEqual({ source: p.slug, target: `domain:${p.domain}` });
    }
  });

  it('links posts, trails and projects to what they reference, once each', () => {
    const g = buildGraph(posts, projects);
    expect(g.links).toContainEqual({ source: 'b', target: 'a' });
    expect(g.links).toContainEqual({ source: 'b', target: 'p' });
    expect(g.links).toContainEqual({ source: 'p', target: 'domain:ai-agents' });
    const pc = g.links.filter((l) => [l.source, l.target].sort().join() === 'c,p');
    expect(pc).toHaveLength(1);
  });

  it('is deterministic for the same seed', () => {
    expect(buildGraph(posts, projects, 42)).toEqual(buildGraph(posts, projects, 42));
    expect(buildGraph(posts, projects, 7)).not.toEqual(buildGraph(posts, projects, 42));
  });

  it('weights deep-dive above spark, and domains above projects', () => {
    const g = buildGraph(posts, projects);
    const w = (id: string) => g.nodes.find((n) => n.id === id)!.weight;
    expect(w('b')).toBeGreaterThan(w('a'));
    expect(w('c')).toBe(2);
    expect(w('domain:finance')).toBeGreaterThan(w('p'));
  });

  it('only creates domain nodes that are used, with finite 3D positions', () => {
    const g = buildGraph(posts, projects);
    expect(g.nodes.filter((n) => n.kind === 'domain').map((n) => n.id).sort()).toEqual([
      'domain:ai-agents',
      'domain:finance',
      'domain:psychology',
    ]);
    for (const n of g.nodes) for (const v of [n.x, n.y, n.z]) expect(Number.isFinite(v)).toBe(true);
  });
});
