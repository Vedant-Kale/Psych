// shortcut: falls back to the local preview server; set the repo variable SITE_URL once the Cloudflare URL exists (ticket 05).
export const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:4173').replace(/\/$/, '');

/** Every static route, with the trailing slash the export uses. */
export const staticRoutes = ['/', '/facts/', '/order/', '/influences/', '/privacy/'] as const;

// shortcut: Cloudflare's always-pass test key until the repo variable is set; production deploys require the real key (#47).
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
