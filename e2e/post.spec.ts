import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const post = '/palace/why-bars-light-amber/';

test('post page has an h1 and the domain', async ({ page }) => {
  await page.goto(post);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Why bars light amber');
  await expect(page.getByText('Psychology', { exact: true })).toBeVisible();
});

test('post page title follows the site pattern', async ({ page }) => {
  await page.goto(post);
  await expect(page).toHaveTitle('Why bars light amber — PSYCH — Vedant Kale');
});

test('post page carries Article JSON-LD', async ({ page }) => {
  await page.goto(post);
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const ld = JSON.parse(raw ?? '{}') as Record<string, unknown>;
  expect(ld['@type']).toBe('Article');
  expect(ld.headline).toBe('Why bars light amber');
  expect(ld.datePublished).toBe('2026-11-24');
});

test('axe finds no violations on a post', async ({ page }) => {
  await page.goto(post);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
});

test('unknown post slug is not built', async ({ request }) => {
  const res = await request.get('/palace/no-such-post/');
  expect(res.status()).toBe(404);
});
