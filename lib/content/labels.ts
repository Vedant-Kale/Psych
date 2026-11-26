import type { Domain, PostType, Stage, StoryTheme } from './schema';

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
  story: 'Story',
};

export const storyThemeLabel: Record<StoryTheme, string> = {
  leadership: 'Leadership',
  feedback: 'Feedback',
  customers: 'Customers',
  pressure: 'Pressure',
  teamwork: 'Teamwork',
  mistake: 'Mistakes',
  decision: 'Decisions',
  learning: 'Learning',
};

export const stageLabel: Record<Stage, string> = {
  seedling: 'Seedling',
  budding: 'Budding',
  evergreen: 'Evergreen',
};
