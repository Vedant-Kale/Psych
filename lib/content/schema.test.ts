import { describe, expect, it } from 'vitest';
import { postSchema, projectSchema, storyHeadingsMissing } from './schema';

const spark = {
  slug: 'why-bars-light-amber',
  title: 'Why bars light amber',
  type: 'spark',
  domain: 'psychology',
  stage: 'seedling',
  date: '2026-11-24',
  summary: 'Warm light slows people down.',
  links: [],
};

describe('postSchema', () => {
  it('accepts a valid spark', () => {
    expect(postSchema.safeParse(spark).success).toBe(true);
  });

  it('rejects unknown domain', () => {
    const r = postSchema.safeParse({ ...spark, domain: 'astrology' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(['domain']);
  });

  it('requires project when type is trail', () => {
    const r = postSchema.safeParse({ ...spark, type: 'trail' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(['project']);
    expect(postSchema.safeParse({ ...spark, type: 'trail', project: 'expense-track' }).success).toBe(true);
  });

  it('rejects summary over 280 chars', () => {
    expect(postSchema.safeParse({ ...spark, summary: 'x'.repeat(281) }).success).toBe(false);
    expect(postSchema.safeParse({ ...spark, summary: 'x'.repeat(280) }).success).toBe(true);
  });

  it('rejects non-kebab slug', () => {
    for (const slug of ['Why_Bars', 'why bars', '-why', 'why-', 'why--bars']) {
      expect(postSchema.safeParse({ ...spark, slug }).success, slug).toBe(false);
    }
  });

  it('rejects a bad date', () => {
    expect(postSchema.safeParse({ ...spark, date: '2026-13-40' }).success).toBe(false);
  });
});

describe('story posts', () => {
  const story = { ...spark, slug: 'captaincy', type: 'story', domain: 'business', themes: ['leadership', 'teamwork'] };

  it('accepts a story with at least one known theme', () => {
    expect(postSchema.safeParse(story).success).toBe(true);
  });

  it('needs themes: missing, empty or unknown is rejected', () => {
    for (const themes of [undefined, [], ['astrology']]) {
      const r = postSchema.safeParse({ ...story, themes });
      expect(r.success, JSON.stringify(themes)).toBe(false);
      expect(r.error?.issues[0]?.path[0]).toBe('themes');
    }
  });

  it('rejects contact fields, so a named teammate or manager never gets an email or phone on the site', () => {
    for (const extra of [{ email: 'a@b.co' }, { phone: '0400 000 000' }]) {
      expect(postSchema.safeParse({ ...story, ...extra }).success, JSON.stringify(extra)).toBe(false);
    }
    expect(postSchema.safeParse({ ...spark, email: 'a@b.co' }).success).toBe(false);
  });

  it('other post types may omit themes', () => {
    expect(postSchema.safeParse(spark).success).toBe(true);
  });
});

describe('storyHeadingsMissing', () => {
  it('lists the situation, action and result headings a story lacks', () => {
    expect(storyHeadingsMissing('## Situation\nx\n\n## Action\nx\n\n## Result\nx')).toEqual([]);
    expect(storyHeadingsMissing('## Situation\nx\n## Result\nx')).toEqual(['Action']);
    expect(storyHeadingsMissing('no headings')).toEqual(['Situation', 'Action', 'Result']);
    expect(storyHeadingsMissing('### Situation\n## action\n## RESULT')).toEqual(['Situation']);
  });
});

describe('projectSchema', () => {
  it('needs at least one domain and an honest status', () => {
    const p = { slug: 'expense-track', title: 'expense-track', status: 'building', domains: ['finance'], summary: 's', started: '2026-09-01' };
    expect(projectSchema.safeParse(p).success).toBe(true);
    expect(projectSchema.safeParse({ ...p, domains: [] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...p, status: 'done' }).success).toBe(false);
  });
});
