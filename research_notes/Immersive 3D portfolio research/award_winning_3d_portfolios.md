# Award-Winning Immersive 3D / Interactive Personal Portfolios (research as of Nov 2026)

Method note: Codrops blocks direct fetches (HTTP 403). Codrops articles were read through Wayback Machine copies of the original URLs; citations point to the original Codrops URLs. Award claims are marked VERIFIED only when an Awwwards page or the creator's own write-up states them. Everything else is marked UNVERIFIED.

## Which personal portfolios are most awarded and most cited by developers, and how is each built?

### Takeaway
Bruno Simon's driving-car folio is still the reference that other developers cite. Its 2019 version won an Awwwards SOTD and a Developer Award. A WebGPU/TSL rebuild (folio-2025) shipped with a public case study and an MIT-licensed repo. The best-documented newer portfolios (2025–2026) come from Codrops case studies: Martin Laxenaire, Giulio Collesei, Joseph Santamaria, Tomasz Szmajda (itomdev) and Stas Bondar. Several of these publish their source. Henry Heffernan's retro-computer site is open source (2.6k stars) and widely copied, but I could not verify any award for it.

### Candidate shortlist (12)

| # | Site | Creator | Awards (status) | Stack summary | Source open? |
|---|------|---------|-----------------|---------------|--------------|
| 1 | bruno-simon.com (folio-2025; 2019 original) | Bruno Simon | 2019: Awwwards SOTD 11 Nov 2019 (8.04) + Developer Award (8.17), VERIFIED. 2025 version: no award confirmed | three.js, WebGPU via TSL with WebGL fallback, Blender, Draco, KTX2 (ETC1S/UASTC) | Yes, MIT: github.com/brunosimon/folio-2025 |
| 2 | martin-laxenaire.fr (2025) | Martin Laxenaire | None found | Nuxt3, Sanity, GSAP, Lenis, gpu-curtains (his own WebGPU engine), TypeScript | Yes: github.com/martinlaxenaire/portfolio-2025 |
| 3 | theycallmegiulio.com (v5, 2026) | Giulio Collesei | None found (searched Awwwards/FWA) | three.js WebGPU + TSL (WebGL fallback), Blender, GSAP, Lenis, gltf-transform, KTX2 | Not stated |
| 4 | joseph-san.com (2026) | Joseph Santamaria | None found | three.js/WebGL, GSAP ScrollTrigger + Observer + SplitText, Blender baking, KTX2, Draco, instancing | Not stated |
| 5 | itomdev.com (2026) | Tomasz Szmajda | Self-reported: FWA of the Day, GSAP SOTD, CSSDA Special Kudos, Orpetron SOTD (not checked on award sites) | React 19, R3F 9, three.js 0.182, GSAP 3.14, Vite 7, custom GLSL, WebP | Yes: github.com/ITomPoland/portfolio-itom |
| 6 | stabondar.com (2025) | Stas Bondar | GSAP Site of the Week + Site of the Month, per Codrops | Astro, GSAP (SplitText, quickTo), three.js, Barba.js, physics text | Not stated |
| 7 | henryheffernan.com | Henry Heffernan | None verified | Repo README names no framework; served with Express. Technical details UNVERIFIED | Yes, MIT, 2.6k stars: github.com/henryjeff/portfolio-website |
| 8 | Robin Payot portfolios (2021, 2022) | Robin Payot | 2021: SOTD on Awwwards and FWA, per Codrops. 2022: Awwwards SOTD 7.52, VERIFIED | WebGL/three.js. Stack of the 2022 version not confirmed | Not found |
| 9 | jesse-zhou.com | Jesse Zhou | None verified | three.js. "Ramen Shop" 3D scene source credited to his GitHub (enderh3art) | Partial: github.com/enderh3art/Ramen-Shop |
| 10 | Federico Pian portfolio 2024 | Federico Pian | Awwwards SOTD, self-reported in Codrops | Geometry-driven WebGL. Details not extracted | Not stated |
| 11 | Mathis Biabiany new portfolio | Mathis Biabiany | UNVERIFIED (three.js forum post only) | Not checked | Not checked |
| 12 | Minh Pham portfolio (built by Hon Tran) | Minh Pham (design) / Hon Tran (dev) | Awwwards SOTD 7.37, Developer score 7.77, per developer write-up | GSAP + three.js/WebGL | Not stated |

