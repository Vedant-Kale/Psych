> **Superseded 2026-11-24:** the canonical docs now live in `md-files/` (Context, Design, Architecture, Technology, Research, Plan). This file is kept as history.

# PSYCH — Tech stack and backend decision

Date: 2026-11-24. Status: PROPOSED (Claude's call, owner asked Claude to decide; owner may override any line).
Inputs: [research report](../../reports/Immersive%203D%20portfolio%20research.md), [borrowing report](../research/2026-11-24-borrowing-report.md), [design doc](../superpowers/specs/2026-11-24-portfolio-design.md).

## 1. The decision in one paragraph

PSYCH is a **Next.js static site** (every page pre-built from the Markdown content in GitHub) served from **Cloudflare's free plan**, plus **one small Cloudflare Worker** that is the only backend: it runs The Order, logs unanswered questions, and later handles inquiries and the admin page. The AI runs on **Cloudflare Workers AI** inside the same account, so the free quota is a hard stop and a bill is impossible. There is no server rendering pages, no CMS service, and no database except one small free **D1** table. Everything is $0, versioned in git, and has a very small attack surface.

## 2. Why Cloudflare, not Vercel

| Factor | Vercel Hobby | Cloudflare free | Winner |
|---|---|---|---|
| Commercial use (client inquiries later) | Hobby is personal / non-commercial only; financial gain counts as commercial ([terms](https://vercel.com/legal/terms), [community](https://community.vercel.com/t/question-about-commercial-usage/23321)) | No such restriction found (to verify in Cloudflare's terms) | Cloudflare |
| Free AI with a hard stop | Not built in | Workers AI: 10,000 Neurons/day, fails instead of billing | Cloudflare |
| Free database that never pauses | Not built in | D1 | Cloudflare |
| Rate limiting, bot check, email routing | Paid or third-party | Built in (1 free rate-limit rule, Turnstile, Email Routing with a Cloudflare-DNS domain) | Cloudflare |
| Running full Next.js server features | Native | Possible via OpenNext, but the free Worker has 10 ms CPU per request and a small script-size limit ([limits](https://developers.cloudflare.com/workers/platform/limits/)) | Vercel |

The last row is why PSYCH doesn't run Next.js as a server at all. Every page is content from git, so it can be **pre-built**. Pre-built pages need no CPU per visit, can't be server-attacked, and load fastest. The persistent 3D canvas works fully client-side. The few things that need a server go to one tiny Worker.

## 3. The stack

### Frontend (the site)
| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), `output: 'export'`, TypeScript strict** | Persistent canvas across routes; pre-built pages; owner knows Next.js |
| UI | React 19, **Tailwind CSS**, **Motion** for UI transitions | Common, fast, small |
| 3D | **three.js + React Three Fiber + drei**, WebGL renderer by default | Every award winner shipped WebGL; iOS 26 WebGPU fix unconfirmed |
| Post-processing | **pmndrs postprocessing** | Bloom, tone mapping, vignette, grain, ink pass |
| Your likeness | **Spark** (Gaussian splats, MIT, WebGL2) | Mixes splats with meshes; level of detail; recolor for amber grade |
| Scroll and camera | **GSAP ScrollTrigger + Observer, Lenis**; drei `CameraControls` for the 3rd→1st person shift | De facto standard; one input path for scroll, touch and the clock |
| Palace graph | **d3-force-3d** run **at build time**; positions saved in `graph.json` | Stable, composed ink drawing; no layout work in the browser |
| Quality tiers | drei `PerformanceMonitor` + own tier check at load | Borrowed from itomdev and Laxenaire |

### Content and publishing
| Layer | Choice | Why |
|---|---|---|
| Content | **MDX files in the repo, validated by Zod via Content Collections** | Active, type-safe; invalid content fails the build |
| Build outputs | Pages, `graph.json`, `search-index.json` (for The Order), Open Graph images, sitemap | One build makes everything |
| Publishing | Commit or merge on GitHub (phone app works) → GitHub Actions → deploy | Approved: GitHub is the source of truth |

### Backend (one Worker)
| Concern | Choice | Why |
|---|---|---|
| API | **One Cloudflare Worker, TypeScript, Hono router** | Tiny, fast, well under free limits |
| The Order AI | **Workers AI** model in JSON mode; exact model chosen by the eval set | Same account, hard daily cap, no key in the browser |
| Retrieval | **BM25 keyword search (MiniSearch)** over `search-index.json` | Deterministic, no key needed at build; add embeddings only if evals show misses |
| Grounding | Fact questions answered from `profile` data with no AI; AI must return `{answer, source_ids[]}`, checked in code; uncited claims dropped | Borrowed from ProjectHub, plus PSYCH's own citation check |
| Abuse control | **Turnstile** (free invisible bot check), the **one free firewall rate-limit rule** plus **per-IP counters in D1** (KV allows only 1,000 free writes/day), a **daily AI cap in code** below the 10,000-Neuron quota (resets 00:00 UTC ≈ 10–11am Melbourne), input length cap, injection and off-topic filter before the AI call | Rye saw injection attempts within hours of launch. Updated 2026-11-24 per [deployment research](../../reports/Free%20deployment%20and%20student%20resources.md) |
| Fallback | Quota hit or AI error → the static "house menu"; a kill-switch variable turns AI off instantly | Never a blank or a bill |
| Backup provider | Groq free tier (zero-retention setting), only if Workers AI quality falls short in evals | Keeps a second key out of the system unless needed |

### Data
| Data | Where | Notes |
|---|---|---|
| Posts, projects, certificates, roadmap, profile | Git | No database |
| Unanswered questions from The Order | **D1** (free), question text and timestamp only, no IP; auto-deleted after 30 days by a scheduled Worker | Feeds what you write next; stated on the page |
| Client inquiries (post-launch) | **D1**, read on the admin page; email alerts via **Cloudflare Email Routing** once a custom domain is on Cloudflare DNS (claim the free GitHub Student Pack domain at inquiry launch), otherwise Resend Free | Minimal fields, retention stated, Turnstile-protected. Email Routing likely needs a domain on Cloudflare DNS, not `workers.dev` |
| Admin sessions (post-launch) | Signed HttpOnly cookie; no session table | GitHub sign-in, allowed only for your numeric GitHub user ID |

### Hosting, domain, analytics
- **Cloudflare Workers with static assets** (free). Pages are static files; `/api/*` goes to the Worker.
- Domain: the free `*.workers.dev` address for now (exact name depends on your Cloudflare account name). A custom domain only if you later approve the cost.
- **Cloudflare Web Analytics**: free, cookieless, aggregate only.

### Security
- Security headers set in a `_headers` file: CSP, HSTS, `frame-ancestors 'none'`, referrer and permissions policies.
- **Change from the design doc:** pre-built pages have no server to create per-request nonces, so the CSP uses **hashes** of the inline scripts, generated after each build. Same protection, no server needed.
- Secrets (Groq key if used, GitHub app credentials later) live only in Worker secrets, never in the repo or browser.
- CI: gitleaks secret scan, `npm audit`, dependency updates via Dependabot.
- Admin (post-launch): GitHub OAuth in the Worker; numeric-ID allowlist; a GitHub App or fine-grained token limited to content paths of this one repo; the same Zod schema runs before any commit.

### 3D asset pipeline
Blender (scenes, baked lighting, camera curves) → **gltf-transform** (Draco or Meshopt geometry, **KTX2** textures, **WebP** for ink line art) → lazy-loaded per hour. **Every deployed file must be ≤ 25 MiB** (Cloudflare static asset limit); CI fails any file over 20 MiB, and anything larger is split or moved to R2. Your likeness: **Classic Scaniverse** (iOS, free) → **SuperSplat** (crop, grade, decimate) → **SOG** for Spark, separate desktop and mobile budgets. Originals stay private and never enter git.

### Quality and CI (GitHub Actions)
Every pull request runs: ESLint, TypeScript, **Vitest** (unit), content validation, **Playwright** end-to-end with **axe** accessibility checks, **Lighthouse CI** against the launch quality bar, gitleaks, and audit. The Order's **eval set** (sample orders with expected citations) runs against the real model on a schedule and before releases, not on every PR, to save free quota. Merges to `main` deploy with **Wrangler**.

## 4. What this rules out

No Vercel, no OpenNext server runtime, no Supabase, no vector database, no hosted CMS, no paid services, no Theatre.js, no WebGPU-only code paths.

## 5. Risks and checks before build

| Risk | Check |
|---|---|
| ~~Cloudflare free-plan commercial use~~ | Resolved: no non-commercial clause found in the terms (bans card-data handling on free services only) |
| ~~Static asset requests counted against the Worker limit~~ | Resolved: "requests to static assets are free and unlimited"; keep `run_worker_first` off for asset paths so only `/api/*` runs Worker code |
| Workers AI answer quality on a small free model | Eval set decides the model; Groq is the fallback |
| ~~Workers AI data use~~ | Resolved: Cloudflare does not use customer content to train generative AI |
| Free Worker script size limit (docs show 3 MB and 64 MiB in different versions) | The API Worker stays small; measure in CI |
| CDN terms on serving many large files | Workers static assets fall under Developer Platform terms without that clause (our reading); R2 fallback ready |
| Student Pack domain renewal price (year 2) | Check before claiming; claim only when inquiries launch |
| RMIT resources | Not used for the live site: RMIT IT Acceptable Use Standard bans commercial use of RMIT IT. RMIT email only to verify student offers, never as the login for hosting, domain or API accounts |
| Spark splat performance on mid-range phones | First prototype |
| Hash-based CSP with Next.js static export | Prototype early; fall back to Worker-injected nonces only if hashes can't cover all scripts |
| Scaniverse free plan and commercial use | Check before inquiries launch |
