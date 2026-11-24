# PSYCH — Technology

Every technology used, why, and what was rejected. Status: PROPOSED (owner asked Claude to decide). Evidence in [Research](Research.md).

## 1. Hosting and cost

**Cloudflare free plan, $0, no card.** Workers with static assets + one Worker for the API + Workers AI + D1.

Why Cloudflare: no non-commercial clause (needed once client inquiries start); static asset requests free and unlimited; nothing sleeps; free AI with a hard daily stop (a bill is impossible); free database; Turnstile and analytics included.

Key free limits that shape the build:
| Limit | Value | Consequence |
|---|---|---|
| Static file size | 25 MiB each; 20,000 files | CI fails files > 20 MiB; split or R2 |
| Worker requests | 100,000/day | Only `/api/*` runs Worker code |
| Worker CPU | 10 ms per request | Indexing and heavy work at build time |
| Workers AI | 10,000 Neurons/day, resets 00:00 UTC (~10–11am Melbourne) | Daily cap in code + house menu |
| D1 | 5M rows read/day, 100k written/day, 5 GB | Plenty |
| Firewall rate-limit rules | 1 | Per-IP counters in D1 |
| Email Routing | Needs a domain on Cloudflare DNS | Inquiries stored in D1 until the domain is claimed |

## 2. Stack

| Area | Choice | Version policy |
|---|---|---|
| Runtime | Node.js 24 LTS | `.nvmrc` |
| Framework | Next.js App Router, `output: 'export'`, TypeScript strict | Next 16.x, pinned |
| UI | React 19, Tailwind CSS v4, Motion | pinned minor |
| 3D | three.js, React Three Fiber, drei; WebGL renderer | pin three.js exactly |
| Post-processing | pmndrs `postprocessing` | pinned |
| Gaussian splats | Spark (`@sparkjsdev/spark`), MIT, WebGL2 | pinned |
| Scroll / camera | GSAP (ScrollTrigger, Observer), Lenis, drei `CameraControls` | pinned |
| Palace layout | `d3-force-3d` at build time (seeded) | pinned |
| Content | MDX + Zod via Content Collections | pinned |
| Search for The Order | MiniSearch (BM25) | pinned |
| API | Cloudflare Worker, Hono, Zod | pinned |
| AI | Workers AI, JSON mode; model chosen by evals; Groq free as backup only if needed | config value |
| Database | Cloudflare D1 + SQL migrations | — |
| Bot check | Cloudflare Turnstile | — |
| Analytics | Cloudflare Web Analytics (cookieless) | — |
| Tests | Vitest (unit), Playwright + `@axe-core/playwright` (e2e, a11y), Lighthouse CI | pinned |
| CI/CD | GitHub Actions (public repo, free), Wrangler deploy | — |
| Security tooling | gitleaks, `npm audit`, Dependabot | — |
| 3D pipeline | Blender → gltf-transform (Draco/Meshopt, KTX2; **WebP for ink**) | — |
| Likeness | Classic Scaniverse (iOS, free) → SuperSplat (crop, grade, decimate) → SOG | — |

## 3. Rejected, and why

| Rejected | Why |
|---|---|
| Vercel Hobby | Personal/non-commercial only |
| Netlify Free | ~15 GB/month bandwidth ≈ 150 heavy visits |
| GitHub Pages, Azure SWA Free | Personal / non-business framing; no backend (Pages) |
| Render, Supabase free | Sleep / pause / expiry |
| Deno Deploy | Shutting down ~April 2027 |
| OpenNext server runtime on Workers | 10 ms CPU, script size; pages don't need a server |
| Gemini free tier | Trains on prompts; bars EEA/UK users |
| GitHub Models | Retired 2026-07-30 |
| Contentlayer | Abandoned |
| Vector database | Corpus too small; BM25 static index is enough |
| Hosted CMS, Sveltia token mode | Lock-in; token in browser |
| WebGPU-only code, Theatre.js | iOS risk; not needed |
| RMIT infrastructure, licences, Val | RMIT IT Acceptable Use Standard bans commercial use; Val has no API |

## 4. Student resources to use

| Resource | Use | When |
|---|---|---|
| GitHub Student Developer Pack | Free first-year domain (.me / .tech / Name.com); Copilot Student; JetBrains | Domain at inquiry launch |
| RMIT email | Verify student offers only; never the login for hosting, domain or API accounts | Now |
