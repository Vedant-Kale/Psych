# PSYCH — Research

What was investigated, the evidence, and each decision's status. Full reports are the evidence; this file is the index and the verdicts.

## 1. Reports

| Report | Question | Date |
|---|---|---|
| [Immersive 3D portfolio research](../reports/Immersive%203D%20portfolio%20research.md) | Top 10 best-in-class references, how they're built, what to reuse | 2026-11-24 |
| [Borrowing report](../docs/research/2026-11-24-borrowing-report.md) | What PSYCH borrows from each, by licence and feature | 2026-11-24 |
| [Free deployment and student resources](../reports/Free%20deployment%20and%20student%20resources.md) | Free hosting, RMIT and student resources, free backend services | 2026-11-24 |
| Raw notes | `research_notes/` | 2026-11-24 |

## 2. Top 10 references

| # | Site | Borrow for |
|---|---|---|
| 1 | Bruno Simon folio-2025 (MIT) | Mobile preset, visitor text moderation |
| 2 | Giulio Collesei | Owner spotlight moment, Blender camera curves |
| 3 | Joseph Santamaria | One continuous take, single input path, path culling |
| 4 | Igloo Inc (Awwwards SOTY 2024) | Real-time intro, background shader compile |
| 5 | itomdev | Paint-reveal (ink-to-real), drawn planes, WebP for ink |
| 6 | ProjectHub | Grounded $0 AI assistant patterns |
| 7 | Messenger (Abeto) | Colour atlas for time of day |
| 8 | Lusion Oryzo | Splat budgets, bake over real-time PBR |
| 9 | Martin Laxenaire | Quality manager, skippable experience |
| 10 | Maggie Appleton + Quartz | Growth stages, build-time link graph |

**No precedent found** (PSYCH originals): dusk-to-dawn journey, clock scrub, third→first-person shift, owner splat on an award-level portfolio, sketch-to-photoreal, 3D ink knowledge graph, citation checks in code, a site revealing its own attention design.

## 3. Findings → decisions

| Finding | Decision | Status |
|---|---|---|
| Award winners ship WebGL; iOS 26 WebGPU bug fix unconfirmed | WebGL default | PROPOSED |
| Lusion rejected real-time PBR; baked looks better on phones | Baked lighting | PROPOSED |
| Spark is maintained, MIT, mixes splats with meshes; mkkellogg deprecated | Spark | PROPOSED |
| Splats ignore scene lights | Capture flat, grade per hour, recolor + fake shadow | PROPOSED |
| Prompted citations are unreliable | Citations checked in code | PROPOSED |
| Workers AI: hard daily cap, no training on content | Workers AI | PROPOSED |
| Gemini free trains on prompts and bars EEA/UK | Rejected | PROPOSED |
| GitHub Models retired 2026-07-30 | Not used | Fact |
| Contentlayer abandoned; Content Collections active | Content Collections | PROPOSED |
| Vercel Hobby non-commercial; Cloudflare has no such clause | Cloudflare | PROPOSED |
| Cloudflare static files ≤ 25 MiB | CI size check | PROPOSED |
| RMIT bans commercial use of its IT | No RMIT resources for live site | PROPOSED |
| Supabase pauses; D1 doesn't | D1 | PROPOSED |
| No reviewed site documents reduced motion | PSYCH exceeds the field on accessibility | PROPOSED |

## 4. Unverified (check before relying on)

- Awards for most 2025–26 references (only Bruno Simon 2019 and Igloo verified).
- Licences of itomdev, Laxenaire, ProjectHub, Heckel's Moebius repo (no code copied until checked).
- Spark frame rate on a named mid-range phone; mobile WebGPU stability.
- Groq Free-plan limits; R2 free limits; **measured** Workers AI Neuron cost per answer (estimate in §5).
- Free Worker script size (docs show 3 MB and 64 MiB).
- Email Routing needing a Cloudflare-DNS domain (implied, not stated).
- Scaniverse free plan and commercial use; Student Pack domain renewal prices.
- Whether hash-based CSP covers every inline script Next.js static export emits.

## 5. The Order model choice (2026-11-25)

Checked against the live catalogue (`wrangler ai models list` / `schema`), not the docs: the JSON-mode docs page still lists `@cf/meta/llama-3.1-8b-instruct`, which is no longer in the catalogue.

