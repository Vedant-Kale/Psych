# PSYCH — Design

What visitors experience. How it's built lives in [Architecture](Architecture.md) and [Technology](Technology.md); why in [Context](Context.md).

## 1. Audiences and journeys

| Visitor | Arrives wanting | Journey |
|---|---|---|
| Recruiter (often on a phone) | Facts in under a minute | Lands on One Night → sees "Skip to the facts" at once → `/facts` (summary, projects with status, skills, education, roles, CV, contact). Can return to the experience any time. |
| Engineer / hiring manager | Depth and judgement | One Night → 01:00 desk → "enter the mind" → project trail in the Palace (question → research → options → constraint → decision) → code links. |
| Future client | "Can he solve my problem?" | 21:00 The Order: describes a need → gets a tailored mix with evidence → (post-launch) sends it as an inquiry. |
| Curious visitor | Something memorable | The whole night, the Palace, The Reveal. |

## 2. Site map

```
/                      One Night (the experience), with the clock and "Skip to the facts"
/facts                 Fast path: plain, fast, printable
/palace                Mind Palace (3D ink world)
/palace/[slug]         Every node is also a normal readable page (post, trail, learning)
/projects/[slug]       Project page: status, what it does, architecture, trail link, code
/influences            Credits for every borrowed idea and library
/privacy               What is collected (The Order's unanswered questions, analytics), retention
/cv.pdf                CV
/admin                 Post-launch, unlisted, owner-only sign-in
```

## 3. One Night in Melbourne

A continuous real-time 3D journey from dusk to dawn, driven by scroll, with a **clock** as navigation (drag to any hour). One camera, one take, no page cuts.

| Hour | Scene | Perspective | Says |
|---|---|---|---|
| 18:00 | Floodlit pitch; you with the captain's armband; floodlights narrow to one amber pool on you | Third-person, then the camera moves into your eyes | Leader, organiser, athlete |
| 21:00 | The bar counter; visitor seated across; you serve | Visitor is the guest | People-reader; **The Order** |
| 01:00 | The desk; code lifts into glowing 3D architecture of real projects; "enter the mind" | First-person | Builds real systems → Mind Palace |
| 05:00 | Coffee, misty walk, a wolf alongside | First-person | Curiosity, calm, values |
| Dawn | Horizon of builds (Live / Building / Planned); camera pulls back to you with coffee | Third-person | Trajectory; **The Reveal** |

Animal values appear as texture at fitting moments (wolf at 05:00; tiger, lion and elephant as subtle motifs), never as a section.

## 4. The Mind Palace

An explorable world drawn in ink on dark paper; only important things glow amber.
- **Wings = domains:** AI agents, Finance, Geospatial, Psychology, Business cases (more as they grow).
- **Node types:** **Spark** (100–300 words, small glow), **Deep dive** (long, large glow), **Trail** (a project's thinking, linked to its project), **Learning** (learning now / certificates).
- **Growth stage:** seedling, budding or evergreen. **Confidence** (optional) on opinions.
- Hover shows a preview; click flies to the node; every node has a normal page.
- An **Influences** node credits borrowed ideas.

## 5. Signature moments

- **Ink-to-real:** at 01:00 a project starts as an ink sketch from the Palace and floods with light and material into the real object.
- **The Order:** visitor orders in plain words ("an engineer who can ship secure AI agents"); skills pour as liquid layers, each layer citing the project or post that proves it; the receipt is a tailored one-page résumé. If nothing supports the order, it says so honestly. When the AI is unavailable: the **house menu** (a fixed, curated menu).
- **The Reveal:** "You've been here N minutes. Here's how I kept you." Replays the lighting, pacing and curiosity gaps used; framed as anticipating what you'd want, never as tricking you; ends on **"Psych."** Computed in the browser only.

## 6. Visual language

- **Amber Noir** (One Night): near-black, warm jewellery-store amber where attention should go; glass, wood, brass, haze, reflections; baked cinematic lighting.
- **Ink & Glow** (Palace): hand-drawn line work, hatching, slight wobble; amber glow on nodes that matter.
- **Rule:** ink = idea, amber light = real.
- **Type:** elegant serif for display; clean sans for body; monospace for labels and code (exact families chosen in M4).
- **Copy:** plain, warm, confident; never claims anything not backed by content; statuses always honest.

## 7. Your likeness

Three captured poses: **18:00 pitch** with armband, **21:00 behind the counter**, **dawn with coffee**. Shown as frozen moments: camera, light and haze move; you do not. Each graded to its hour. Web-resolution only; originals never published.

## 8. Accessibility and comfort (part of the design, not an add-on)

- "Skip to the facts" always visible; everything in the experience also exists as readable HTML.
- Full keyboard control of the clock, Palace and The Order.
- `prefers-reduced-motion`: camera moves become crossfades; no parallax; The Reveal is text.
- Quality tiers: high, medium, low, still (static frames). Never a blank screen.
- WCAG 2.2 AA for all text content.

## 9. Launch quality bar

- Fast path and content pages: Lighthouse ≥ 95 in all four categories (mobile).
- 3D: first meaningful frame < 3 s on a mid-range phone over 4G; ≥ 50 fps on an M-series MacBook; ≥ 30 fps on a mid-range Android via tiers.
- Zero console errors; CI green; The Order's evals pass.
