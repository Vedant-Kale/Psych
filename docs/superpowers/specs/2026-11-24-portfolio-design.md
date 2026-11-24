> **Superseded 2026-11-24:** the canonical docs now live in `md-files/` (Context, Design, Architecture, Technology, Research, Plan). This file is kept as history.

# Personal Portfolio — Design

Site name: **PSYCH**. Status: DRAFT, awaiting owner approval. Date: 2026-11-24.
Labels: **APPROVED** (decided by the owner in conversation), **PROPOSED** (Claude's call, owner can override), **OPEN** (needs the owner).

## 1. Intent

A portfolio that proves, rather than claims, that Vedant builds real AI end to end, and lets visitors meet the person behind it: captain, people-reader, curious mind, psychology of designed environments.

Career aim (APPROVED): a client-facing, end-to-end AI engineer (Forward Deployed / AI Solutions Engineer): understand a client's need, fit it to their business, build beyond what they imagined, integrity and security non-negotiable, takes on "impossible" tasks and delivers.

The site must hold a sense of awe from first frame to last, escalating as the visitor goes deeper, while remaining easy to access and fast to scan.

## 2. Audiences

1. **Recruiters** (internships, AI/ML Engineer, Data Scientist, AI Engineer roles). Often on phones, often short on time. Need facts fast.
2. **Technical engineers / hiring managers.** Want depth: architecture, decisions, trade-offs, code.
3. **Future clients** (small businesses with a problem). Want to see that he understands needs and delivers. Inquiry channel comes after launch.

## 3. Goals, non-goals, anti-goals

Goals
- Show working, end-to-end AI systems with honest status.
- Show how he thinks: research, options, constraints, decisions.
- Portray personality, hobbies and values without becoming a scrapbook.
- Grow continuously: new posts, projects, certificates appear without touching 3D code.
- Be secure, valid, accessible and fast despite heavy 3D.

Non-goals (v1)
- A general CMS or multi-author blog.
- Comments, likes, accounts for visitors.
- Analytics beyond privacy-friendly aggregate counts.

Anti-goals (failure even if it works)
- Decorative "AI" clichés (particle globes, neural-net blobs) with no meaning.
- 3D that blocks a recruiter from reaching facts.
- The AI assistant stating anything about Vedant not backed by published content.
- "Coming soon" filler presented as real work.
- A leaked key, a surprise AI bill, or an admin page that can be broken into.

## 4. The experience

### 4.1 Two worlds (APPROVED)

**One Night in Melbourne** — his life and builds. A continuous real-time 3D journey from dusk to dawn, scroll-driven, with a clock as navigation (drag to jump to any hour).

| Hour | Scene | What it says |
|---|---|---|
| 18:00 | Floodlit football pitch, captain's armband | Leads teams, organises tournaments; multi-sport athlete |
| 21:00 | The bar counter, amber light | Reads people, service; home of **The Order** |
| 01:00 | The desk; code lifts into glowing 3D architecture | Builds real systems; each project has a door "enter the mind" |
| 05:00 | Coffee, solo walk in misty nature, a wolf alongside | Curiosity, calm, nature, values |
| Dawn | Horizon of builds: Live / Building / Planned | Trajectory and roadmap; then **The Reveal** |

**Perspective arc (APPROVED):** the experience opens third-person in a world where the visitor sees Vedant (realistic likeness); the camera then moves into first-person (the visitor sees through his eyes); at the projects (01:00) it enters the Mind Palace, then continues to the rest of the night. PROPOSED bookend: at dawn the camera pulls back out to third-person, Vedant with coffee watching the sunrise, before The Reveal. This reduces captures to the opening and closing poses (plus any the bar needs, see §13).

Animal values (wolf = pack, tiger = intensity, lion = pride, elephant = humble strength) appear as texture at fitting moments, not as a section. The bar is shown as craft and hospitality (APPROVED: bar imagery stays in).

**The Mind Palace** — how he thinks. An explorable world drawn in ink. Domains are wings (initially: AI agents, Finance, Geospatial, Psychology, Business cases). Every post becomes a node on a branch.

Node types (PROPOSED):
- **Spark** — 100–300 words, one observation (e.g. why jewellery stores use yellow light). Small glow.
- **Deep dive** — long essay. Large glow.
- **Trail** — a project's thinking: question → research → options → constraint → decision. Linked to its project.
- **Learning** — something he is currently learning or certified in.

### 4.2 Signature transition (APPROVED direction)

Ink = idea, amber light = real. A project starts as an ink sketch in the Palace; entering it, the lines fill with light and material and become the real, lit object in One Night. One persistent 3D canvas makes this a single unbroken camera move.

### 4.3 The Order (APPROVED, part of launch)

At 21:00 the visitor orders in plain words ("an engineer who can ship secure AI agents"). The AI bartender mixes it: skills pour as liquid layers, each layer citing the project or post that proves it. The receipt is a tailored one-page résumé (downloadable). Later: "send this order to Vedant" as an inquiry (post-launch, APPROVED).

### 4.4 The Reveal (APPROVED, part of launch)

Final beat at dawn: "You've been here N minutes. Here's how I kept you." Replays the site's own attention techniques (lighting, pacing, curiosity gaps) with short annotations. Computed client-side only; nothing about the visitor is stored.

### 4.5 Fast path (PROPOSED, launch)

A persistent "Skip to the facts" control opens a plain, fast, indexable page: summary, projects with status, skills, education, experience (roles, not employer timeline unless owner decides otherwise), contact, CV download. Every Palace node and project is also a normal readable page.

## 5. Visual direction (APPROVED: A + C, realistic)

- **Amber Noir** for One Night: near-black spaces lit by warm jewellery-store amber; light falls where attention should go. Realistic materials (glass, wood, brass), haze, reflections.
- **Ink & Glow** for the Mind Palace: hand-drawn line work on dark paper; only important things glow.
- Typography (PROPOSED): elegant serif for display, clean sans for body, monospace for labels and code.
- Realism source (APPROVED): **real-time 3D in the browser**. Photoreal ingredients from CC0 libraries (Poly Haven HDRIs, materials, models — catalogue to be verified), baked lighting, post-processing (bloom, depth of field, film grain) on capable devices.
- Agentic AI assists with scene code, shaders and asset preparation. Higgsfield connector can browse/import only; generation happens in Higgsfield's app if used.

## 6. Approaches considered (for how it is built)

| | Approach | Trade-off | Decision |
|---|---|---|---|
| A | Next.js (App Router) + React Three Fiber, Vercel | One persistent canvas enables the signature transition; server routes host The Order, admin, inquiries; owner knows Next.js. More JS, offset by code-splitting and quality tiers | **Chosen** (Claude's pick; owner did not object) |
| B | Astro + 3D islands | Best plain-page performance; persistent 3D across navigation fights the framework | Rejected |
| C | Plain three.js + separate backend | Full control; hand-built routing, SEO, content, two deployables | Rejected |

## 7. Architecture (PROPOSED)

> **Superseded in part by [the tech stack decision](../../architecture/2026-11-24-tech-stack.md) (2026-11-24):** hosting moves from Vercel to Cloudflare (static Next.js export + one Worker); The Order uses Workers AI; CSP uses hashes instead of nonces. Where this section and that document differ, that document wins.

- **Frontend:** Next.js App Router, TypeScript, React Three Fiber + drei + postprocessing, a single persistent `<Canvas>` in the root layout. Motion library for UI transitions. GSAP or scroll-driven camera paths for One Night (builder's choice).
- **Content:** files in the repo (MDX/Markdown + images) with frontmatter validated by a schema at build time. Invalid content fails the build. Content types: post (spark/deep-dive/trail/learning), project, certificate, roadmap item, profile.
- **Palace graph:** generated at build time from content frontmatter (domain, type, links) into a static JSON the Palace renders.
- **Publishing (APPROVED):** GitHub is the single source of truth. Path 1 (launch): owner approves a commit/PR (phone app works); CI validates; Vercel deploys. Path 2 (post-launch): admin page writes the same commits through the GitHub API.
- **Assets:** glTF with Draco/Meshopt, KTX2 textures, lazy-loaded per hour; preload the next hour only.
- **Cost (APPROVED): $0.** Free plans only, no card on file. Any paid service needs owner approval first.
- **Deployment (APPROVED):** public deploy once the website is done. PROPOSED: free, private preview deploys of each change before then, for testing on real devices; not public.
- **Hosting:** Vercel Hobby (free). Hobby terms are non-commercial: before paid-client inquiries go live, re-check terms and move to a free host that allows commercial use if needed (candidates to verify: Cloudflare, Netlify). Build stays host-agnostic (no Vercel-only features in core paths).
- **Domain:** no paid domain under $0. Free options: the host's subdomain, or a free developer subdomain (to verify). Owner may approve a paid domain later.

## 8. The Order — AI design (PROPOSED)

- **Grounding:** retrieval over the site's own published content only (posts, projects, profile). The answer must cite node IDs; claims without a citation are dropped server-side before rendering. If nothing supports an order, it says so honestly.
- **Structure:** model returns structured JSON (skills → evidence IDs → one-line rationale) validated by schema; the UI renders the pour from that JSON, never from free text.
- **Index:** small; embeddings built at deploy time and shipped as a static file, or keyword+embedding hybrid. No external vector DB.
- **Safety:** server-side route only; API key never in the browser; per-IP rate limit; input length cap; prompt-injection resistance (content is data, system prompt fixed); refuses off-topic requests; hard monthly spend cap at the provider plus an app-level kill switch that falls back to a static "house menu".
- **Privacy:** orders not stored at launch. If logging is added for quality review, it is opt-in, anonymised and stated on the page.
- **Model/provider (APPROVED: $0):** a free-tier provider only, with no card attached, so overspending is impossible. When the free quota or rate limit is hit, The Order falls back to the static "house menu" with a short honest note. Specific provider (e.g. Groq, as in Personal Finance AI) left to the builder after checking current free-tier terms, including data retention.
- **Showcase value:** The Order is itself documented as a project trail (grounding, citation enforcement, cost control, evals). A small eval set (expected citations for sample orders) runs in CI.

## 9. Security (non-negotiable)

- Security headers: strict CSP (nonces), HSTS, frame-ancestors none, referrer policy, permissions policy.
- No secrets in the client bundle; secrets only in Vercel env vars; dependency audit and secret scanning in CI.
- Admin (post-launch): identity handled by GitHub sign-in restricted to the owner's account or an identity gate in front of `/admin`; owner's GitHub account protected by passkey/2FA; admin token scoped to content paths only; route unlisted and `noindex` (tidiness, not protection).
- Inquiries (post-launch): spam protection, minimal personal data, retention period stated, privacy notice.
- Public content review: project trails derived from private repos are reviewed for secrets and private details before publishing.

## 10. Performance, accessibility, SEO — launch quality bar (PROPOSED)

The site goes public only when all of these pass:
- Fast path and content pages: Lighthouse ≥ 95 performance, accessibility, best practices, SEO (mobile).
- 3D: first meaningful frame < 3 s on a mid-range phone over 4G; ≥ 50 fps on an M-series MacBook; ≥ 30 fps on a mid-range Android, via quality tiers.
- Quality tiers: high (full post-processing), medium (reduced effects), still (pre-rendered frame) for weak GPUs, no WebGL, or `prefers-reduced-motion`.
- WCAG 2.2 AA for all text content; full keyboard navigation of the clock, Palace and The Order; every 3D interaction has a text equivalent.
- SEO: server-rendered content pages, sitemap, Open Graph images per node, structured data (Person, Article).
- Zero console errors; CI green (lint, types, tests, content validation, evals, audit).

## 11. Roadmap (PROPOSED order; dated by quality, not calendar)

1. Foundation: repo, CI, content schema, private preview deploy, security headers, fast path.
2. One Night: persistent canvas, clock navigation, all five hours in full 3D, quality tiers.
3. Mind Palace: ink world, graph from content, node pages, ink-to-real transition.
4. The Order: grounded retrieval, structured output, safety, cost cap, evals.
5. The Reveal.
6. Quality-bar pass → **public launch**.
7. Post-launch: admin page; client inquiries (The Order → send); hosting plan change if needed; weekly content and scene upgrades.

## 12. Content at launch

- 3–4 posts from the owner (APPROVED cadence after launch: every 1–3 days).
- 2–3 project trails derived from Personal Finance AI and expense-track-agent docs, after privacy review.
- Project nodes with honest status: Personal Finance AI (Building — M6 dashboard in progress per README), expense-track-agent (Building — Phase 2 complete per PROGRESS), GeoUrban AI (status OPEN), ORION (Planned / research direction).
- Learning and certificate nodes as supplied.

## 13. Open questions for the owner

From the builder check (most important first):

1. ~~Does Vedant appear in the 3D world?~~ → answered (APPROVED): **realistic likeness**. PROPOSED method: one real 3D capture per hour (phone photogrammetry or Gaussian-splat capture via a free app, to verify), shown as frozen "moments" the camera, light and haze move around; no facial or body animation (avoids the uncanny). Poses: 18:00 pitch with captain's armband, 21:00 behind the counter, 01:00 at the desk, 05:00 with coffee. Privacy (PROPOSED): serve web-resolution only, lighting baked in, originals stored privately and never committed or deployed; owner accepts residual deepfake risk.
2. ~~The Order's model provider and monthly spend cap~~ → answered: $0, free tier only (§8).
3. ~~GeoUrban AI status~~ → answered (APPROVED): **Building**, with a trail in the Palace. Trail content (problem, data, approach, decisions) still to be supplied by the owner.
6. ~~Perspective at The Order~~ → answered (APPROVED): **swap sides**. At 21:00 the camera leaves Vedant's eyes and seats the visitor across the counter as the guest; Vedant (likeness, frozen pose) serves. First-person resumes after The Order. Captures needed: 18:00 pitch, 21:00 behind the counter, dawn with coffee (3 poses).
4. ~~Public code~~ → answered (APPROVED): **one finance repo made public + a public extracts repo** (chosen modules with tests). Which finance repo goes public: OPEN. Before publishing: secret scan of the full git history; if anything is found, rotate it and publish a fresh repo with clean history rather than rewriting the old one. PROPOSED: the portfolio repo itself is public too (security relies on authentication, not secrecy).
5. ~~Site name~~ → answered (APPROVED): **PSYCH**, the owner's gaming name: anticipating and doing what the other person cannot think of. PROPOSED: page titles read "PSYCH — Vedant Kale" so name searches still find the site; The Reveal's last line pays the name off ("Psych."), turning the attention-design reveal into the brand's signature.

Calls made by Claude during the builder check (PROPOSED, owner may override):
- Analytics: privacy-friendly aggregate only (no cookies, no personal data); exact tool left to the builder.
- CV: a PDF maintained in the repo, also rendered from the same profile content on the fast path.
- The 18:00 pitch is a generic floodlit pitch, not a specific real club ground (avoids branding and permissions).
- Experience section lists roles (e.g. hospitality, events, customer service) without an employer-by-date timeline until the owner decides.

## 14. Left to the builder

Exact libraries for scroll/camera choreography, shader techniques for ink and liquid, asset pipeline tooling, test framework choice, file layout.
