import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildHeaders, collectInlineScriptHashes, MAX_HEADER_LINE } from './csp-hashes.ts';

const sha = (s: string) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

describe('collectInlineScriptHashes', () => {
  it('hashes each inline script and ignores src scripts', () => {
    const html = `<script>a()</script><script src="/x.js"></script><script id="_R_">self.__next_f=1</script><script src='/y.js' async></script>`;
    expect(collectInlineScriptHashes(html)).toEqual([sha('a()'), sha('self.__next_f=1')]);
  });

  it('hashes JSON-LD data blocks too and keeps exact bytes, including unicode', () => {
    const json = '{"name":"Vedant — Kale"}';
    expect(collectInlineScriptHashes(`<script type="application/ld+json">${json}</script>`)).toEqual([sha(json)]);
  });

  it('matches end tags with whitespace or different case, as browsers do', () => {
    expect(collectInlineScriptHashes('<script>c()</script >')).toEqual([sha('c()')]);
    expect(collectInlineScriptHashes('<SCRIPT>d()</SCRIPT\n>')).toEqual([sha('d()')]);
  });

  it('does not treat data-src or a src word in content as a src attribute', () => {
    expect(collectInlineScriptHashes('<script data-src="x">b()</script>')).toEqual([sha('b()')]);
  });
});

describe('buildHeaders', () => {
  const headers = buildHeaders([sha('a()'), sha('b()')]);
  const csp = headers.split('\n').find((l) => l.trim().startsWith('Content-Security-Policy:'))!;

  it("headers contain no 'unsafe-inline' or 'unsafe-eval' in script-src", () => {
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/);
  });

  it('lists the hashes and locks down framing, objects and base', () => {
    expect(csp).toContain(sha('a()'));
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('applies to every path with the full security header set', () => {
    expect(headers.startsWith('/*\n')).toBe(true);
    for (const h of [
      'Strict-Transport-Security: max-age=63072000; includeSubDomains',
      'Referrer-Policy: strict-origin-when-cross-origin',
      'X-Content-Type-Options: nosniff',
      'Permissions-Policy: camera=(), microphone=(), geolocation=()',
    ]) {
      expect(headers).toContain(`  ${h}`);
    }
  });

  it('dedupes and sorts hashes so the file is stable', () => {
    expect(buildHeaders([sha('b()'), sha('a()'), sha('a()')])).toBe(buildHeaders([sha('a()'), sha('b()')]));
  });

  it('refuses a CSP line longer than Cloudflare allows', () => {
    const many = Array.from({ length: 60 }, (_, i) => sha(String(i)));
    expect(() => buildHeaders(many)).toThrow(new RegExp(String(MAX_HEADER_LINE)));
  });
});
