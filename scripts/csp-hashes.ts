import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Cloudflare `_headers` limit per line (name + value + indent). */
export const MAX_HEADER_LINE = 2000;

/** `'sha256-…'` for each inline `<script>` (no `src`). Script text is raw in HTML, so the bytes hashed are the bytes served. */
export function collectInlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const [, attrs = '', body = ''] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/(?:^|\s)src\s*=/i.test(attrs)) continue;
    hashes.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return hashes;
}

/**
 * `_headers` content for every path. One site-wide CSP holds the union of all pages' inline-script hashes,
 * because Cloudflare joins duplicate headers with a comma, which would enforce two CSPs at once.
 * shortcut: one CSP line for all pages; once it nears MAX_HEADER_LINE, move to per-path rules with `! Content-Security-Policy`.
 */
export function buildHeaders(hashes: string[]): string {
  const scripts = [...new Set(hashes)].sort().join(' ');
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${scripts} https://challenges.cloudflare.com https://static.cloudflareinsights.com`,
    'frame-src https://challenges.cloudflare.com',
    "connect-src 'self' https://cloudflareinsights.com",
    "img-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
  const line = `  Content-Security-Policy: ${csp}`;
  if (line.length > MAX_HEADER_LINE) {
    throw new Error(`CSP line is ${line.length} chars, over Cloudflare's ${MAX_HEADER_LINE}: switch to per-path CSP rules`);
  }
  return [
    '/*',
    line,
    '  Strict-Transport-Security: max-age=63072000; includeSubDomains',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  X-Content-Type-Options: nosniff',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '',
  ].join('\n');
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => join(e.parentPath, e.name));
}

function main() {
  const files = htmlFiles('out');
  const hashes = files.flatMap((f) => collectInlineScriptHashes(readFileSync(f, 'utf8')));
  writeFileSync('out/_headers', buildHeaders(hashes));
  console.log(`csp: ${new Set(hashes).size} inline-script hashes from ${files.length} pages → out/_headers`);
}

if (import.meta.main) {
  try {
    main();
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
