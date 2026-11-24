---
slug: expense-track
title: expense-track-agent
status: building
domains: [finance, ai-agents]
summary: An expense tracker built on Next.js 16 and Postgres 18, where every user's data is isolated by forced row-level security and sign-in goes through Google OIDC.
started: 2026-09-01
---

expense-track-agent keeps each person's expenses private at the database layer. Postgres 18 row-level security is forced on every table, so a query can only ever see the signed-in user's rows, even if application code has a bug.

Status: building. Phases 1–2 are complete with 153 tests.
