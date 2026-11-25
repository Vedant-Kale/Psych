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
| 13 | 11-24 | **Realistic likeness** of the owner, as frozen captured moments | APPROVED likeness / method updated by #28 | Avoids uncanny animation |
| 14 | 11-24 | Perspective arc: third-person → first-person; Palace at projects; bookend at dawn | APPROVED arc / PROPOSED bookend | Owner's idea |
| 15 | 11-24 | At The Order the visitor swaps sides and is served by the owner | APPROVED | Emotional core of hospitality |
| 16 | 11-24 | Public code: one finance repo (after history scan) + public extracts repo; portfolio repo public | APPROVED / PROPOSED portfolio public | Engineers look for code |
| 17 | 11-24 | Site name **PSYCH**; titles "PSYCH — Vedant Kale"; Reveal ends on "Psych." | APPROVED name / PROPOSED framing | Brand + searchability |
| 18 | 11-24 | Deep research of top 10 references; borrow ideas by licence | Done | Owner request |
| 19 | 11-24 | Stack: Next.js static export + one Cloudflare Worker + Workers AI + D1 on Cloudflare free | PROPOSED (owner asked Claude to decide) | Commercial use allowed, hard AI cap, nothing sleeps |
| 20 | 11-24 | RMIT resources not used for the live site; RMIT email only to verify student offers | PROPOSED | RMIT IT Acceptable Use Standard bans commercial use |
| 21 | 11-24 | Claim GitHub Student Pack domain when inquiries launch | PROPOSED | Free first year starts on claim; needed for email routing |
| 22 | 11-24 | Documentation consolidated into `md-files/`; planning started with the writing-plans skill | APPROVED | Owner request |
| 23 | 11-25 | The Order serves **job and internship** goals first: hiring managers and the references the owner talks to get to know him | APPROVED | Owner's priority |
| 24 | 11-25 | **Stories** (situation, action, result) become core content, captured by Claude interviewing the owner, approved by the owner; they feed answers, bar props and behaviour | APPROVED | Behaviour can only be proven by real events; live test showed the AI guessing without them |
| 25 | 11-25 | **No guessing:** the AI never infers traits; hedged layers and people/business claims the cited text doesn't state are dropped in code | APPROVED, done (#56) | Live test: "led the development…" invented |
| 26 | 11-25 | Every answer ends **satisfied or as an inquiry**: exits on every result, "Did this answer it?" | APPROVED | No dead ends for visitors |
| 27 | 11-25 | 21:00 becomes a **first-person conversation**: chat bar at the bottom, the visitor's last question faint above it, answers as subtitles while the owner works, behaviour states, pacing by the conversation, a rare "one minute" interruption shown as a ~3 s film cut | APPROVED | Owner's idea: realism and hospitality |
| 28 | 11-25 | Owner's motion comes from **filmed video loops** placed in the 3D bar; scans stay for frozen moments (updates #13) | APPROVED | Real footage avoids the uncanny valley at $0; talking while working avoids lip-sync |
| 29 | 11-25 | **Self-improvement:** scored visitor signals tune evidence ranking, follow-ups and style within limits; never facts; anything that changes what it says goes through an owner-approved PR | APPROVED | Better over time without risking honesty |
| 30 | 11-25 | Store **full order text for 30 days** (no IP, no account) for learning and the gap report | APPROVED | Richer gap reports |
| 31 | 11-25 | **Train before launch:** simulator with personas + held-out set + private staging beta (10–20 people); the AI goes back on only when launch gates pass | APPROVED | Portfolio traffic is too low to learn live first |
| 32 | 11-25 | AI switched **off** in production until the launch gates pass (#55) | APPROVED | Over-claims seen in the live test |
| 33 | 11-25 | The weekly **gap report** issue shows themes, counts and weak evidence ids only; raw question text is read locally from D1 | APPROVED | The repo is public; visitor text must never be published |
| 34 | 11-25 | "Ask for an interview" opens **LinkedIn** and copies a conversation summary; no email on the site | APPROVED | Avoids scraper spam |
| 35 | 11-25 | Staging-learned weights reach production by **export → owner review in a PR → commit**; production keeps learning within the same bounds | APPROVED | Staging and production D1 are separate |
| 36 | 11-25 | Signals must name a stored turn of their conversation and are rate-limited per IP hash; the simulator runs on a local Worker, never via a staging Turnstile bypass | APPROVED | Stops weight steering and protects the free AI quota |

## 5. Open items

| Item | Needed by |
|---|---|
| Which finance repo goes public (after secret scan of full history) | Before linking code |
| GeoUrban AI trail content (problem, data, approach, decisions) | Palace content |
| 3–4 launch posts | Launch |
| Three capture sessions (pitch, behind counter, dawn with coffee) | M3 |
| Year-two domain renewal price; Groq free limits; R2 free limits | Before relying on them |
| Owner accounts: GitHub repo, Cloudflare account (personal email, not RMIT) | M1 |
| Story interview sessions (captaincy, bar and events work, feedback, pressure, a mistake) | Order v2 |
| Filming session for the bar loops (shot list in Design §5) | M3 |
| 10–20 beta testers for the private staging Order | Launch gates |
| Staging: Turnstile hostname + staging Worker secrets (owner sets them) | Staging ticket |
