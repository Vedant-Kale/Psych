import { mkdirSync, writeFileSync } from 'node:fs';
import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3-force-3d';
import type { Domain, PostType, Stage } from '../lib/content/schema.ts';
import type { Graph, GraphLink, GraphNode } from '../lib/graph/types.ts';

export type GraphPost = {
  file: string;
  slug: string;
  title: string;
  type: PostType;
  domain: Domain;
  stage: Stage;
  links: string[];
  project?: string | undefined;
};
export type GraphProject = { file: string; slug: string; title: string; domains: Domain[]; trail?: string | undefined };

const WEIGHT: Record<PostType | 'project' | 'domain', number> = {
  spark: 1,
  learning: 1,
  trail: 2,
  'deep-dive': 3,
  project: 4,
  domain: 5,
};
const TICKS = 300;

/** Every reference must point at a real slug, and slugs must be unique across posts and projects. */
export function validateLinks(posts: GraphPost[], projects: GraphProject[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const { slug } of [...posts, ...projects]) {
    if (seen.has(slug)) errors.push(`duplicate slug '${slug}'`);
    seen.add(slug);
  }
  const refs = (file: string, slugs: (string | undefined)[]) => {
    for (const s of slugs) if (s !== undefined && !seen.has(s)) errors.push(`${file}: link to unknown slug '${s}'`);
  };
  for (const p of posts) refs(p.file, [...p.links, p.project]);
  for (const p of projects) refs(p.file, [p.trail]);
  return errors;
}

/** Mulberry32: tiny seeded PRNG so layouts are identical across builds. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v: number | undefined) => Math.round((v ?? 0) * 100) / 100;

/** Assumes validateLinks passed. Positions come from a seeded 3D force layout run for a fixed number of ticks. */
export function buildGraph(posts: GraphPost[], projects: GraphProject[], seed = 42): Graph {
  const domains = [...new Set<Domain>([...posts.map((p) => p.domain), ...projects.flatMap((p) => p.domains)])].sort();
  const nodes: Omit<GraphNode, 'x' | 'y' | 'z'>[] = [
    ...domains.map((d) => ({ id: `domain:${d}`, kind: 'domain' as const, domain: d, title: d, weight: WEIGHT.domain })),
    ...projects.map((p) => ({ id: p.slug, kind: 'project' as const, domain: p.domains[0]!, title: p.title, weight: WEIGHT.project })),
    ...posts.map((p) => ({
      id: p.slug,
      kind: 'post' as const,
      type: p.type,
      domain: p.domain,
      title: p.title,
      stage: p.stage,
      weight: WEIGHT[p.type],
    })),
  ];

  const links: GraphLink[] = [];
  const seen = new Set<string>();
  const link = (source: string, target: string) => {
    const k = [source, target].sort().join('\u0000');
    if (source === target || seen.has(k)) return;
    seen.add(k);
    links.push({ source, target });
  };
  for (const p of posts) {
    link(p.slug, `domain:${p.domain}`);
    for (const l of p.links) link(p.slug, l);
    if (p.project) link(p.slug, p.project);
  }
  for (const p of projects) {
    for (const d of p.domains) link(p.slug, `domain:${d}`);
    if (p.trail) link(p.slug, p.trail);
  }

  // d3 otherwise starts nodes on a fixed spiral; seeding start positions makes the seed shape the layout.
  const rand = seeded(seed);
  const sim = nodes.map((n) => ({ ...n, x: rand() * 100 - 50, y: rand() * 100 - 50, z: rand() * 100 - 50 }));
  forceSimulation(sim, 3)
    .randomSource(rand)
    .force('link', forceLink(links.map((l) => ({ ...l }))).id((n) => n.id).distance(30))
    .force('charge', forceManyBody().strength((n) => -20 * (n.weight as number)))
    .force('center', forceCenter(0, 0, 0))
    .stop()
    .tick(TICKS);

  return {
    nodes: sim.map((n) => ({ ...(n as unknown as GraphNode), x: round(n.x as number), y: round(n.y as number), z: round(n.z as number) })).map(stripSim),
    links,
  };
}

/** d3 adds velocity and index fields; keep only the GraphNode shape. */
function stripSim(n: GraphNode & Record<string, unknown>): GraphNode {
  const { id, kind, type, domain, title, stage, weight, x, y, z } = n;
  return { id, kind, ...(type && { type }), domain, title, ...(stage && { stage }), weight, x, y, z };
}

async function main() {
  const { allPosts, allProjects } = await import('../.content-collections/generated/index.js');
  const posts: GraphPost[] = allPosts.map((p) => ({ ...p, file: `content/posts/${p._meta.filePath}` }));
  const projects: GraphProject[] = allProjects.map((p) => ({ ...p, file: `content/projects/${p._meta.filePath}` }));
  const errors = validateLinks(posts, projects);
  if (errors.length > 0) {
    for (const e of errors) console.error(e);
    process.exit(1);
  }
  const graph = buildGraph(posts, projects);
  mkdirSync('out', { recursive: true });
  writeFileSync('out/graph.json', JSON.stringify(graph));
  console.log(`graph: ${graph.nodes.length} nodes, ${graph.links.length} links → out/graph.json`);
}

if (import.meta.main) await main();
