import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { errorCopy, houseMenuCopy, refusalCopy, resultHeading, turnstileBlocked } from '../components/order/copy';

/** Stands in for Cloudflare's api.js: renders nothing and hands back a token at once. */
const TURNSTILE_STUB = `window.turnstile = { render: function (el, o) { setTimeout(function () { o.callback('test-token'); }, 0); return 'w'; }, remove: function () {} };`;

test.beforeEach(async ({ page }) => {
  await page.route('https://challenges.cloudflare.com/**', (r) => r.fulfill({ contentType: 'application/javascript', body: TURNSTILE_STUB }));
});

/** Answers /api/order with one fixed reply; returns a counter of calls. */
async function api(page: Page, status: number, body: unknown, delayMs = 0) {
  let calls = 0;
  await page.route('**/api/order', async (r) => {
    calls++;
    if (delayMs) await new Promise((res) => setTimeout(res, delayMs));
    await r.fulfill({ status, contentType: typeof body === 'string' ? 'text/html' : 'application/json', body: typeof body === 'string' ? body : JSON.stringify(body) });
  });
  return () => calls;
}

async function order(page: Page, text = 'an engineer who can ship secure AI agents') {
  await page.goto('/order/');
  await page.getByLabel('Your order').fill(text);
  const place = page.getByRole('button', { name: 'Place order' });
  await expect(place).toBeEnabled();
  await place.click();
}

const menu = { items: [{ skill: 'Private data by design', evidence: ['expense-track'], rationale: 'Row-level security on every table.' }] };

const cases: { name: string; status: number; body: unknown; heading: string; text: string }[] = [
  {
    name: 'mix',
    status: 200,
    body: { kind: 'mix', layers: [{ skill: 'Secure multi-user data', evidenceIds: ['expense-track#0', 'expense-track#1'], rationale: 'Forced row-level security.' }] },
    heading: resultHeading.mix,
    text: 'Secure multi-user data',
  },
  { name: 'fact', status: 200, body: { kind: 'fact', answer: 'Master of AI at RMIT.', sourceIds: ['profile'] }, heading: resultHeading.fact, text: 'Master of AI at RMIT.' },
  { name: 'none', status: 200, body: { kind: 'none', message: 'Nothing in my work supports that yet.' }, heading: resultHeading.none, text: 'Nothing in my work supports that yet.' },
  { name: 'refused', status: 200, body: { kind: 'refused', reason: 'injection' }, heading: resultHeading.refused, text: refusalCopy.injection },
  { name: 'house menu', status: 429, body: { kind: 'house-menu', reason: 'rate-limit', menu }, heading: resultHeading['house-menu'], text: houseMenuCopy['rate-limit'] },
  { name: 'verification error', status: 403, body: { error: 'verification failed' }, heading: resultHeading.error, text: errorCopy.verification },
];

for (const c of cases) {
  test(`${c.name}: shows its result and moves focus to the result heading`, async ({ page }) => {
    await api(page, c.status, c.body);
    await order(page);
    await expect(page.getByRole('heading', { level: 2, name: c.heading })).toBeFocused();
    await expect(page.getByText(c.text)).toBeVisible();
  });
}

test('mix and house menu link each source once, to its page', async ({ page }) => {
  await api(page, 200, cases[0]!.body);
  await order(page);
  await expect(page.getByRole('link', { name: 'expense-track-agent' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'expense-track-agent' })).toHaveAttribute('href', '/projects/expense-track/');
});

test('two quick clicks send exactly one order', async ({ page }) => {
  const calls = await api(page, 200, { kind: 'none', message: 'm' }, 400);
  await page.goto('/order/');
  await page.getByLabel('Your order').fill('an engineer');
  const place = page.getByRole('button', { name: 'Place order' });
  await expect(place).toBeEnabled();
  await place.dblclick();
  await expect(page.getByRole('heading', { level: 2, name: resultHeading.none })).toBeVisible();
  expect(calls()).toBe(1);
});

