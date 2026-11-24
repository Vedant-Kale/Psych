# M5 — The Order front end Implementation Plan

> **For agentic workers:** Follow md-files/Workflow.md: one GitHub issue, branch and PR per task, failing test first, `npm run verify` green before push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A visitor can order an engineer in plain words and get a cited mix, an honest "no", a fact, or the house menu, as accessible HTML that works without the 3D night.

**Architecture:** One client component `<Order/>` (form + Turnstile + result) lives at the static page `/order/`. The server page passes it the profile, house menu and a slug → page map, so the client never bundles the content collections. Results render in a live region; the mix shows a 2D pour and a printable receipt. The 21:00 bar scene in M3 will later mount the same `<Order/>` over the 3D counter; this plan does no 3D.

**Tech Stack:** Next.js 16 static export, React 19 client component, Cloudflare Turnstile (explicit render), plain CSS animation (no new animation dependency), Playwright with route mocks plus axe, Vitest.

**Spec:** md-files/Design.md §1, §5 (The Order), §8; md-files/Architecture.md §2, §4; md-files/Plan.md Global Constraints.

## Global Constraints

Everything in md-files/Plan.md "Global Constraints" applies. In addition:
- Order input: **3–500 characters** after trimming (the server is the authority; the client only guides).
- Every claim on screen comes from the API response; the client adds no skill text of its own.
- Results are announced in an `aria-live="polite"` region, and focus moves to the result heading.
- `prefers-reduced-motion: reduce` → no pour animation; layers appear at once.
- CSP stays without `'unsafe-inline'` for scripts; Turnstile loads only from `https://challenges.cloudflare.com`.
- Site key comes from the build variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; the fallback is Cloudflare's always-pass test key `1x00000000000000000000AA`; a production deploy fails if the variable is unset.

## Review Focus

1. **Double submit / rapid clicks** → exactly one request in flight; the button is disabled while pending; Turnstile is reset after every response (tokens are single-use). Test in Task 2.
2. **Worker down or non-JSON reply** (502 HTML, network error, timeout) → a plain "couldn't reach the bar, try again" with a retry, never a stuck spinner. Test in Task 1 (client) and Task 2 (UI).
3. **Turnstile can't load** (blocked by an extension, offline) → the form says so and links to `/facts/`; submit stays disabled with a visible reason. Test in Task 2.
4. **Citation to a slug the page map doesn't know** (content renamed after the index was built) → the layer still renders and the source shows as plain text, not a broken link. Test in Task 3.
5. **Screen-reader and keyboard user** → the result is announced once, focus lands on the result heading, and the whole flow works with keyboard only. Test in Task 2 (axe + keyboard e2e).

---

### Task 1: Shared order types and API client

**Files:**
- Create: `lib/order/types.ts` (move `Layer`, `RefusalReason`, `HouseMenuReason`, `OrderResult` from `worker/src/order/types.ts`)
- Modify: `worker/src/order/types.ts` → re-export from `../../../lib/order/types` (worker already imports `lib/`)
- Create: `lib/order/client.ts`
- Test: `lib/order/client.test.ts`

**Interfaces:**
- Produces: `type OrderResponse = OrderResult | { kind: 'error'; reason: 'verification' | 'network' | 'bad-request' }`
- Produces: `postOrder(text: string, turnstileToken: string, fetchFn?: typeof fetch): Promise<OrderResponse>`. It POSTs JSON to `/api/order`, gives up after 20 s (`AbortSignal.timeout(20_000)`), and maps the status:
  - 200 or 429 with a JSON body that has `kind` → the body.
  - 403 → `verification`.
  - 400 → `bad-request`.
  - Anything else, or a body that isn't JSON, a network error or a timeout → `network`.

- [ ] **Step 1: Failing tests** in `lib/order/client.test.ts` with a stub `fetchFn`:
  - 200 mix body returned as is.
  - 429 house-menu body returned as is.
  - 403 → `{ kind: 'error', reason: 'verification' }`.
  - 400 → `bad-request`.
  - 502 with an HTML body → `network`.
  - `fetchFn` rejects → `network`.
  - Sends `{"text", "turnstileToken"}` with `content-type: application/json`.
- [ ] **Step 2:** `npx vitest run lib/order` → FAIL (module missing)
- [ ] **Step 3:** Move the types and implement `postOrder`.
- [ ] **Step 4:** `npx vitest run` → all pass; `npm run typecheck` clean.
- [ ] **Step 5:** Commit `feat(order): shared result types and API client`.

### Task 2: `/order/` page with form, Turnstile and every result kind

**Files:**
- Create: `app/order/page.tsx` (server component; title "The Order"; passes props)
- Create: `components/order/Order.tsx` (`'use client'`)
- Create: `components/order/Turnstile.tsx` (`'use client'`)
- Create: `components/order/copy.ts`
- Modify: `lib/site.ts` (add `'/order/'` to `staticRoutes`), `app/page.tsx` and `app/facts/page.tsx` (link "Order an engineer →"), `app/globals.css`
- Test: `e2e/order.spec.ts`