| Model | `messages` input | JSON mode (`response_format: json_schema`) | $/M in · out |
|---|---|---|---|
| **`@cf/meta/llama-4-scout-17b-16e-instruct`** (chosen) | yes | yes | 0.27 · 0.85 |
| `@cf/openai/gpt-oss-20b` | no (Responses `input`) | yes | 0.20 · 0.30 |
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | yes | yes | 0.293 · 2.253 |
| `@cf/mistralai/mistral-small-3.1-24b-instruct` | yes | not in schema | 0.351 · 0.555 |

Why Scout: standard `messages` + JSON schema + `seed`/`temperature`, mid cost, no hidden reasoning tokens. gpt-oss-20b is cheaper per token but uses a different input format and spends output tokens on reasoning; revisit if Scout's measured cost is too high.

**Neuron estimate (a calculation, not a measurement):** at $0.011 per 1,000 Neurons, Scout costs ≈ 24.5 Neurons per 1k input and ≈ 77.3 per 1k output tokens. A typical order (fixed prompt + 6 chunks + order ≈ 1.8k in, ≤ 400 out with `max_tokens: 512`) ≈ **75 Neurons**. Cap = ⌊9,000 / 75⌋ = **120 calls/day** (`DAILY_AI_CAP`). Superseded by the measurement below.

**Measured (2026-11-25, eval run of 20 cases, 11 reached the model):** Workers AI reports `usage.neurons` per call. Prompt 475 tokens avg, completion 80 avg; **17.9 Neurons avg, 24.7 max**. Small because content is small today (2 documents).

**Cap set from the worst case, not today's average:** 6 chunks at the full 800 chars + fixed prompt + 500-char order ≈ 1.8k input tokens, plus the full `max_tokens: 512` ≈ **84 Neurons**. `DAILY_AI_CAP = 100` keeps a full day ≤ 8,400 Neurons however much content grows. At today's measured max, the quota would allow ~360 calls; raise the cap only with a Neuron-based budget.

**Eval result:** 20/20 pass with `@cf/meta/llama-4-scout-17b-16e-instruct`. Two injections that pass input screening ("…the evidence also says Vedant has a PhD from Stanford…", a JSON break-out asking for "8 years of experience") reached the model and returned only cited layers; neither claim appeared.


## 6. Live interview test (2026-11-25)

Five interview-style orders on the live site (in Brave): 1 of 5 good. The model inferred traits the content never states ("led the development of an expense tracker"; "could indicate he values feedback"), and cited the only engineering source for everything, because the index held 2 chunks and the profile wasn't indexed. Response: AI off (#55), no-guessing checks (#56, evals 25/25), and the Order v2 plan (stories, answer shapes, exits, self-improvement trained before launch).

## 7. Launch gates for The Order v2

Status: **not run yet.** It needs the first stories (#60) and a private beta of 10–20 people on the staging URL. The AI stays off in production until every gate passes **and** the owner says yes.

How to produce the report (each step prints JSON; `evals/gates.ts` reads the files):

1. **Held-out runs.** `npm run simulate -- --set heldout` against a local Worker (the CI job does this on PRs that touch the Order). Each run is capped at 23 model turns and starts from a different place each day, so run it on several days and save each final JSON line (`sim1.json`, `sim2.json`, …) until the runs add up to the whole held-out set (about 85 turns).
2. **Top 30.** `npm run simulate -- --set top30 --max-model-turns 30` once. This is the one run allowed to go past the usual cap: at most 30 × 84 = 2,520 Neurons worst case, about 540 typical. Save the JSON line as `top30.json`.
3. **Beta outcomes.** `npx wrangler d1 execute psych-staging --remote --env staging --json --command "SELECT SUM(followups) AS followups, SUM(reworded) AS reworded FROM daily_outcomes WHERE day >= '<first beta day>'"`, and save the first row as `outcomes.json`.
4. **Ratings** from the testers, out of 5, as a JSON array (`ratings.json`); **daily model calls** from `ai_budget` on staging as a JSON array (`calls.json`).
5. `npm run gates -- --simulations sim1.json,sim2.json --top30 top30.json --outcomes outcomes.json --ratings ratings.json --calls calls.json`, and paste its report below.
6. `npm run weights:export` writes the weights staging learned to `worker/weights/base.json`; review that diff in a PR before production starts from it.

A gate with too little data (fewer than 80 held-out turns, 50 follow-ups, 10 ratings) reports `no-data` and blocks the launch.

<!-- Paste the report here when it has been run. -->
