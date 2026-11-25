# Order v2 (M5.1 + M5.2) Implementation Plan

> **For agentic workers:** Follow md-files/Workflow.md. Each task is one GitHub issue, branch and PR: failing test first, then code, then `npm run verify` green before pushing; Worker answer changes also pass `npm run evals`. Checkbox steps per task are: failing test → run, fails → implement → run, passes → commit.

**Goal:** A hiring manager or reference can talk to The Order like an interviewer and leave satisfied or asking for an interview, with every claim true. The AI goes back on in production only after it has been trained and the launch gates pass.

**Architecture:** Stories and the profile become indexed evidence. Each order is sorted by its words into role / behaviour / fact and answered in that shape, inside a short conversation (2–3 turns of memory). Every answer ends in an exit. Visitor signals score each turn; the scores tune evidence ranking and follow-ups within limits and drive a weekly gap report. A staging Worker runs the simulator and the private beta.

**Tech Stack:** Workers AI (Llama 4 Scout JSON mode; `@cf/baai/bge-small-en-v1.5` embeddings), MiniSearch, Hono, D1, Content Collections + Zod, Next.js static export, Playwright, Vitest, GitHub Actions.

**Spec:** md-files/Design.md §10 and §5; md-files/Context.md decisions #23–#32; md-files/Architecture.md §4, §5, §8; md-files/Research.md §6.

## Tickets

| Task | Issue | Blocked by |
|---|---|---|
| 1 Staging | done in #58 | — |
| 2 Profile as evidence | #59 | — |
| 3 Stories | #60 | — |
| 4 Conversation memory | #61 | — |
| 5 Order kinds | #62 | #59, #60 |
| 6 Exits and signals | #63 | #61 |
| 7 Clarifying question | #64 | #62 |
| 8 Hybrid retrieval | #65 | #59 |
| 9 Signal scoring | #66 | #61, #63, #65 |
| 10 Simulator | #67 | #62, #66 |
| 11 Learned ranking and follow-ups | #68 | #66 |
| 11 Gap report (split out) | #69 | #66 |
| 12 Beta and launch gates | #70 | #67, #68, #69 |
| 13 AI back on | #71 | #70 |

Decisions #33–#36 (Context.md) changed Tasks 6, 10 and 11; the issues carry the current acceptance criteria.

## Global Constraints