**Interfaces:**
- Consumes: `postOrder`, `OrderResponse` (Task 1).
- Produces: `<Order sources={Record<string, { title: string; href: string }>} profile={Profile} />`. `sources` maps every post slug to `/palace/<slug>/` and every project slug to `/projects/<slug>/`, plus `profile` → `/facts/`; it is built in `app/order/page.tsx` from `allPosts()` and `allProjects()`.
- Produces: `<Turnstile siteKey onToken={(t: string) => void} onError={() => void} resetKey={number} />`. It loads `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once and re-renders when `resetKey` changes.
- Produces: `copy.ts` exports `refusalCopy: Record<RefusalReason, string>`, `houseMenuCopy: Record<HouseMenuReason, string>` and `errorCopy: Record<'verification' | 'network' | 'bad-request', string>`. The copy is plain and warm, and never claims anything (Design §6).

Result rendering, for every response kind:
- **mix:** layer list (skill, rationale, source links). The pour from Task 4 slots in above it.
- **fact:** the answer plus a "from the facts page" link.
- **none:** the API's message.
- **refused:** `refusalCopy[reason]`.
- **house-menu:** `houseMenuCopy[reason]` plus the menu items with source links.
- **error:** `errorCopy[reason]` plus a Try again button.

Every result goes in `<section aria-live="polite">` with an `h2` that receives focus.

- [ ] **Step 1: Failing e2e** in `e2e/order.spec.ts`. Set-up: `page.route` stubs `api.js` with a script that defines `window.turnstile.render(el, { callback })` calling `callback('test-token')`, and stubs `/api/order` per test. Tests:
  - Each of the six kinds renders its copy and focuses the result heading.
  - Two quick clicks → exactly one `/api/order` request.
  - A 502 HTML reply → `errorCopy.network` shown with Try again.
  - An aborted `api.js` request → submit disabled, the reason shown, and a link to `/facts/`.
  - Keyboard only: Tab to the textarea, type, Tab to submit, Enter → result.
  - axe has zero violations, and the page logs no CSP console errors.
- [ ] **Step 2:** `npx playwright test e2e/order.spec.ts` → FAIL (404).
- [ ] **Step 3:** Implement the page, components and copy. The textarea gets `minLength 3`, `maxLength 500` and a live character count. The token resets after every response.
- [ ] **Step 4:** `npm run verify` → green.
- [ ] **Step 5:** Commit `feat(order): /order page with Turnstile and all result kinds`.

### Task 3: Receipt — the tailored one-page résumé

**Files:**
- Create: `components/order/Receipt.tsx`
- Modify: `components/order/Order.tsx` (show `<Receipt>` under a mix), `app/globals.css` (`@media print`: hide everything except `.receipt`, black on white, A4 margins)
- Test: `e2e/order.spec.ts` (extend)

**Interfaces:**
- Consumes: `Layer[]`, `sources`, `profile` (Task 2).
- Produces: `<Receipt order={string} layers={Layer[]} sources={...} profile={Profile} date={string} />`. It shows name, headline and contact (GitHub, LinkedIn and email if set) from `profile`; "Ordered: <order text>"; each layer as skill, rationale and "Proof:" source links; then the date. It has a Print button that calls `window.print()`.

- [ ] **Step 1: Failing e2e:**
  - A mix renders the receipt with the profile name, the order text and every layer's skill.
  - A layer citing `ghost-slug#0` shows "ghost-slug" as plain text with no `<a>`.
  - With `page.emulateMedia({ media: 'print' })`, the form is hidden and the receipt is visible.
- [ ] **Step 2:** Run it → FAIL.
- [ ] **Step 3:** Implement. Evidence id `slug#n` → `sources[slug]`, with plain text when the slug is missing, and duplicate slugs listed once.
- [ ] **Step 4:** `npm run verify` → green.
- [ ] **Step 5:** Commit `feat(order): printable receipt`.

### Task 4: The pour (2D glass)

**Files:**
- Create: `components/order/Pour.tsx`
- Modify: `components/order/Order.tsx`, `app/globals.css`
- Test: `e2e/order.spec.ts` (extend)

**Interfaces:**
- Consumes: `Layer[]`.
- Produces: `<Pour layers={Layer[]} />`. An inline SVG glass is marked `aria-hidden="true"`. Each layer is a band of equal height, coloured from an amber ramp in order. Bands fill bottom-up with CSS transitions staggered 400 ms apart. Under `prefers-reduced-motion: reduce`, all bands show at once with no transition. The layer list from Task 2 stays the accessible content.

- [ ] **Step 1: Failing e2e:**
  - A mix with 3 layers renders 3 bands.
  - With `page.emulateMedia({ reducedMotion: 'reduce' })`, every band's computed `transition-duration` is `0s`.
  - axe still reports zero violations.
- [ ] **Step 2:** Run it → FAIL.
- [ ] **Step 3:** Implement. Use pure SVG and CSS, with no new dependency and no inline `<script>`.
- [ ] **Step 4:** `npm run verify` → green.
- [ ] **Step 5:** Commit `feat(order): pour animation`.

### Task 5: Open The Order in production (owner-gated)

**Files:**
- Modify: `.github/workflows/deploy.yml` (on `main`, fail when the repo variable `TURNSTILE_SITE_KEY` is unset; pass it to the build as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
- Modify: `app/privacy/page.tsx` ("When The Order opens" → present tense: what is kept and for how long)
- Modify: `wrangler.jsonc` (`ORDER_ENABLED: "true"`), only after the owner's yes

- [ ] **Step 1:** The owner sets the repo variable `TURNSTILE_SITE_KEY`. It's the public site key of the existing widget, with the live hostname allowed.
- [ ] **Step 2:** Update the deploy workflow and the privacy copy, then run `npm run verify` → green.
- [ ] **Step 3:** The owner says yes to enabling; set `ORDER_ENABLED: "true"`, then merge and deploy.
- [ ] **Step 4:** Live smoke test in Brave on the live site:
  - `/order/` loads with no CSP errors.
  - "where does he study?" → a fact.
  - "an engineer who can ship secure AI agents" → a mix whose sources open.
  - After 5 quick orders, the 6th shows the house menu with the rate-limit reason.
- [ ] **Step 5:** Commit `feat(order): open The Order`.
