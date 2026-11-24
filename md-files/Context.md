# PSYCH — Context

Why this project exists and why each decision was made, in order. Read this first.
Labels: **APPROVED** (owner decided), **PROPOSED** (Claude's call, owner may override), **OPEN** (needs the owner).
Companion files: [Design](Design.md) · [Architecture](Architecture.md) · [Technology](Technology.md) · [Research](Research.md) · [Plan](Plan.md) · [Workflow](Workflow.md)

## 1. Who and why

- **Owner:** Vedant Kale, Master of Artificial Intelligence student at RMIT University, Melbourne.
- **Target roles:** AI Engineer, ML Engineer, Data Scientist, AI/ML internships; long-term a **client-facing, end-to-end AI engineer** (Forward Deployed / AI Solutions Engineer).
- **What the site must prove:** "I build real AI, end to end", plus personality, curiosity and trajectory, with integrity and security non-negotiable.
- **Name:** **PSYCH**, the owner's gaming name: anticipating and doing what the other person can't think of.

## 2. The person behind it (source material for the experience)

- **Captain and organiser:** football from 2nd standard; college team captain for 3 years; organised inter-college tournaments; third-division club football; division-level hockey; district-level volleyball.
- **Psychology of designed environments:** jewellery stores' yellow light, casino carpets; how spaces steer attention and emotion.
- **Reading people:** hospitality and events work (bartending, F&B, retail bars, ushering, ticketing) across Melbourne venues and stadiums; enjoys serving people and seeing them satisfied.
- **Curious explorer:** coffee, solo walks, nature, business case studies, research amplified by AI.
- **Values through animals:** wolf (the pack), tiger (intensity), lion (pride), elephant (humble strength).

## 3. Current work (honest status, from project files on 2026-11-23)

| Project | Status | Source |
|---|---|---|
| Personal Finance AI (multi-agent, FastAPI, Postgres RLS, Expo) | Building: M0–M5 merged, M6 dashboard in progress | its Readme.md |
| expense-track-agent (Next.js 16, Postgres 18 forced RLS, Google OIDC) | Building: Phases 1–2 complete, 153 tests | its docs/PROGRESS.md |
| GeoUrban AI (geospatial / urban AI) | Building (APPROVED); trail content OPEN | owner |
| ORION (uncertainty-aware agentic research direction) | Planned | earlier research chat |

## 4. Decision log

| # | Date | Decision | Status | Why |
|---|---|---|---|---|
| 1 | 11-23 | Lead with proof of end-to-end building, personality, trajectory, and a living roadmap | APPROVED | Owner's goal for the site |
| 2 | 11-23 | Bar imagery stays in, shown as craft and hospitality | APPROVED | Core to the owner's story and client pitch |
| 3 | 11-23 | Career framing: client-facing, end-to-end AI engineer | APPROVED | Owner's 5-year aim |
| 4 | 11-23 | Concept: **One Night in Melbourne** + **The Order** + **The Reveal** + **Mind Palace** | APPROVED | Owner chose after rejecting first concepts as not creative enough |
| 5 | 11-23 | Mind Palace grows from blog posts; shows how he thinks (research, constraints, decisions) | APPROVED | Owner's idea |
| 6 | 11-23 | Posts every 1–3 days; 3–4 ready at launch; Spark vs Deep dive sizes | APPROVED cadence / PROPOSED sizes | Sustainable writing |
| 7 | 11-23 | GitHub is the single source of truth; admin page later writes commits; admin invisible and locked to owner | APPROVED | Security, history, no database for content |
| 8 | 11-23 | Client inquiries from The Order, after launch | APPROVED | Only useful once live |
| 9 | 11-24 | Visual direction: Amber Noir + Ink & Glow, realistic | APPROVED | Mockup choice A + C |
| 10 | 11-24 | Realism via **real-time 3D in the browser** | APPROVED | Owner's choice over pre-rendered |
| 11 | 11-24 | Quality over speed; launch when the quality bar is met, not by date | APPROVED | "Time can be extended but I don't want to compromise" |
| 12 | 11-24 | **$0 budget**, free plans only; public deploy when done | APPROVED | Owner constraint |
| 13 | 11-24 | **Realistic likeness** of the owner, as frozen captured moments | APPROVED likeness / PROPOSED method | Avoids uncanny animation |
| 14 | 11-24 | Perspective arc: third-person → first-person; Palace at projects; bookend at dawn | APPROVED arc / PROPOSED bookend | Owner's idea |
| 15 | 11-24 | At The Order the visitor swaps sides and is served by the owner | APPROVED | Emotional core of hospitality |
| 16 | 11-24 | Public code: one finance repo (after history scan) + public extracts repo; portfolio repo public | APPROVED / PROPOSED portfolio public | Engineers look for code |
| 17 | 11-24 | Site name **PSYCH**; titles "PSYCH — Vedant Kale"; Reveal ends on "Psych." | APPROVED name / PROPOSED framing | Brand + searchability |
| 18 | 11-24 | Deep research of top 10 references; borrow ideas by licence | Done | Owner request |
| 19 | 11-24 | Stack: Next.js static export + one Cloudflare Worker + Workers AI + D1 on Cloudflare free | PROPOSED (owner asked Claude to decide) | Commercial use allowed, hard AI cap, nothing sleeps |
| 20 | 11-24 | RMIT resources not used for the live site; RMIT email only to verify student offers | PROPOSED | RMIT IT Acceptable Use Standard bans commercial use |
| 21 | 11-24 | Claim GitHub Student Pack domain when inquiries launch | PROPOSED | Free first year starts on claim; needed for email routing |
| 22 | 11-24 | Documentation consolidated into `md-files/`; planning started with the writing-plans skill | APPROVED | Owner request |

## 5. Open items

| Item | Needed by |
|---|---|
| Which finance repo goes public (after secret scan of full history) | Before linking code |
| GeoUrban AI trail content (problem, data, approach, decisions) | Palace content |
| 3–4 launch posts | Launch |
| Three capture sessions (pitch, behind counter, dawn with coffee) | M3 |
| Year-two domain renewal price; Groq free limits; R2 free limits | Before relying on them |
| Owner accounts: GitHub repo, Cloudflare account (personal email, not RMIT) | M1 |
