import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

/** The CSP the build wrote for Cloudflare. `serve` doesn't read _headers, so the test applies it to each page itself. */
const csp = readFileSync('out/_headers', 'utf8')
  .split('\n')
  .find((l) => l.trim().startsWith('Content-Security-Policy:'))!
  .replace(/^\s*Content-Security-Policy:\s*/, '');

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    // Only our own pages: a third-party frame (Turnstile) serves its own headers.
    const req = route.request();
    if (req.resourceType() !== 'document' || !req.url().startsWith('http://localhost')) return route.continue();
    const res = await route.fetch();
    await route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': csp } });
  });
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
});

test("the CSP has no 'unsafe-inline' for scripts", () => {
  const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'))!;
  expect(scriptSrc).not.toContain("'unsafe-inline'");
});

for (const path of ['/', '/facts/', '/palace/why-bars-light-amber/', '/projects/expense-track/', '/influences/', '/privacy/', '/order/', '/no-such-page/']) {
  test(`no CSP violations on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (/Content Security Policy/i.test(m.text())) errors.push(m.text());
    });
    await page.goto(path, { waitUntil: 'networkidle' });
    const violations = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
    expect([...violations, ...errors]).toEqual([]);
  });
}

test('client-side navigation from home to facts stays within the CSP', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (/Content Security Policy/i.test(m.text())) errors.push(m.text());
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Skip to the facts' }).click();
  await expect(page).toHaveURL(/\/facts\/$/);
  await page.waitForLoadState('networkidle');
  expect([...(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)), ...errors]).toEqual([]);
});
