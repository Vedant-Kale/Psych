# PSYCH — Architecture

How the system is structured. Product choices in [Design](Design.md); library choices in [Technology](Technology.md).
Status: PROPOSED.

## 1. System overview

```
             GitHub repo (source of truth: code + MDX content)
                        │ push / merge to main
                        ▼
             GitHub Actions: validate → test → build → deploy (Wrangler)
                        │
                        ▼
VISITOR ──▶ Cloudflare Worker "psych" (free plan)
              ├─ static assets (pre-built pages, 3D assets, graph.json,     ← free & unlimited, no Worker CPU
              │   search-index.json, _headers)
              └─ /api/*  ──▶ Worker code (Hono)
                              ├─ POST /api/order    The Order
                              ├─ GET  /api/health
                              ├─ cron (daily)       purge rows older than 30 days
                              └─ later: /api/inquiry, /api/admin/*
                                       │
                                       ├─ Workers AI (binding AI)      hard daily quota
                                       ├─ D1 (binding DB)              counters, unanswered questions, inquiries
                                       └─ Turnstile siteverify         bot check
```

Only `/api/*` runs Worker code. Everything else is a static file.

## 2. Repository layout

```
psych/
├─ app/                      Next.js App Router (static export)
│  ├─ layout.tsx             root layout; mounts the persistent <Experience/> canvas
│  ├─ page.tsx               One Night
│  ├─ facts/page.tsx         fast path
│  ├─ palace/page.tsx        Mind Palace
│  ├─ palace/[slug]/page.tsx node pages
│  ├─ projects/[slug]/page.tsx
│  ├─ influences/ privacy/   static pages
├─ components/
│  ├─ experience/            canvas, camera rig, clock, quality tiers
│  ├─ night/                 one folder per hour scene
│  ├─ palace/                ink world, nodes, ink pass
│  └─ order/                 The Order UI (pour, receipt, house menu)
├─ content/                  MDX + YAML (the only place the owner edits)
│  ├─ posts/  projects/  certificates/  roadmap/  profile.yaml  house-menu.yaml
├─ lib/content/              schemas and loaders
├─ scripts/                  build-time generators and checks
├─ worker/                   the API Worker (Hono) + D1 migrations
├─ public/assets/            optimised 3D assets (≤ 20 MiB each)
├─ evals/                    The Order eval cases
├─ e2e/                      Playwright tests
└─ md-files/                 these documents
```

## 3. Content pipeline (build time)

1. Content Collections loads `content/**` and validates every file against Zod schemas. Any error fails the build.
2. `scripts/build-graph.ts` turns posts, projects and their links into `public/graph.json` with **precomputed 3D positions** (seeded, deterministic).
3. `scripts/build-search-index.ts` chunks content into `public/search-index.json` (MiniSearch, BM25) with stable chunk IDs (`<slug>#<n>`).
4. `next build` (static export) renders every page to `out/`.
5. `scripts/csp-hashes.ts` hashes every inline script in `out/**/*.html` and writes `out/_headers` with the CSP and other security headers.
6. `scripts/check-asset-sizes.ts` fails the build if any file in `out/` exceeds 20 MiB.
7. Wrangler deploys `out/` as static assets and `worker/` as the Worker.

The Worker reads `search-index.json`, `profile.yaml` (compiled to JSON) and `house-menu.yaml` (compiled to JSON), bundled at build.

## 4. The Order pipeline (request time)

```
POST /api/order { text, turnstileToken }
 1 parse & validate body (Zod)              → 400 on invalid
 2 Turnstile siteverify                     → 403 on fail
 3 per-IP rate limit (D1, hashed IP)        → 429 with house menu
 4 screenInput: length, injection, off-topic→ polite refusal
 5 answerFromProfile (no AI)                → fact answer if matched
 6 daily AI budget check (D1)               → house menu if exhausted
 7 retrieve top-k chunks (MiniSearch)
 8 Workers AI, JSON mode, fixed system prompt; content passed as data
 9 enforceCitations: keep only layers whose evidence IDs ⊆ supplied chunk IDs; drop unsupported numbers
10 if no layers survive → honest "nothing in my work supports that" + logUnknown
11 respond OrderResult
any AI error / kill switch → house menu
```

## 5. Data

| Table (D1) | Columns | Retention |
|---|---|---|
| `rate_limits` | `key` (sha256 of IP + secret + UTC day), `ts`; one row per accepted order, so the 10-minute window slides | Purged after 30 days |
| `ai_budget` | `day` (UTC date), `calls` | Purged after 30 days |
| `unknown_questions` | `id`, `text`, `created_at` | Deleted after 30 days |
| `inquiries` (post-launch) | `id`, `name`, `contact`, `order_json`, `message`, `created_at` | Stated on /privacy |

No raw IPs are stored. Content never lives in D1.

## 6. Front-end runtime

- One persistent `<Canvas>` in the root layout; routes change what it shows, never unmount it.
- Camera on a Blender-authored spline; scroll and the clock both drive one `progress` value (0 = 18:00, 1 = dawn).
- Only the current hour and the next are loaded; passed hours are disposed (iOS memory).
- A global `timeOfDay` uniform blends colour atlases and baked lightmaps across hours.
- Quality tier chosen at load, adjusted at runtime by FPS; tier "still" shows static frames.
- All text and controls are HTML over the canvas.

## 7. Security architecture

- Static pages: no server, no per-request code.
- Headers (`_headers`): CSP with script hashes (no `unsafe-inline`), HSTS, `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`.
- Worker: input validation at the boundary, Turnstile, rate limits, daily AI budget, kill switch (`ORDER_ENABLED=false`), secrets only in Worker secrets.
- Admin (post-launch): GitHub OAuth in the Worker, allow only the owner's numeric GitHub user ID, signed HttpOnly SameSite=Strict cookie, GitHub App/fine-grained token scoped to `content/**` of this repo, Zod validation before commit.
- CI: gitleaks, `npm audit`, Dependabot.
- Likeness originals never in git or `out/`.

## 8. Environments

| Env | Where | Who |
|---|---|---|
| Local | `next dev` + `wrangler dev` (local D1, Turnstile test keys) | Owner / Claude |
| Preview | Cloudflare preview URL per branch, not linked publicly | Owner testing on real devices |
| Production | `psych.<account>.workers.dev`; custom domain when inquiries launch | Public, after the quality bar passes |