test('a 502 HTML page becomes a plain network error with Try again', async ({ page }) => {
  await api(page, 502, '<html>Bad gateway</html>');
  await order(page);
  await expect(page.getByText(errorCopy.network)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('when the human check cannot load, ordering is disabled with a reason and the facts link', async ({ page }) => {
  await page.unroute('https://challenges.cloudflare.com/**');
  await page.route('https://challenges.cloudflare.com/**', (r) => r.abort());
  await page.goto('/order/');
  await expect(page.getByText(turnstileBlocked)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'facts page' })).toHaveAttribute('href', '/facts/');
});

test('keyboard only: Tab to the order, type, Tab to Place order, Enter', async ({ page }) => {
  await api(page, 200, { kind: 'none', message: 'm' });
  await page.goto('/order/');
  await expect(page.getByRole('button', { name: 'Place order' })).toBeEnabled();
  await page.getByLabel('Your order').focus();
  await page.keyboard.type('an engineer');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Place order' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: resultHeading.none })).toBeFocused();
});

test('order page has no axe violations with a result showing', async ({ page }) => {
  await api(page, 429, { kind: 'house-menu', reason: 'disabled', menu });
  await order(page);
  await expect(page.getByRole('heading', { level: 2, name: resultHeading['house-menu'] })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations).toEqual([]);
});

test.describe('receipt', () => {
  const mix = {
    kind: 'mix',
    layers: [
      { skill: 'Secure multi-user data', evidenceIds: ['expense-track#0'], rationale: 'Forced row-level security.' },
      { skill: 'Reading a room', evidenceIds: ['ghost-slug#0'], rationale: 'Years behind the bar.' },
    ],
  };

  test('a mix comes with a receipt: who, what was ordered, and every layer with its proof', async ({ page }) => {
    await api(page, 200, mix);
    await order(page, 'someone who builds safe agents');
    const receipt = page.getByRole('region', { name: 'Receipt' });
    await expect(receipt.getByText('Vedant Kale', { exact: true })).toBeVisible();
    await expect(receipt.getByText('someone who builds safe agents')).toBeVisible();
    for (const l of mix.layers) await expect(receipt.getByText(l.skill)).toBeVisible();
    await expect(receipt.getByRole('link', { name: 'expense-track-agent' })).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations).toEqual([]);
  });

  test('a source the site no longer has shows as plain text, not a broken link', async ({ page }) => {
    await api(page, 200, mix);
    await order(page);
    const receipt = page.getByRole('region', { name: 'Receipt' });
    await expect(receipt.getByText('ghost-slug')).toBeVisible();
    await expect(receipt.getByRole('link', { name: 'ghost-slug' })).toHaveCount(0);
  });

  test('printing shows only the receipt', async ({ page }) => {
    await api(page, 200, mix);
    await order(page);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('region', { name: 'Receipt' })).toBeVisible();
    await expect(page.getByLabel('Your order')).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: 'The Order' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeHidden();
  });
});

test.describe('pour', () => {
  const three = {
    kind: 'mix',
    layers: ['Agents', 'Security', 'Data'].map((skill) => ({ skill, evidenceIds: ['expense-track#0'], rationale: 'r' })),
  };

  test('pours one band per layer, decorative only', async ({ page }) => {
    await api(page, 200, three);
    await order(page);
    const pour = page.locator('.pour');
    await expect(pour).toHaveAttribute('aria-hidden', 'true');
    await expect(pour.locator('.pour-band')).toHaveCount(3);
  });

  test('with reduced motion the bands are simply there, no animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await api(page, 200, three);
    await order(page);
    await expect(page.locator('.pour-band')).toHaveCount(3);
    const names = await page.locator('.pour-band').evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
    expect(names).toEqual(['none', 'none', 'none']);
  });

  test('is not printed', async ({ page }) => {
    await api(page, 200, three);
    await order(page);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.pour')).toBeHidden();
  });
});

test('the receipt names the same site as the sitemap', async ({ page, request }) => {
  const origin = new URL((await (await request.get('/sitemap.xml')).text()).match(/<loc>([^<]+)<\/loc>/)![1]!).host;
  await api(page, 200, { kind: 'mix', layers: [{ skill: 's', evidenceIds: ['expense-track#0'], rationale: 'r' }] });
  await order(page);
  await expect(page.getByRole('region', { name: 'Receipt' }).getByText(/^Mixed /)).toContainText(`${origin}/order/`);
});