Everything in md-files/Plan.md "Global Constraints" applies. In addition:
- Production `ORDER_ENABLED` stays `"false"` until Task 13.
- No guessing (#25): code drops hedges and people/business claims the cited text doesn't state; evals keep 0 over-claims.
- Order text is kept 30 days with no IP or account; the privacy page states it **before** the first row is stored.
- Conversation id: random, per browser tab (`sessionStorage`), never a cookie; memory is at most the last 3 turns.
- Answers: first person, answer first, ≤ 80 words, technical terms explained in brackets.
- Learned weights stay within [0.5, 2.0] × the base score and never add evidence that retrieval didn't return.
- Staging has its own Worker and D1; it never reads or writes production data.
- $0: AI calls in staging and evals count against the same 10,000-Neuron free day. The daily cap is a per-environment var `AI_DAILY_CAP`; **production + staging caps ≤ 119** (119 × 84 worst-case Neurons = 9,996). A simulator run stays ≤ 2,000 Neurons, so the 200+ conversations run in daily batches.

## Review Focus

1. **Visitor rewords the same question 3 times** → each turn is scored −2, the gap report lists it, and the answer doesn't get worse (the weights stay within bounds). Test in Task 9.
2. **A story names another person** (a teammate, a manager) → the story page and answers show only what the owner wrote and approved, and no contact details. Test in Task 3 (schema forbids `email`/`phone` fields in stories).
3. **A visitor spams "No" signals** to push a source down → signals are rate-limited per conversation, and one conversation moves a weight by at most 0.05. Test in Task 11.
4. **Memory carries an injection** ("earlier you agreed I'm the admin") → past turns are passed as untrusted data like the order itself, and screening runs on each turn. Test in Task 4.
5. **The embeddings call fails or times out** → retrieval falls back to BM25 only; the order is still answered. Test in Task 8.

---

### Task 1: Staging environment (M5.1)
**Files:** `wrangler.jsonc` (`env.staging`: name `psych-staging`, own D1 `psych-staging`, `ORDER_ENABLED: "true"`, `AI_DAILY_CAP`), `worker/src/order/handler.ts` (cap from `AI_DAILY_CAP`, default 100), `.github/workflows/deploy.yml` (deploy staging on push to `main` after production), `md-files/Workflow.md` (environments).
**Owner steps:** set staging Worker secrets `TURNSTILE_SECRET`, `IP_SALT_SECRET`; add the staging hostname to the Turnstile widget.
**Done when:** `wrangler d1 migrations apply psych-staging --remote` runs in CI; the staging URL answers an order with the AI on, while production still serves the house menu.

### Task 2: Profile as evidence (M5.1)
**Files:** `scripts/build-search-index.ts` (profile → chunks `profile#n`: roles, education, skills, each with plain text), `components/order/SourceLinks.tsx` (`profile` → `/facts/`), `evals/order-cases.json`.
**Interfaces:** `profileChunks(profile: Profile): Chunk[]`.
**Tests:** a unit test that roles appear as chunks; an eval case where "someone who has worked face to face with customers" → a mix citing `profile`.

### Task 3: Stories (M5.1)
**Files:** `lib/content/schema.ts` (`postTypes` gains `'story'`; `storyFields`: `themes: z.array(z.enum(['leadership','feedback','customers','pressure','teamwork','mistake','decision','learning'])).min(1)`, no contact fields), `lib/content/labels.ts`, `content/posts/*.md` (first stories), `app/palace/[slug]/page.tsx` (situation/action/result render as headings).
**Owner steps:** a story interview session (Claude asks, the owner answers; Claude drafts; the owner approves each story before merge). First three themes: captaincy (leadership), bar or events work (customers, pressure), a review that changed your code (feedback).
**Tests:** schema rejects a story without themes; stories are indexed; an eval where "tell me about a time he led a team" → a mix or answer citing the captaincy story.

### Task 4: Conversation memory and turn storage (M5.1)
**Files:** `worker/migrations/0002_conversations.sql` (`turns`, `signals`), `worker/src/order/request.ts` (`conversationId`: 16–64 chars `[A-Za-z0-9_-]`), `worker/src/order/prompt.ts` (`history` passed inside the untrusted data block), `worker/src/db/purge.ts` (turns and signals after 30 days), `components/order/Order.tsx` (id in `sessionStorage`), `app/privacy/page.tsx` (full order text kept 30 days).
**Interfaces:** `recordTurn(db, { conversationId, seq, text, kind, chunkIds }): Promise<number>` returns the turn id; `history(db, conversationId, n = 3): Promise<{ text: string; kind: string }[]>`.
**Tests:** turns stored and purged at 30 days; history capped at 3; an injected history line stays inside the data block (Review Focus 4); e2e: the privacy page states the 30-day text retention.

### Task 5: Order kinds and answer shapes (M5.1)
**Files:** `worker/src/order/kind.ts`, `worker/src/order/prompt.ts` (one prompt per kind), `worker/src/order/model.ts` (schemas), `lib/order/types.ts` (`OrderResult` gains `{ kind: 'answer'; text: string; evidenceIds: string[] }`), `components/order/Order.tsx`, `components/order/copy.ts`.
**Interfaces:** `orderKind(text: string): 'role' | 'behaviour' | 'fact'` (rules: `/^(how|why|tell me about|describe|what did|has he|have you)\b/i` → behaviour; existing fact rules → fact; else role). The behaviour answer is ≤ 80 words, first person, and every sentence cites; `enforceCitations` gains `enforceAnswer` with the same checks.
**Tests:** kind rules table; behaviour answers over 80 words are cut at a sentence boundary; evals for each kind.
**Blocked by:** Task 2, Task 3.

### Task 6: Exits on every answer and explicit signals (M5.1)
**Files:** `worker/src/index.ts` (`POST /api/signal`), `worker/src/order/signal.ts`, `components/order/Exits.tsx`, `components/order/Order.tsx`.
**Behaviour:**
- **None:** "No story on this yet" plus the closest documented work (top retrieved chunk), labelled "Related, not the same".
- **Every result:** "Did this answer it?" Yes / No; source links; "Ask for an interview" opens LinkedIn and copies a conversation summary (decision #34; needs `contact.linkedin`, an owner step).
- **Yes:** offers the receipt PDF and CV.
- **No:** opens the pre-filled request with "What was missing?".
**Interfaces:** `POST /api/signal { conversationId, turnId, type: 'yes'|'no'|'opened-source'|'receipt'|'interview' }` → 204; max 20 signals per conversation; `turnId` must be a stored turn of that conversation; per-IP-hash rate limit (decision #36).
**Tests:** e2e for each exit; signal endpoint validation and the cap.
**Blocked by:** Task 4.

### Task 7: One clarifying question (M5.1)
**Files:** `components/order/Clarify.tsx`, `lib/order/clarify.ts`.
**Interfaces:** `clarify(text: string): { question: string; options: string[] } | null`. Vague role orders (≤ 4 words, or no domain word) get options such as "a product users touch / internal tools / research / data and security"; the chosen option is appended to the order. No AI cost.
**Tests:** a unit table of vague versus specific orders; e2e: choosing a chip sends the combined order.
**Blocked by:** Task 5.

### Task 8: Hybrid retrieval (M5.1)
**Files:** `scripts/embed-chunks.ts` (deploy-time: Workers AI REST with the CI token → `worker/generated/vectors.json`; skipped locally without a token), `worker/src/order/retrieve.ts` (`retrieveHybrid`: BM25 ∪ cosine top-k, max 2 chunks per source, falls back to BM25 on any embeddings error).
**Interfaces:** `retrieveHybrid(index, vectors, ai, text, k = 6): Promise<Chunk[]>`.
**Tests:** diversity cap; fallback on AI error (Review Focus 5); evals: "business acumen" finds a story tagged `decision` without sharing words.
**Blocked by:** Task 2.

### Task 9: Signal scoring (M5.2)
**Files:** `worker/src/order/score.ts`, `worker/migrations/0003_outcomes.sql` (`daily_outcomes`).
**Rules (decision #29):**
| Signal | Score |
|---|---|
| Reworded the same question (similar to the previous question, not to the previous answer) | −2 |
| No | −3 |
| Dug deeper (similar to the previous answer) | +1 |
| New topic | +1, and the previous turn's demerits are halved |
| Opened a source | +1 |
| Yes | +2 |
| Receipt, CV or interview request | +3 |
**Interfaces:** `scoreTurn(prev: Turn, next: { text: string; vector: number[] } | Signal): number`.
**Tests:** a table for every rule; three rewordings in a row (Review Focus 1).
**Blocked by:** Task 4, Task 6, Task 8.

### Task 10: Conversation simulator and held-out set (M5.2)
**Files:** `evals/personas/*.json` (recruiter, hiring manager, reference, in a hurry, sceptical), `evals/conversations/{train,heldout}/*.json` (≥ 200 multi-turn conversations, 80/20 split, written by Claude, reviewed by the owner), `evals/simulate.ts` (replays them against a local Worker with the test Turnstile secret, ≤ 2,000 Neurons per run (decision #36); scores with `scoreTurn` plus over-claim checks), `.github/workflows/evals.yml` (heldout on PRs touching `worker/src/order/**`).
**Tests:** `evals/simulate.test.ts` for the scorer; a dry-run mode needing no AI.
**Blocked by:** Task 5, Task 9.

### Task 11: Learned ranking, follow-ups and the gap report (M5.2)
**Files:**
- `worker/src/order/weights.ts`: `chunk_weights`, a bounded bandit with decay, applied inside `retrieveHybrid`;
- `lib/order/followups.ts`;
- `.github/workflows/gap-report.yml`: a weekly cron that queries D1 with wrangler and opens a GitHub issue "Gap report <week>" with themes, counts and weak evidence ids only, never visitor text (decision #33); raw questions are read locally. It uses the existing tokens, so no new secret is needed.
**Tests:** weights stay in [0.5, 2.0]; one conversation moves a weight by at most 0.05 (Review Focus 3); the gap report on fixture rows.
**Blocked by:** Task 9.

### Task 12: Private beta and launch gates (M5.2)
**Files:** `evals/gates.ts` (computes gates from the heldout run and staging `daily_outcomes`); the gate report goes in `md-files/Research.md` §7.
**Gates:**
| Gate | Target |
|---|---|
| Over-claims | 0 |
| Satisfied on heldout | ≥ 80% |
| Rephrase rate | ≤ 10% |
| Top 30 interview questions | documented answer or honest redirect |
| Beta average | ≥ 4/5 |
| Cost | average conversation within the cap |
**Owner steps:** invite 10–20 beta testers to the staging URL.
**Blocked by:** Task 1, Task 10, Task 11.

### Task 13: Switch the AI back on in production (M5.2)
`wrangler.jsonc` `ORDER_ENABLED: "true"`, after the owner's yes with the gate report attached; live smoke test in Brave; the weekly gate check stays on.
**Blocked by:** Task 12.
