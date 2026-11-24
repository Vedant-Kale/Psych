import { readdirSync, readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Read project frontmatter straight from content/, so the test can't drift from the source. */
const projects = readdirSync('content/projects')
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = readFileSync(`content/projects/${f}`, 'utf8');
    const field = (k: string) => fm.match(new RegExp(`^${k}: (.+)$`, 'm'))?.[1]?.trim() ?? '';
    return { slug: field('slug'), title: field('title'), status: field('status') };
  });

async function expectNoAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
}

test('home has a visible "Skip to the facts" link to /facts/', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to the facts' });
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute('href', '/facts/');
});

test('facts lists every project with its status badge', async ({ page }) => {
  expect(projects.length).toBeGreaterThan(0);
  await page.goto('/facts/');
  await expect(page).toHaveTitle('Facts — PSYCH — Vedant Kale');
  for (const p of projects) {
    const item = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: p.title }) });
    await expect(item.getByText(p.status, { exact: true })).toBeVisible();
  }
});

test('facts carries Person JSON-LD', async ({ page }) => {
  await page.goto('/facts/');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(ld['@type']).toBe('Person');
  expect(ld.name).toBe('Vedant Kale');
});

test('each project page shows its title and status', async ({ page }) => {
  for (const p of projects) {
    await page.goto(`/projects/${p.slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
    await expect(page.getByText(p.status, { exact: true })).toBeVisible();
  }
});

for (const path of ['/facts/', `/projects/${projects[0]?.slug}/`, '/influences/', '/privacy/', '/']) {
  test(`axe finds no violations on ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expectNoAxeViolations(page);
  });
}

test('sitemap lists every static route', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/', '/facts/', '/influences/', '/privacy/', '/palace/why-bars-light-amber/', ...projects.map((p) => `/projects/${p.slug}/`)]) {
    expect(xml).toContain(`${path}</loc>`);
  }
});

test('robots allows indexing and points to the sitemap', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toMatch(/Allow: \//);
  expect(txt).not.toMatch(/Disallow: \/\s*$/m);
  expect(txt).toMatch(/Sitemap: .+\/sitemap\.xml/);
});
