// shortcut: falls back to the local preview server; set the repo variable SITE_URL once the Cloudflare URL exists (ticket 05).
export const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:4173').replace(/\/$/, '');

/** Every static route, with the trailing slash the export uses. */
export const staticRoutes = ['/', '/facts/', '/influences/', '/privacy/'] as const;
