> **Superseded 2026-11-24:** the canonical docs now live in `md-files/` (Context, Design, Architecture, Technology, Research, Plan). This file is kept as history.

# PSYCH — What we borrow, and what stays ours

Date: 2026-11-24. Source: [Immersive 3D portfolio research](../../reports/Immersive%203D%20portfolio%20research.md) and the [design doc](../superpowers/specs/2026-11-24-portfolio-design.md).
Status: PROPOSED. Library choices here are inputs to the stack decision, not final.

## 1. Summary

PSYCH borrows **proven techniques** for every part that has been done before, so effort and risk go into the four parts nobody has shipped: the dusk-to-dawn lighting journey, the clock that scrubs the night, the third-to-first-person shift, and a realistic owner scan on a top-tier portfolio. We borrow **ideas** from ten sources and **code** only where the licence allows it. Where the leaders fall short (accessibility, reduced motion, AI citation checks, security), PSYCH deliberately does better instead of copying.

## 2. Borrowing rules

| Source licence | What we may take | Obligation |
|---|---|---|
| MIT (e.g. Bruno Simon folio-2025, Quartz, Spark, 3d-force-graph) | Ideas and code | Keep the copyright and licence notice in any copied file; list in `CREDITS.md` |
| Public repo, licence not confirmed (itomdev, Laxenaire, Heckel's Moebius demo, ProjectHub) | Ideas only until the licence is checked | Check licence before copying any code |
| Source visible, **no licence** (Maggie Appleton) | Ideas only | Never copy code; no licence means all rights reserved |
| Closed (Igloo, Messenger, Oryzo, Giulio, Santamaria) | Ideas from public write-ups only | Credit the idea in the PSYCH Palace trail where relevant |

Every borrowed idea is credited in a public "Influences" node in the Mind Palace. That is honest, and it shows research discipline, which fits the portfolio's purpose.

## 3. Borrowing by PSYCH feature

### 3.1 One Night: the dusk-to-dawn journey

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| A single colour atlas that sets every colour in the world, so swapping it changes the whole mood at once | Messenger (Abeto) | Three atlases (dusk, night, dawn) blended by scroll position. One shader uniform shifts the entire world's hour. |
| Fading baked lighting along the camera path | Crosswire (Codrops) | Bake 2–3 lighting sets per scene in Blender and blend them in the shader by scroll factor. Exposure, fog and bloom threshold change in step. |
| Scroll as one continuous camera take, with lighting that shifts from world to world | Joseph Santamaria | The whole night is one take: pitch → bar → desk → coffee → dawn. No page cuts. |
| One input path for wheel, touch and trackpad (GSAP Observer) | Santamaria | Same, and the clock feeds the same path, so scroll and clock never fight. |
| Cull what the camera path will never see, instead of generic level-of-detail | Santamaria | Each hour knows its camera path, so it loads and draws only what that path sees. |
| Camera paths drawn as curves in Blender, exported as point lists | Giulio Collesei | The whole night's camera path is authored in Blender and edited visually, not in code. |
| Skip rendering scenes outside the active scroll range; neighbouring scenes hand textures forward for transitions | Shader.se (Codrops) | Only the current hour and the next are live. Transitions mix the two. |
| Pause off-screen scenes; pause everything when the tab is hidden | Giulio, Laxenaire | Same; saves battery and keeps phones cool. |
| Real-time intro instead of video, to save download size | Igloo Inc | The 18:00 opening is real-time 3D, not a video file. |
| Compile shaders and load the next hour's textures in the background | Igloo Inc, itomdev (`compileAsync`) | While the visitor is in hour N, hour N+1 is prepared silently, so there's no stutter at hour changes. |

**Not borrowed:** Igloo's UI drawn inside WebGL. It's invisible to screen readers and search. PSYCH keeps all text and controls as real HTML over the canvas.

### 3.2 Amber Noir realism

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| No real-time lighting on the main path: baked global illumination and ambient occlusion | Lusion MaxMara, Oryzo | Bake the amber jewellery-store light in Blender. Real-time light is used only where something moves (the glass at The Order). |
| HDRI used only for reflections | Lusion | Brass, glass and wet surfaces reflect a warm HDRI. The scene isn't lit by it. |
| A thin post-processing stack: bloom, tone mapping, vignette, grain | Lusion, Shopify Editions | Same stack, tuned per quality tier. |
| Noise baked into textures instead of computed in shaders | Giulio | Haze and grain textures are baked to save GPU on phones. |
| Rejecting real-time PBR when it can't meet the quality bar | Lusion Oryzo | Taken as a rule: if real-time can't look cinematic on a phone, bake it. |

### 3.3 The Mind Palace: ink world and knowledge graph

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| Ink post-process: edges from depth and normals, hatching by brightness, a slight hand wobble | Maxime Heckel's Moebius shader | The base of the Palace look; amber glow is added only to nodes that matter. |
| Flat planes with hand-drawn textures; no lights, shading baked into texture tints | itomdev | Palace wings are drawn, not modelled. Fast, distinctive, and cheap on phones. |
| WebP for line art, because KTX2 compression blurred the lines | itomdev | Ink textures use WebP; everything else uses KTX2. |
| Maturity as a schema-checked field (`growthStage`: seedling / budding / evergreen) | Maggie Appleton | PSYCH's node types: Spark, Deep dive, Trail, Learning, plus a growth stage. Glow size reflects depth. |
| Wiki-links compiled into a link index at build time | Maggie Appleton, Quartz | The build writes `graph.json` (nodes, links, domains). The Palace reads only that file. |
| Hover previews of linked notes | Maggie Appleton, Gwern | Hovering a node shows its first lines before you fly to it. |
| `status`, `confidence`, `importance` on each piece | Gwern | Optional `confidence` on opinions (e.g. "strong view, loosely held"). It shows intellectual honesty. |
| A force-directed graph layout | Quartz (d3), 3d-force-graph | Laid out once at build time and saved, so the ink drawing looks composed, never jittery. |

**Ours alone:** no admired digital garden is an explorable 3D ink world. That part is original.

### 3.4 Ink-to-real transition

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| A noise-masked material that floods a sketch with paint as a progress value rises (`PaintRevealMaterial` via `onBeforeCompile`) | itomdev | Scaled up: a project's ink sketch in the Palace dissolves into the fully lit, realistic object at 01:00. |
| Hover paint as a "this is clickable" signal | itomdev | Hovered Palace nodes take a touch of amber, which teaches the visitor what to click. |
| Blended materials driven by a mask | Codrops blended-material tutorial | Line pass and shaded pass rendered together, mixed by an animated noise mask. |

**Ours alone:** no public sketch-to-photoreal site was found. The recipe is a synthesis, so it gets an early prototype on a real phone.

### 3.5 The Order: the grounded AI bartender

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| Common questions answered with no AI call, from a structured fact file | ProjectHub | Facts like role, education and contact come from your profile file directly: instant, free, always correct. |
| Reject AI replies that add facts or numbers not in the supplied context | ProjectHub | Done in code before anything is shown. |
| Safety checks before the model is called | ProjectHub, Cameron Rye | Length cap, injection filter and off-topic filter run before any AI call. |
| A fallback chain across free providers with cooldowns | ProjectHub | A primary free provider and a backup. When both are exhausted, the static "house menu" appears. |
| `record_unknown_question`: the assistant notes what it couldn't answer | Ed Donner pattern | Questions with no answer are logged privately with no personal data, so you know what to write about next. It feeds the Palace. |
| Per-IP rate limits on the server | Cameron Rye | Same. Rye saw injection attempts within hours of launch, so this ships on day one. |
| Screen visitor text with a free moderation step | Bruno Simon's "Whispers" | Orders are screened before the AI sees them. |
| No vector database for a small corpus; a static index file | ProjectHub, research estimate | Embeddings or keyword index built at deploy time, shipped as one file. |

**Where PSYCH goes further:** none of the examples verifies citations in code. The Order requires `{answer, source_ids[]}` and checks that every ID exists among the supplied sources. Uncited claims are dropped. This becomes its own trail in the Palace, because it's real AI engineering evidence.

### 3.6 Your likeness and the camera shift

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| Splats mixed with normal 3D, with a separate, smaller mobile budget | Lusion Oryzo (~78k desktop / ~45k mobile) | Your three poses get desktop and mobile versions. |
| Training cameras placed on a sphere around the subject | Lusion Oryzo | Capture guide: your friend walks a full circle at two heights. |
| An owner avatar that reacts, then the world dissolves until only the owner remains under a spotlight | Giulio Collesei | At 18:00 the camera finds you; the floodlights narrow to a single amber pool on you before the camera moves into your eyes. |
| Capture in flat light, grade later; amber `recolor` tint and per-splat shader; fake blob shadow | Spark docs, three.js forum relight demo | Each pose is graded to its own hour (pitch floodlight, bar amber, dawn gold). |
| Chained camera moves (`setLookAt`) from shoulder to eye height, fading the splat out, then a first-person look rig | camera-controls (drei) | The see-you → become-you shift. A simple crossfade replaces it under reduced motion. |

**Ours alone:** no award-level portfolio shows its owner as a splat, and none switches from third to first person. Both need prototypes first.

### 3.7 Fast path, quality tiers, accessibility

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| Device tier at load (`hardwareConcurrency`, `deviceMemory`, screen size) | itomdev, Shopify (Tier 0–3) | Tiers: high, medium, low, and still (static frames). |
| FPS-driven quality manager at runtime (0–10 score against a target) | Laxenaire (`FPSWatcher` → `QualityManager`), drei `PerformanceMonitor` | Lowers effects live if the frame rate drops; never drops content. |
| An always-visible skip; a 2D fallback per scene | Laxenaire | "Skip to the facts" is always visible; every hour has a still-image tier. |
| Automatic mobile preset (no depth of field, lower shadows) | Bruno Simon | Part of the medium tier. |
| Strict memory release, because iPhone Safari kills heavy pages | Messenger | Hours are unloaded after you pass them. |
| Keyboard navigation (arrows, PageUp/PageDown) | itomdev | Plus clock and Palace keyboard control and screen-reader text for every 3D moment. |

**Where PSYCH goes further:** no reviewed site documents reduced-motion support or a full HTML alternative. PSYCH's fast path and WCAG 2.2 AA bar make it more accessible than every site in the top 10.

### 3.8 Content, publishing and the admin page

| Borrow | From | How PSYCH adapts it |
|---|---|---|
| Content as Markdown/MDX with a schema checked at build | Maggie Appleton (Zod), Content Collections | Invalid posts fail the build and never go live. |
| Wiki-link parsing plugin that also emits graph data | Maggie Appleton, Quartz | One build step makes the pages, `graph.json` and the AI index. |
| Admin sign-in allowing exactly one GitHub user by numeric ID; commits via a fine-grained token limited to one repo; same schema check before committing | Research synthesis (no example found) | The post-launch admin page. Safer than off-the-shelf CMSs, which let anyone with repo write access in. |

**Not borrowed:** Contentlayer (abandoned); Sveltia's token mode (token stored in the browser); Obsidian Publish (paid).

## 4. Borrowing by source

| # | Source | What PSYCH takes | Takes code? |
|---|---|---|---|
| 1 | Bruno Simon folio-2025 | Mobile preset; visitor text moderation; Blender names as level data; palette texture | Allowed (MIT) |
| 2 | Giulio Collesei | Owner spotlight moment; Blender curves as camera paths; texture caps; pausing off-screen scenes | Ideas only |
| 3 | Joseph Santamaria | One continuous take; single input path; culling by camera path | Ideas only |
| 4 | Igloo Inc | Real-time intro; background shader compile; quality drop on low-end devices | Ideas only |
| 5 | itomdev | Paint-reveal material; drawn planes; WebP for ink; device tiers; keyboard nav | After licence check |
| 6 | ProjectHub | Deterministic facts; unsupported-claim rejection; provider fallback; no logs | After licence check |
| 7 | Messenger | Colour atlas for the hour; outline system; iOS memory discipline | Ideas only |
| 8 | Lusion Oryzo | Splat budgets; sphere capture; bake over real-time PBR | Ideas only |
| 9 | Martin Laxenaire | Quality manager; skippable; per-scene fallback; pause on hidden tab | After licence check |
| 10 | Maggie Appleton + Quartz | Growth stages; build-time link graph; hover previews | Maggie: ideas only. Quartz: allowed (MIT) |
| + | Maxime Heckel (Moebius), Gwern, Ed Donner, Cameron Rye, Shopify Editions | Ink shader; confidence metadata; unknown-question log; rate limits and filters; tier system | Heckel after licence check; others ideas only |

## 5. What is PSYCH's own (no precedent found)

1. **Dusk-to-dawn lighting journey** across one continuous night.
2. **The clock**: drag to scrub the camera through the night.
3. **See you → become you → be served by you**: third to first person, then a side swap at the bar.
4. **A realistic owner scan** inside an award-level 3D portfolio.
5. **Ink-to-real**: an idea in the Palace becomes a real lit object.
6. **A 3D ink knowledge graph** that grows with each post.
7. **An AI that verifies its own citations in code** before speaking about you.
8. **The Reveal**: a site that explains how it held your attention, ending on "Psych."

These eight are the story a technical reviewer remembers.

## 6. Deliberately not borrowed

| Rejected | Seen at | Why |
|---|---|---|
| UI drawn in WebGL | Igloo Inc | Invisible to screen readers and search |
| No reduced-motion or HTML alternative | All top 10 | Fails PSYCH's accessibility bar |
| "Cite your sources" by prompt only | Most AI portfolios | Unreliable; PSYCH checks citations in code |
| Gemini free tier | Common in tutorials | Trains on prompts; can't serve EU/UK visitors |
| Supabase free for inquiries | Common default | Pauses after a week without use |
| Contentlayer | Older Next.js blogs | Abandoned since 2023 |
| KTX2 for line art | Standard pipeline | Blurs ink lines (itomdev's finding) |
| Theatre.js | — | None of the leaders needed it; GSAP covers choreography |
| Animated realistic avatar | Giulio (stylised android) | Uncanny risk with a real face; PSYCH uses frozen moments |

## 7. Libraries implied (inputs to the stack decision)

React Three Fiber + three.js (WebGL default; WebGPU only for specific wins) · drei (camera-controls, PerformanceMonitor) · pmndrs postprocessing · Spark (Gaussian splats, MIT, WebGL2) · GSAP ScrollTrigger + Observer · Lenis · 3d-force-graph (layout at build) · MDX + Zod (Content Collections or a small build script) · gltf-transform, Draco, KTX2, WebP · SuperSplat (splat cleanup) · Classic Scaniverse (capture). The hosting choice (Vercel vs Cloudflare) decides the AI provider and the database, and is the next decision.

## 8. Prototype first (highest risk)

1. Splat of you, graded amber, at 30 fps on a mid-range phone.
2. Third-to-first-person shift with the splat fading out.
3. Dusk-to-dawn atlas and lighting blend across two scenes, driven by scroll and by the clock.
4. Ink-to-real dissolve on one project object.

If a prototype fails on a phone, its feature's quality tier adapts before the design does.

## 9. Not verified

Awards for most 2025–26 sites; licences of itomdev, Laxenaire, ProjectHub and Heckel's repo; splat frame rates on named phones; mobile WebGPU stability on iOS 26; Groq free-plan limits; Cloudflare Workers AI data-use terms; whether Scaniverse's free plan covers a portfolio that takes client inquiries.
