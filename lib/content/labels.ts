import type { Domain, PostType, Stage } from './schema';

export const domainLabel: Record<Domain, string> = {
  'ai-agents': 'AI agents',
  finance: 'Finance',
  geospatial: 'Geospatial',
  psychology: 'Psychology',
  business: 'Business cases',
};

export const postTypeLabel: Record<PostType, string> = {
  spark: 'Spark',
  'deep-dive': 'Deep dive',
  trail: 'Trail',
  learning: 'Learning',
};

export const stageLabel: Record<Stage, string> = {
  seedling: 'Seedling',
  budding: 'Budding',
  evergreen: 'Evergreen',
};
