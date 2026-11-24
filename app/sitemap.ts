import type { MetadataRoute } from 'next';
import { allPosts, allProjects } from '@/lib/content';
import { SITE_URL, staticRoutes } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...staticRoutes,
    ...allPosts().map((p) => `/palace/${p.slug}/`),
    ...allProjects().map((p) => `/projects/${p.slug}/`),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
