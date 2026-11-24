# Digital Gardens / Knowledge-Graph Sites and Content Backends for a Git-Based, $0 Next.js Site (as of 2026-11-24)

Method note: Maintenance data comes from the GitHub REST API (`gh api repos/...`) and `npm view`, both run on 2026-11-24. Pricing comes from official pricing pages fetched the same day. Items marked **[unverified]** come from background knowledge and were not confirmed in this session.

## Which digital gardens are most admired and how do they structure ideas, maturity and links?

### Takeaway
The reference gardens are Maggie Appleton (Astro + MDX, growth stages, build-time link JSON), Andy Matuschak (evergreen notes, closed-source), Gwern (status/confidence/importance metadata, popups, offline backlinks) and Quartz-based gardens (open-source Obsidian-vault publishing, d3 + PixiJS graph). Obsidian Publish has a graph view but costs money. None of the major gardens renders its graph in 3D. 3D note graphs appear only in small personal sites and Obsidian plugins, nearly all built on vasturiano's `3d-force-graph` / `react-force-graph-3d`.

### Cited Findings

**Ethos and patterns (source essay)**
- Maggie Appleton's "A Brief History & Ethos of the Digital Garden" lists 6 patterns: Topography over Timelines, Continuous Growth, Imperfection & Learning in Public, Playful/Personal/Experimental, Intercropping & Content Diversity, and Independent Ownership. — [maggieappleton.com/garden-history](https://maggieappleton.com/garden-history)
- Growth stages in the same essay: Seedling ("very rough, early-stage ideas"), Budding ("cleaned up and clarified"), Evergreen ("reasonably complete", still tended). The page shows only relative dates ("Planted over 6 years ago", "Last tended over 5 years ago"). — [maggieappleton.com/garden-history](https://maggieappleton.com/garden-history)

**1. Maggie Appleton's garden — maggieappleton.com (creator: Maggie Appleton)**
- The repo describes itself as "My digital garden built with Astro and MDX". The language is Astro and the repo was last pushed 2026-11-09. The repo has no license file: the API returns an empty license, so it is source-visible, not formally open source. — [GitHub API: MaggieAppleton/maggieappleton.com-V3](https://github.com/MaggieAppleton/maggieappleton.com-V3)
- Dependencies include `astro` 7.4.2, `d3-*` modules (array, axis, scale, selection, shape) and `three` 0.180.0. — [package.json](https://github.com/MaggieAppleton/maggieappleton.com-V3/blob/main/package.json)
- Maturity is a frontmatter field validated with Zod in `src/content.config.ts`: `growthStage: z.string().default("evergreen")`. — [content.config.ts](https://github.com/MaggieAppleton/maggieappleton.com-V3/blob/main/src/content.config.ts)
- Links are built at build time. There is a `remark-wiki-link.js` plugin (wiki-style `[[links]]`), and scripts `generate-links.js`, `post-links.js` and `generate-topics.ts` produce `src/links.json` and `src/internal-link-previews.json`. These drive backlinks and hover previews. — [src/scripts](https://github.com/MaggieAppleton/maggieappleton.com-V3/tree/main/src/scripts), [src/plugins](https://github.com/MaggieAppleton/maggieappleton.com-V3/tree/main/src/plugins)

**2. Andy Matuschak's working notes — notes.andymatuschak.org (creator: Andy Matuschak)**
- The notes are a personal thinking environment tied to his "Evergreen notes" practice. There is deliberately no index: readers enter via a link. The author states: "no, I haven't made this system available for others to use" (closed source). — [About these notes](https://notes.andymatuschak.org/About_these_notes)
- His older open-source backlink tool `note-link-janitor` (MIT, 858 stars) was last pushed 2021-05-07, so it is inactive. — [GitHub API: andymatuschak/note-link-janitor](https://github.com/andymatuschak/note-link-janitor)
- **[unverified]** UI signature: horizontally stacked sliding panes, with a backlinks list at the bottom of each note. There is no graph visualization.

**3. Gwern.net (creator: Gwern Branwen)**
- Static site compiled with Hakyll (Haskell) from Pandoc Markdown, via `hakyll.hs` and `sync.sh`. — [gwern.net/design](https://gwern.net/design)
- Features: hover popups (`popups.js`), sidenotes (`sidenotes.js`, MIT), backlinks and link bibliographies. Backlinks come from an offline nightly cron job, "since Hakyll is not well suited to computing them at compile time". "Similar links" use k-nearest-neighbors on neural embeddings of annotations. — [gwern.net/design](https://gwern.net/design)
- Maturity metadata in front matter: `status` (notes → draft → in progress → finished), `confidence` (Kesselman verbal probabilities, e.g. "highly likely"), `importance` (0–10). — [gwern.net/about](https://gwern.net/about)
- Content license is CC-0. Code is at github.com/gwern/gwern.net with mixed per-component licenses (CC-0 scripts, MIT popups/sidenotes, GPL image-focus). — [gwern.net/about](https://gwern.net/about), [gwern.net/design](https://gwern.net/design)
- No graph view.

**4. Quartz-based gardens (creator of Quartz: jackyzha0 / Jacky Zhao)**
- `jackyzha0/quartz`: MIT, 13,619 stars, latest release v5.2.2 on 2026-11-22, actively maintained. — [GitHub API: jackyzha0/quartz](https://github.com/jackyzha0/quartz)
- In v5 the Graph View became a community plugin (`@quartz-community/graph`, installed via `npx quartz plugin add @quartz-community/graph`). It shows a local graph (1 hop) and a global graph. Node radius scales with in+out link count, visited nodes get a different color, and tags can appear as nodes. — [docs/features/graph view.md](https://github.com/jackyzha0/quartz/blob/v5/docs/features/graph%20view.md)
- Graph config options: `depth`, `repelForce`, `centerForce`, `linkDistance`, `showTags`, `enableRadial`, `focusOnHover`. These are d3-force parameters. — [docs/plugins/Graph.md](https://github.com/jackyzha0/quartz/blob/v5/docs/plugins/Graph.md)
- The `quartz-community/graph` package (v1.0.3, pushed 2026-11-09) lists `d3` and `pixi` in its package metadata. Rendering is d3-force layout drawn with PixiJS (WebGL 2D). — [quartz-community/graph package.json](https://github.com/quartz-community/graph/blob/main/package.json)
- The graph data comes from Quartz's link-crawling plugin (`CrawlLinks`, `quartz/plugins/builtins/links.ts`) at build time. **[unverified]** It is emitted as `static/contentIndex.json`. — [Quartz repo tree](https://github.com/jackyzha0/quartz/tree/v5)
- Supports wikilinks and backlinks as built-in features. — [docs/features](https://github.com/jackyzha0/quartz/tree/v5/docs/features)

**5. Obsidian Publish sites (vendor: Obsidian)**
- Costs $8/site/month billed annually, or $10 monthly. The feature list includes "Graph and full text search". Not $0 and not git-based. — [obsidian.md/pricing](https://obsidian.md/pricing)

**6. Tom Critchlow — tomcritchlow.com (creator: Tom Critchlow)**
- Repo `tomcritchlow/tomcritchlow.github.io` was last pushed 2026-08-19 and has no license file. — [GitHub API](https://github.com/tomcritchlow/tomcritchlow.github.io)
- **[unverified]** Jekyll on GitHub Pages, with a "wiki"/garden section of evolving notes. Known for writing on "blogchains" and the digital-gardening community. No graph visualization.

**3D / spatial graph examples (smaller, less admired, but relevant to an "immersive" goal)**
- Scribbling Seeker garden: its homepage is a 3D view where each post is a star ("The Stellar Digital Garden"). — [scribbling-pen.pages.dev/garden/the-stellar-digital-garden](https://scribbling-pen.pages.dev/garden/the-stellar-digital-garden/)
- Tutorial: an Obsidian-style blog with a 3D graph built from Astro 5 + `3d-force-graph` + `three`. — [scribbling-pen.pages.dev/blog/obsidian-style-blog-with-3d-graph](https://scribbling-pen.pages.dev/blog/obsidian-style-blog-with-3d-graph/)
- overby.me homepage uses `react-force-graph-3d` to map profiles, platforms and life categories. — [tangled.org/@overby.me](https://tangled.org/@overby.me/overby.me/tree/main/homepage)
- `treehouze` (WikiBonsai) switches one graph between 2D, 3D, VR and AR using vasturiano's force-graph libraries. It is very early (v0.0.x). — [treehouze README](https://unpkg.com/treehouze@0.0.2/README.md)
- Obsidian plugins: Agentage Galaxy (three.js + 3d-force-graph), CosmoGraph 3D (spherical layout) and 3D Semantic Graph (positions by embedding similarity). — [community.obsidian.md/plugins/agentage-galaxy](https://community.obsidian.md/plugins/agentage-galaxy), [3d-semantic-graph](https://community.obsidian.md/plugins/3d-semantic-graph)
- D'Arcy Norman, "Experimental Obsidian 3D Graph Renderer" (2026-04-10). — [darcynorman.net](https://darcynorman.net/2026/04/10/experimental-obsidian-3d-graph-renderer/)

**Graph-rendering libraries (maintenance, GitHub API, 2026-11-24)**
- `vasturiano/3d-force-graph`: MIT, 6,591 stars, pushed 2026-11-05, npm v1.80.2. Uses three.js + d3-force-3d. — [GitHub](https://github.com/vasturiano/3d-force-graph)
- `vasturiano/react-force-graph`: MIT, 3,374 stars, pushed 2026-09-29. `react-force-graph-3d` is at npm v1.29.2. — [GitHub](https://github.com/vasturiano/react-force-graph)
- `jacomyal/sigma.js`: MIT, 12,247 stars, `sigma@4.0.6` released 2026-11-10. WebGL 2D. — [GitHub](https://github.com/jacomyal/sigma.js)
- Cosmograph's engine: `cosmograph-org/cosmos` now redirects to `cosmosgl/graph`. MIT, v3.6.0 released 2026-11-04. GPU force layout for very large graphs. — [GitHub](https://github.com/cosmosgl/graph)

### Inferences
- Common structure: (a) frontmatter maturity field (Maggie `growthStage`, Gwern `status`/`confidence`/`importance`); (b) wiki-links parsed at build time into a JSON link index; (c) backlinks derived from that index. A graph view is optional: Quartz and Obsidian Publish have one, while Maggie, Andy and Gwern do not.
- For a Next.js site, the same pattern ports directly: a Zod `stage: z.enum(["seedling","budding","evergreen"])` field, a remark wiki-link plugin, and a build step that emits `graph.json` (nodes = notes/projects/certificates, edges = links/tags). `react-force-graph-3d` can then render it client-side. It is the best-maintained 3D option and fits a three.js / R3F site.
- No highly admired garden has a 3D graph yet. A well-done 3D explorable graph would be distinctive. The admired gardens win on writing quality and link affordances (popups, backlinks), not on visualization.

### Gaps
- No primary source found for Andy Matuschak's stack (stacked panes, which editor) or Tom Critchlow's site generator.
- Whether Quartz v5 still emits `contentIndex.json` under that name was not confirmed.
- No primary-source "most admired" ranking exists. The selection rests on the canonical status of Maggie's essay and on star counts.

## Which content backend is the most maintained, secure and type-safe choice for Next.js in 2026?

### Takeaway
For a Next.js App Router site with GitHub as the source of truth, the best-maintained and most type-safe options are **Content Collections** and **Fumadocs MDX** (both released within weeks of this check), plus a hand-rolled **MDX + Zod** loader. Velite works but releases slowly. Original Contentlayer is dead. Its fork Contentlayer2 has had no release since May 2025.

### Cited Findings
Maintenance (GitHub API / npm, checked 2026-11-24):

| Tool | Last push | Latest release | Stars / license | Status |
|---|---|---|---|---|
| Contentlayer (`contentlayerdev/contentlayer`) | 2024-11-07 | v0.3.4, 2023-06-29 | 3,533 / MIT | Abandoned (no release in 3+ years) |
| Contentlayer2 fork (`timlrx/contentlayer2`) | 2025-05-03 | v0.5.8, 2025-05-03 | 425 / MIT | Stale (~19 months without a release) |
| Content Collections (`sdorra/content-collections`) | 2026-11-20 | `@content-collections/core` 0.15.3 (npm modified 2026-09-21) | 1,205 / MIT | Active |
| Velite (`zce/velite`) | 2026-11-20 | v0.4.0, 2026-06-17 | 826 / MIT | Maintained, slow releases |
| Fumadocs (`fuma-nama/fumadocs`) | 2026-11-22 | fumadocs@16.19.7, 2026-11-22; `fumadocs-mdx` 15.6.4 (2026-11-19) | 13,697 / MIT | Very active |

Sources: [contentlayer](https://github.com/contentlayerdev/contentlayer), [contentlayer2](https://github.com/timlrx/contentlayer2), [content-collections](https://github.com/sdorra/content-collections), [velite](https://github.com/zce/velite), [fumadocs](https://github.com/fuma-nama/fumadocs). npm data from `npm view` on the same day.

- Maggie Appleton's production garden validates frontmatter with Zod schemas in Astro content collections. This is real-world precedent for Zod schemas over MDX. — [content.config.ts](https://github.com/MaggieAppleton/maggieappleton.com-V3/blob/main/src/content.config.ts)

### Inferences
- All of Content Collections, Velite and Fumadocs MDX validate frontmatter against a schema at build time (Content Collections and Fumadocs use Standard Schema/Zod, Velite uses its own Zod-based `s`). A bad frontmatter field fails `next build`. **[unverified in this session: exact schema APIs; confirm in each project's docs]**
- Recommendation: **Content Collections** for blog/projects/certificates as typed collections. Use **Fumadocs MDX** only if docs-style features are wanted. The zero-dependency alternative is plain MDX + Zod: read files with `fs`, `gray-matter`, `schema.parse()` in a build script that also emits `graph.json`. It has the least lock-in and the smallest surface.
- Avoid Contentlayer and Contentlayer2 for new projects.

### Gaps
- I did not fetch each library's docs page for its App Router integration details (e.g. `withContentCollections` Next plugin, Turbopack compatibility). These need confirmation before adoption.

## Which git-based CMS supports single-user GitHub auth at $0 with no vendor lock-in?

### Takeaway
**Keystatic (GitHub mode)** and **Sveltia CMS** both fit: free, MIT, commit directly to GitHub, and actively maintained. Neither has a per-user allowlist. In each, "one user" means only that account has write/push access to the repo. For the planned custom admin page, a small Next.js route that commits through the GitHub API (Octokit) behind Auth.js GitHub OAuth with an explicit user-ID allowlist is the most controllable option. It also makes a CMS optional. TinaCMS self-hosted needs a database. Decap needs Netlify or a paid/hosted auth proxy. Outstatic is viable but lower-activity and has a non-standard license.

### Cited Findings

**Keystatic** (`Thinkmill/keystatic`, MIT, 2,525 stars, pushed 2026-11-17; `@keystatic/core` 0.6.10 published 2026-11-17; `@keystatic/next` 5.0.5) — [GitHub API](https://github.com/Thinkmill/keystatic)
- In GitHub mode, `/keystatic` prompts a GitHub login. First run creates a custom GitHub App and writes `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` and `KEYSTATIC_SECRET` to `.env`. — [keystatic.com/docs/github-mode](https://keystatic.com/docs/github-mode)
- Anyone with "write access" to the repo can log in. No per-user allowlist is documented, and Keystatic Cloud is not required for GitHub mode. — [keystatic.com/docs/github-mode](https://keystatic.com/docs/github-mode)
- Still pre-1.0 (0.6.x).

**Sveltia CMS** (`sveltia/sveltia-cms`, MIT, 3,107 stars, v0.271.1 released 2026-11-23) — [GitHub API](https://github.com/sveltia/sveltia-cms)
- Billed as a complete rewrite and successor to Netlify/Decap CMS with "high compatibility" and migration guides. Described as "feature complete". Framework-agnostic single-page app served from a CDN. — [github.com/sveltia/sveltia-cms](https://github.com/sveltia/sveltia-cms)
- GitHub auth options: Personal Access Token sign-in (token stored in browser localStorage); its own OAuth client "Sveltia CMS Authenticator", deployable on Cloudflare Workers (free tier) using a GitHub App; or Netlify as the default. PKCE is "Unimplemented". — [sveltiacms.app/en/docs/backends/github](https://sveltiacms.app/en/docs/backends/github)
- Access is by repo role: "Users with read-only access can't sign in". There is no per-user allowlist. — [sveltiacms.app/en/docs/backends/github](https://sveltiacms.app/en/docs/backends/github)
- Still pre-1.0 (0.271.x).

**Decap CMS** (`decaporg/decap-cms`, MIT, 19,499 stars, decap-cms@3.18.0 released 2026-11-18, active) — [GitHub API](https://github.com/decaporg/decap-cms)
- "GitHub requires a server for authentication". Decap relies on Netlify for basic GitHub auth, or on "Decap Turbo", a hosted GitHub auth plus request proxy. All users need push access. — [decapcms.org/docs/github-backend](https://decapcms.org/docs/github-backend/)
- Decap Turbo's pricing was not checked.

**TinaCMS** (`tinacms/tinacms`, Apache-2.0, 13,888 stars, tinacms@3.15.2 released 2026-11-09, very active) — [GitHub API](https://github.com/tinacms/tinacms)
- Tina Cloud Free: "$0 Forever", 2 users, 3 roles, unlimited projects, 100 GB bandwidth/month. Team plan is "$24/project/month". The page's cards and comparison table disagree ($29/month), so the price is inconsistent on the official page. — [tina.io/pricing](https://tina.io/pricing)
- Self-hosted needs three modules: an Auth Provider (default Auth.js with a user collection in your DB), a Database Adapter (MongoDB or Postgres given as examples) and a Git Provider. "Some features are not available when self-hosting." — [tina.io/docs/self-hosted/overview](https://tina.io/docs/self-hosted/overview)
- Tina Cloud is a vendor dependency, and self-hosting adds a database. Both work against the "git is the only backend" goal.

**Outstatic** (`avitorio/outstatic`, 3,166 stars, v2.2.4 released 2026-08-20, last push 2026-08-27; the GitHub API reports license "NOASSERTION") — [GitHub API](https://github.com/avitorio/outstatic)
- README: "No database. No hosted CMS backend." GitHub handles "content storage and auth". It installs inside your own Next.js app, with a free hosted option and GitHub Sponsors funding. — [github.com/avitorio/outstatic](https://github.com/avitorio/outstatic)
- Works with `.md`/`.mdx`. — [outstatic.com/docs/getting-started](https://outstatic.com/docs/getting-started)

**Admin page via the GitHub API (planned later)**
- No external source was fetched. See Inferences.

### Inferences
- Security model for all git-based CMSs: the GitHub permission system is the authorization layer, so the "single user" control is the repo collaborator list. Keep the repo with one collaborator. Use fine-grained tokens or GitHub Apps scoped to that one repo with Contents read/write only.
- Sveltia PAT mode stores the token in localStorage, so it is exposed to any XSS on the admin origin. Prefer the Cloudflare Worker OAuth (GitHub App) path, or serve the admin from a separate path with a strict CSP.
- For the custom admin page: Auth.js GitHub provider, then a check of `profile.id === ALLOWED_GITHUB_ID` in the `signIn` callback (allowlist by numeric ID, not login name). Server actions then commit via Octokit (`PUT /repos/{owner}/{repo}/contents/{path}`) with a server-held fine-grained token. Run the same Zod schema before committing, so the admin cannot write content that would fail the build. This makes Keystatic/Sveltia optional, and the content stays plain MDX either way, so there is no lock-in.
- Ranking for this project: (1) custom admin + Content Collections/Zod; (2) Keystatic (best Next.js integration, typed schema in TS); (3) Sveltia (framework-agnostic, YAML config); then Outstatic, Decap and Tina.

### Gaps
- Keystatic's GitHub-mode docs page does not state cost explicitly. "Free" rests on the MIT license and on Cloud not being required.
- Decap Turbo pricing and launch date were not verified.
- Outstatic's actual license text was not read. NOASSERTION means GitHub could not classify it, so check `LICENSE` before adopting.
- TinaCMS's "Self-hosted Limitations FAQ" was not read.

## Is any database needed for launch, and what is the best free option for post-launch inquiries?

### Takeaway
No database is needed at launch. Blog, projects and certificates are static MDX/JSON in git, validated at build time. Client inquiries are the first true dynamic write. A form plus email (or a commit) covers low volume. If a database is wanted, all four candidates have usable free tiers. Turso and Cloudflare D1 are the most generous and never pause. Supabase pauses after 1 week idle, which is a poor fit for a rarely used inquiry table.

### Cited Findings
- **Neon Free:** 100 projects/org; 100 CU-hours/project/month; autoscaling up to 2 CU; compute suspends after 5 minutes idle (always on, cannot be disabled); storage 1 GB/project and 20 GB/account; 10 branches/project; 5 GB egress/project/month. When limits are hit, compute stays suspended until the next period. — [neon.com/pricing](https://neon.com/pricing)
- **Supabase Free:** 2 active projects; 500 MB DB; 5 GB egress; 50,000 MAU; 1 GB file storage; "Free projects are paused after 1 week of inactivity." — [supabase.com/pricing](https://supabase.com/pricing)
- **Turso Free:** 100 databases; 5 GB storage; 500 million rows read/month; 10 million rows written/month; 3 GB syncs/month; 1-day point-in-time restore. — [turso.tech/pricing](https://turso.tech/pricing)
- **Cloudflare D1 (Workers Free):** 5 million rows read/day; 100,000 rows written/day; 5 GB total storage; 10 databases. Max size per DB is on the limits page and was not fetched. — [developers.cloudflare.com/d1/platform/pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- Outstatic, Keystatic (GitHub mode) and Sveltia need no database. TinaCMS self-hosted does need one. — [Outstatic README](https://github.com/avitorio/outstatic), [Keystatic GitHub mode](https://keystatic.com/docs/github-mode), [Tina self-hosted](https://tina.io/docs/self-hosted/overview)

### Inferences
- Launch: no database. The content graph (`graph.json`) is generated at build time from MDX.
- Post-launch inquiries:
  - If hosting on Vercel, **Neon** (Postgres) or **Turso** (libSQL/SQLite) work over HTTP from serverless functions. Neon's 5-minute scale-to-zero adds cold-start latency but costs nothing.
  - If hosting on Cloudflare, **D1** is the native choice.
  - Supabase's 1-week pause makes it the weakest fit for low-traffic inquiries.
- Add bot protection (honeypot field, rate limit, Turnstile) and server-side Zod validation on the inquiry endpoint, since it is the only public write path.

### Gaps
- D1 per-database maximum size on the free plan was not confirmed (D1 limits page not fetched).
- Whether these free tiers allow commercial use (client inquiries for a business) was not checked in the terms of service.