Other open-source retro-computer references: edwardh.io, source at github.com/edhinrichsen/retro-computer-website ([three.js forum](https://discourse.threejs.org/t/retro-computer-personal-website-open-source/67250)).

### Cited Findings

**1. Bruno Simon — folio 2019 / folio-2025**
- The 2019 portfolio won Awwwards SOTD on Nov 11, 2019, scoring 8.04: Design 7.94, Usability 7.55, Creativity 8.95, Content 8.13. It also won the Developer Award at 8.17 (Animations 9.00, Accessibility 7.00, WPO 8.67). No SOTM or SOTY is listed. Tags: Three.js, 3D, Games — [Awwwards](https://www.awwwards.com/sites/bruno-simon-portfolio)
- The new version keeps "the same core concept" (drive a car around a world) and aims to make it "ten times better". It is rebuilt for WebGPU with TSL shaders written in JS, and "automatically runs on WebGPU when available" — [Awwwards case study, Mar 11 2026](https://www.awwwards.com/brunos-portfolio-case-study.html)
- The world is built in Blender. Object names drive the logic: `refLandingPhysicalFixed` becomes a fixed physics body named "landing". Empties define collision shapes, respawn points and area bounds — [case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Features: a weather and season system, a 3D UI, "Whispers" (user messages screened with OpenAI's free moderation model), a daily circuit leaderboard, achievements and vehicle skins, spatialized audio, and CC0 music by Kounine — [case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Assets: ETC1S/UASTC (KTX2) textures and Draco-quantized models. Performance: instancing, frustum culling, merged geometry, hidden-face removal, and a palette texture for UV-based colouring. About 78,400 single-triangle grass blades loop to cover the ground — [case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Mobile automatically switches to a lower preset: no water blur, no DOF, lower shadow-map resolution. Input: keyboard, touch, scroll, click and gamepad. The case study does not mention screen readers or reduced motion — [case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- The physics engine is not named in the case study (UNVERIFIED). The front-end code is MIT-licensed at github.com/brunosimon/folio-2025 — [case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Reusable ideas: Blender naming conventions as a level editor, a palette texture to merge geometry, looping grass instances, SDF leaf textures, a daily-reset leaderboard as lightweight multiplayer, and mobile presets.

**2. Martin Laxenaire — 2025 portfolio (gamified WebGPU)**
- Stack: Sanity Studio (headless CMS), Nuxt3, GSAP (SplitText, ScrollTrigger Observer), Lenis "for an accessible smooth-scrolling", gpu-curtains (his own WebGPU engine) and TypeScript. The full source is a GitHub monorepo — [Codrops, Oct 6 2025](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/)
- Concept: a single landing page turned into a game. Visitors interact with each WebGPU scene to unlock the next content, the theme switcher and the palette generator. Progress is tracked, and the game can be skipped — [Codrops](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/)
- One WebGPU device renders four separate `<canvas>` scenes. Every WebGPU scene has a 2D-canvas fallback because "WebGPU is not fully supported yet" — [Codrops](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/)
- Adaptive quality: an `FPSWatcher` feeds a `QualityManager`, which sets a 0–10 quality score (default target 55 fps). Low scores reduce PCF shadow samples and volumetric raymarch steps, and can disable shadows or post-processing. Rendering pauses on `visibilitychange` and when a scene is off-screen. The article also has a basic accessibility section — [Codrops](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/)
- No award found.

**3. Giulio Collesei — theycallmegiulio.com (5th version, 2026)**
- Narrative: four cinematic scenes inspired by films. A Blade Runner "Tears in Rain" rooftop in neon rain (About). A Dragon Ball-style power-up that reveals the Works. A "Room of Memories", a Matrix-inspired cyberpunk guestbook where visitor messages float. A final DeLorean scene. A Blender-made android avatar of the owner reacts to hovers, for example lifting its head over "About" — [Codrops, Apr 14 2026](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/)
- Stack: Blender (some Sketchfab base models: avatar body, night-city buildings, DeLorean), three.js WebGPU with TSL compiling to WGSL/GLSL with a WebGL fallback, GSAP for scroll and audio timelines and material uniforms, and Lenis with custom section-snapping logic — [Codrops](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/)
- Pipeline: the avatar is rigged with an armature and its Dope Sheet actions are pushed to the NLA for glTF export. Flying-car paths are Blender curves exported as point lists to three.js. gltf-transform caps textures at 1024px, then converts to KTX2/Basis — [Codrops](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/)
- Performance: the render loop and post-processing pause for scenes not on screen, and noise is baked into textures instead of computed in shaders — [Codrops](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/)
- Awards: none found on Awwwards or FWA by name search (UNVERIFIED either way).

**4. Joseph Santamaria — joseph-san.com (2026)**
- A scroll-driven 3D world. The hero is "lit like an early morning underwater city". Scroll progress maps to camera movement and reveal timing, so the site plays "like a single camera take". A mid-site palette shift moves to a red rose field with an astronaut figure, then the floor breaks into a lava scene. Project transitions use an unfolding tesseract — [Codrops, Apr 28 2026](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)
- Stack: three.js/WebGL, GSAP ScrollTrigger + Observer (one input path for wheel, touch and trackpad) + SplitText, Blender for modelling and baking, KTX2/Basis, Draco, GPU instancing, and low-resolution render targets for atmospheric passes on mobile — [Codrops](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)
- He uses aggressive frustum culling along the known camera path instead of static LODs. Claimed results: 144 fps on capable hardware and steady on mid-range mobile — [Codrops](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)
- No award found.

**5. Tomasz Szmajda — itomdev.com (2026)**
- Concept: a walk-through sketchbook with no 3D models. Flat planes carry AI-generated hand-drawn textures. An infinite corridor has four doors leading to rooms (including Contact) — [Codrops, Jun 11 2026](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- Stack: React 19, R3F 9, three.js 0.182, GSAP 3.14 (camera flights, doors), Vite 7, WebP textures, and PostHog. Source: github.com/ITomPoland/portfolio-itom — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- `PaintRevealMaterial` extends MeshBasicMaterial via `onBeforeCompile`. A noise-masked uProgress fills a sketch with paint on hover, and this signals what is clickable — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- Corridor chunking: 80-unit segments, only three mounted at once, plus visibility wrappers. All lights were removed and the shading was baked into texture tints. Shaders are pre-warmed with `compileAsync` on off-screen rooms. KTX2 was tried and dropped because it degraded line art — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- Device tiering at load (UA, `hardwareConcurrency <= 4`, `deviceMemory`, screen size), plus drei `PerformanceMonitor` for runtime downgrades. Input: GSAP Observer, mouse parallax, gyroscope parallax on mobile, auto-glance toward doors, and keyboard navigation (arrows, space, PageUp/PageDown). Unlocks are stored in localStorage — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- Self-reported awards: GSAP SOTD + GSAP Showcase, FWA of the Day, CSSDA Special Kudos + 3 Public Choice, Orpetron SOTD — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)

**6. Stas Bondar — stabondar.com (2025)**
- Named GSAP Site of the Week and Site of the Month. Stack: Astro (partial hydration), GSAP (SplitText, quickTo), three.js, and Barba.js page transitions. Features physics-driven text and a 3D cube showing awards. Responsive column logic is set per breakpoint — [Codrops, Mar 25 2025](https://tympanus.net/codrops/2025/03/25/stas-bondar-25-the-code-techniques-behind-a-next-level-portfolio/)

**7. Henry Heffernan — henryheffernan.com**
- Repo henryjeff/portfolio-website: MIT, about 2.6k stars, 207 commits. Built with `npm run build` and served with Express. The README names no framework or 3D library — [GitHub](https://github.com/henryjeff/portfolio-website)
- Others cite it as the source of the camera-controls and iframe-in-3D-screen technique, and fork it — [three.js forum](https://discourse.threejs.org/t/3d-portfolio-inspired-by-henry-heffernans-portfolio/84457); [omnisroot/yay](https://github.com/omnisroot/yay)

**8. Robin Payot**
- Paris freelance creative developer who previously worked at UNIT9, 84.Paris and Upperquad. His 2021 portfolio won SOTD on Awwwards and FWA. He later used R3F and TSL on a 3D game project — [Codrops spotlight, Jun 12 2025](https://tympanus.net/codrops/2025/06/12/developer-spotlight-robin-payot/)
- Portfolio 2022: Awwwards SOTD, 7.52 — [Awwwards](https://www.awwwards.com/sites/robin-payot-portfolio-2022)

**9. Jesse Zhou — jesse-zhou.com**
- Tutorial authors credit his GitHub "Ramen-Shop" scene (github.com/enderh3art/Ramen-Shop) as the model source for look-alike portfolios. He is also described as a Three.js Bootcamp instructor — [Medium](https://medium.com/@harshadwani/quickly-create-a-3-d-interactive-responsive-portfolio-website-c1c6ef6c715d)

**10–12. Federico Pian, Mathis Biabiany, Minh Pham**
- Federico Pian says he won his first Awwwards SOTD with his geometry-inspired 2024 portfolio — [Codrops, Oct 2 2024](https://tympanus.net/codrops/2024/10/02/case-study-federico-pian-portfolio-2024/)
- Mathis Biabiany announced a new portfolio on the three.js forum. Not reviewed — [three.js forum](https://discourse.threejs.org/t/mathis-biabiany-new-portfolio/93340)
- Minh Pham's portfolio, developed by Hon Tran, uses GSAP + three.js and won Awwwards SOTD (7.37, dev 7.77) — [hontran.dev](https://www.hontran.dev/blog/minh-pham-portfolio-case-study)

**Awwwards portfolio SOTDs in 2025** (3D use not confirmed per site): Gianluca Gradogna (Jan 23), Olha Lazarieva (Oct 2), Elliott Mangham (Dec 2), Artiom Yakushev (Dec 27) — [Awwwards portfolio winners](https://www.awwwards.com/inspiration_search/winner_category_portfolio/)

### Inferences
- The 2025–26 trend is three.js r17x+ with WebGPU through TSL and an automatic WebGL fallback (Bruno Simon, Giulio), or a custom WebGPU engine with a 2D-canvas fallback (Laxenaire).
- The standard asset pipeline is Blender → glTF → gltf-transform → Draco/KTX2. The one exception is line-art textures, where WebP looked better (itomdev).
- GSAP (ScrollTrigger + Observer) with Lenis is the de facto choreography layer. No reviewed site used Theatre.js.
- For the final top 10, the strongest documented personal picks are Bruno Simon, Laxenaire, Giulio, Santamaria, itomdev, Stas Bondar, Henry Heffernan and Robin Payot.

### Gaps
- I could not verify any Awwwards award for folio-2025, Henry Heffernan, Jesse Zhou, Giulio Collesei, Joseph Santamaria or Martin Laxenaire. Check each site's Awwwards page manually.
- I found no sources on "Lusion staff" personal portfolios or Joshua Bergamini. Both remain unverified.
- The physics engine in folio-2025 is not named in the case study. The 2019 version is commonly said to use cannon.js, but I did not verify that here.
- No reviewed source mentions Webby or CSSDA wins except itomdev's self-report.
- Hosting is not stated for any site except Henry Heffernan's (Express server).
- I did not check whether every site is still live in Nov 2026.

## Which ones use narrative, a character/avatar of the owner, day/night or time-based journeys, warm cinematic lighting, or first/third-person camera shifts?

### Takeaway
Giulio Collesei's site is the strongest fit. It has a rigged owner-avatar, film-scene narrative, neon-rain lighting and a camera that glides to an isolated avatar for About. Bruno Simon has a third-person vehicle, weather and seasons. Joseph Santamaria has a single-take, scroll-driven cinematic journey with palette and lighting shifts.

### Cited Findings
- Giulio: an android avatar with poses per section and hover reactions. The camera glides as the world dissolves, leaving the avatar under a spotlight. Rain and neon puddles in a Blade Runner opening. A DeLorean finale with an echoing soundtrack — [Codrops](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/)
- Bruno Simon: third-person car driving, a weather and season system, and spatialized sound — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- Santamaria: lighting goes from an "early morning underwater city" hero to deep red rose fields and then lava. An astronaut figure stands in for the owner (owner identity UNVERIFIED). Scroll acts as a camera dolly — [Codrops](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)
- itomdev: first-person walk through a corridor and rooms, with the camera auto-turning toward doors — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- Laxenaire: game progression and unlocks instead of a story; light/dark theme shifts the palette — [Codrops](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/)

### Inferences
- Reusable pattern: build the owner as a rigged Blender avatar with NLA-pushed actions in glTF, and trigger pose blends from UI hovers (Giulio).
- Reusable pattern: use Blender curves exported as point lists for camera or vehicle splines (Giulio).
- A day/night or time-of-day journey is rare in the verified set. Bruno Simon's weather and seasons is the closest.

### Gaps
- I found no verified portfolio with a real-clock day/night system, or with an explicit first-person to third-person camera switch.

## Which publish their source and detailed technical breakdowns?

### Takeaway
Bruno Simon (folio-2025), Martin Laxenaire (portfolio-2025), Tomasz Szmajda (portfolio-itom) and Henry Heffernan (portfolio-website) have public repos. Bruno, Laxenaire, Giulio, Santamaria, Szmajda and Stas Bondar have detailed write-ups.

### Cited Findings
- github.com/brunosimon/folio-2025 (MIT). Write-up: [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html). The original 2019 case study is on [Medium](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)
- github.com/martinlaxenaire/portfolio-2025, plus gpu-curtains and color-palette-generator on npm — [Codrops](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/)
- github.com/ITomPoland/portfolio-itom — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- github.com/henryjeff/portfolio-website (MIT) — [GitHub](https://github.com/henryjeff/portfolio-website)
- Write-ups with no repo stated: Giulio, Santamaria, Stas Bondar (Codrops links above). Federico Pian — [Codrops](https://tympanus.net/codrops/2024/10/02/case-study-federico-pian-portfolio-2024/)

### Inferences
- Laxenaire and itomdev give the most copy-ready code: QualityManager/FPSWatcher, PaintRevealMaterial and corridor chunking.

### Gaps
- I did not find any conference talks, or X/LinkedIn build threads, for these sites.

## What mobile/low-power fallbacks and accessibility do they offer?

### Takeaway
The common pattern is tiered quality chosen at load time, plus FPS-driven downgrades at runtime and pausing off-screen rendering. Accessibility is usually limited to multi-input support (keyboard, touch, gamepad) and Lenis smooth scrolling. No reviewed source documents reduced-motion or screen-reader support in detail.

### Cited Findings
- Bruno Simon: automatic mobile preset (no water blur or DOF, lower shadow-map resolution). WebGPU when available. Keyboard, touch and gamepad input. The UI avoids HTML "as much as possible". The 2019 Developer Award gave it 7.00 for accessibility — [case study](https://www.awwwards.com/brunos-portfolio-case-study.html); [Awwwards](https://www.awwwards.com/sites/bruno-simon-portfolio)
- Laxenaire: 2D-canvas fallbacks for every WebGPU scene, a 0–10 adaptive QualityManager, a pause on hidden tabs, a skippable game and a basic accessibility pass — [Codrops](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/)
- itomdev: device tiering (fewer preloads and no warm-up on weak devices), drei PerformanceMonitor, keyboard navigation and gyroscope parallax. Claimed 60 fps on phones — [Codrops](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- Santamaria: atmospheric passes at low resolution on mobile, KTX2, instancing and camera-path culling — [Codrops](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)
- Giulio: TSL with a WebGL fallback, textures capped at 1024px, KTX2, and off-screen scenes paused — [Codrops](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/)

### Inferences
- Best combined recipe: device tiering at load, an FPS-based QualityManager at runtime, a 2D or static fallback when WebGPU/WebGL is missing, keyboard navigation, and a "skip experience" path to plain content.

### Gaps
- No source confirmed `prefers-reduced-motion` handling or an HTML-only alternate site for any candidate.
