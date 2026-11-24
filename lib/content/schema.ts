import { z } from 'zod';

export const domains = ['ai-agents', 'finance', 'geospatial', 'psychology', 'business'] as const;
export const postTypes = ['spark', 'deep-dive', 'trail', 'learning'] as const;
export const stages = ['seedling', 'budding', 'evergreen'] as const;
export const projectStatuses = ['live', 'building', 'planned'] as const;

export const domainSchema = z.enum(domains);
export type Domain = z.infer<typeof domainSchema>;
export type PostType = (typeof postTypes)[number];
export type Stage = (typeof stages)[number];
export type ProjectStatus = (typeof projectStatuses)[number];

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case');
const isoDate = z.iso.date();
const summary = z.string().min(1).max(280);

export const postFields = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  type: z.enum(postTypes),
  domain: domainSchema,
  stage: z.enum(stages),
  date: isoDate,
  summary,
  links: z.array(slugSchema).default([]),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
  project: slugSchema.optional(),
});

/** Adds the cross-field rule; reused by the content loader after it extends the fields with `content`. */
export const withTrailRule = <T extends z.ZodType<{ type: PostType; project?: string | undefined }>>(schema: T) =>
  schema.refine((p) => p.type !== 'trail' || p.project !== undefined, {
    message: 'trail posts must name their project',
    path: ['project'],
  });

export const postSchema = withTrailRule(postFields);
export type Post = z.infer<typeof postSchema>;

export const projectSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  status: z.enum(projectStatuses),
  domains: z.array(domainSchema).min(1),
  summary,
  repo: z.url().optional(),
  trail: slugSchema.optional(),
  started: isoDate,
});
export type Project = z.infer<typeof projectSchema>;

export const certificateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  issuer: z.string().min(1),
  date: isoDate,
  url: z.url().optional(),
});
export type Certificate = z.infer<typeof certificateSchema>;

export const roadmapSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  status: z.enum(projectStatuses),
  target: z.string().optional(),
});
export type RoadmapItem = z.infer<typeof roadmapSchema>;

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  education: z.array(z.object({ degree: z.string(), institution: z.string(), status: z.string() })),
  roles: z.array(
    z.object({ title: z.string(), kind: z.enum(['hospitality', 'events', 'customer-service', 'other']) }),
  ),
  skills: z.array(z.object({ name: z.string(), evidence: z.array(slugSchema) })),
  contact: z.object({ email: z.email().optional(), github: z.url(), linkedin: z.url().optional() }),
});
export type Profile = z.infer<typeof profileSchema>;

export const houseMenuSchema = z.object({
  items: z.array(z.object({ skill: z.string(), evidence: z.array(slugSchema).min(1), rationale: z.string() })).min(1),
});
export type HouseMenu = z.infer<typeof houseMenuSchema>;
