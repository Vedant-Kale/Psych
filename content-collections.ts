import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { z } from 'zod';
import {
  certificateSchema,
  houseMenuSchema,
  postFields,
  profileSchema,
  projectSchema,
  roadmapSchema,
  storyHeadingsMissing,
  withTrailRule,
} from './lib/content/schema';

/** Slug must match the file name so a URL always points at exactly one file. */
function assertSlugMatchesFile(slug: string, meta: { filePath: string; path: string }, dir: string) {
  if (slug !== meta.path) {
    throw new Error(`${dir}/${meta.filePath}: slug '${slug}' must match the file name '${meta.path}'`);
  }
}

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '*.md',
  parser: 'frontmatter',
  schema: withTrailRule(postFields.extend({ content: z.string() })),
  transform: async (doc, ctx) => {
    assertSlugMatchesFile(doc.slug, doc._meta, 'content/posts');
    const missing = doc.type === 'story' ? storyHeadingsMissing(doc.content) : [];
    if (missing.length > 0) throw new Error(`content/posts/${doc._meta.filePath}: a story needs the headings ${missing.map((h) => `'## ${h}'`).join(', ')}`);
    return { ...doc, html: await compileMarkdown(ctx, doc) };
  },
});

const projects = defineCollection({
  name: 'projects',
  directory: 'content/projects',
  include: '*.md',
  parser: 'frontmatter',
  schema: projectSchema.extend({ content: z.string() }),
  transform: async (doc, ctx) => {
    assertSlugMatchesFile(doc.slug, doc._meta, 'content/projects');
    return { ...doc, html: await compileMarkdown(ctx, doc) };
  },
});

const certificates = defineCollection({
  name: 'certificates',
  directory: 'content/certificates',
  include: '*.yaml',
  parser: 'yaml',
  schema: certificateSchema,
});

const roadmap = defineCollection({
  name: 'roadmap',
  directory: 'content/roadmap',
  include: '*.yaml',
  parser: 'yaml',
  schema: roadmapSchema,
});

const profile = defineCollection({
  name: 'profile',
  directory: 'content',
  include: 'profile.yaml',
  parser: 'yaml',
  schema: profileSchema,
});

const houseMenu = defineCollection({
  name: 'houseMenu',
  directory: 'content',
  include: 'house-menu.yaml',
  parser: 'yaml',
  schema: houseMenuSchema,
});

export default defineConfig({
  content: [posts, projects, certificates, roadmap, profile, houseMenu],
});
