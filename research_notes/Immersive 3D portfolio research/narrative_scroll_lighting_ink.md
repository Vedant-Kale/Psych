# Narrative Scroll-Driven Real-Time 3D Sites: Cinematic Lighting and Ink/NPR Rendering (late 2026)

Research date: 2026-11-24. Codrops (tympanus.net) returned HTTP 403 to direct fetches, so Codrops findings come from search-result snippets unless noted. Items marked **[unverified]** come from secondary sources or memory and were not confirmed against a primary source in this session.

## Q1. How do top sites choreograph a single persistent camera across many scenes while keeping load times low (scene streaming, lazy loading, LOD)?

### Takeaway
The best-documented 2025–2026 examples use one canvas and a spline/authored camera path driven by scroll (GSAP ScrollTrigger or Theatre.js), render only the scenes whose scroll range is active, and keep payload low with custom exporters, procedural/real-time content instead of video, background shader compilation, device tiers, and aggressive memory management. Shader.se (2026, WebGPU), Igloo Inc (Abeto, 2024 Site of the Year), Lusion's Oryzo (spline camera + Gaussian splats) and Shopify Editions Spring '26 are the strongest documented references.

### Cited Findings

**Igloo Inc (igloo.inc) — Abeto, with Bureaux**
- Awwwards 2024 Site of the Year and Developer Site of the Year — [Awwwards SOTY 2024](https://www.awwwards.com/annual-awards-2024/site-of-the-year); [Developer SOTY 2024](https://awwwards.com/annual-awards-2024/developer-site-of-the-year)
- Studio Abeto; partner Bureaux supplied moodboards, renders, 3D assets, music/SFX; client is Pudgy Penguins' parent company — [Awwwards case study](https://awwwards.com/igloo-inc-case-study.html)
- Stack: Three.js, three-mesh-bvh, Svelte, GSAP, Vite, vanilla JS. UI is rendered in WebGL, not HTML/CSS — [Awwwards case study](https://awwwards.com/igloo-inc-case-study.html)
- Asset pipeline: Houdini + Blender; custom procedural growth algorithm generates ice blocks from cubes/cylinders; custom VDB-to-browser volume exporter, compressed "smaller than a typical website image"; custom geometry exporters — [Awwwards case study](https://awwwards.com/igloo-inc-case-study.html)
- Scene transitions: chromatic aberration + "tech displacement" + frost effect; particle sim changes colour with speed and glows during transitions; text scramble by offsetting an SDF texture — [Awwwards case study](https://awwwards.com/igloo-inc-case-study.html)
- Load strategy: intro rendered in real time rather than pre-rendered video to save size; textures load and shaders compile during the initial load and in the background; continuous perf measurement with low-end device adjustments — [Awwwards case study](https://awwwards.com/igloo-inc-case-study.html)

**Shader.se — "80s Business Tech" scroll-driven WebGPU pipeline (Codrops, May 2026)**
- Scenes render in reverse order so each passes its texture forward to the previous scene (enabling seamless scene-to-scene transitions); any scene whose scroll progress is out of range is skipped entirely — [Codrops (snippet)](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)
- Full stack details not retrievable (403) — see Gaps.

**Lusion — Oryzo (scroll campaign site, 7-part BTS blog)**
- Linear scrolling site; camera follows a spline — [Lusion blog Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics)
- Real-time PBR was tested and rejected as below target quality; instead Houdini scene → Redshift renders of many views → COLMAP export (GSOPs) → Gaussian splat training (Postshot; Lichtfeld Studio tested) → scene split into several splats composited in WebGL — [Lusion blog Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics)
- Splat budget: ~78,233 splats desktop vs ~44,683 mobile; a 900k-splat full-scene test still had flaws, so splats are used only for props/reflections in a hybrid — [Lusion blog Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics)
- Training cameras placed on hemisphere/sphere, not on the scroll spline (spline gave too many near-duplicate frames) — [Lusion blog Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics)
- Texture budget trick: shader pass gives central 50% of desk ~90% of texture detail since camera focuses there — [Lusion blog Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics)
- Series parts 4–7 are titled "WebGL/ThreeJS Tricks 1–4" (not read here) — [Lusion blog Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics)

**Shopify Editions Spring '26 "Everywhere" (Codrops, June 2026)**
- Built with Three.js + R3F; each section is up to 6 offscreen buffers composited every frame — [team thread](https://en.rattibha.com/thread/2069804262062752183)
- A single runtime "tier" is the main perf knob: Tier 0 static fallbacks up to Tier 3 full desktop quality — [Codrops (snippet)](https://tympanus.net/codrops/2026/06/26/engineering-the-web-experience-behind-shopifys-spring-26-edition-everywhere/)
- Winter '26 edition: only a thin mention of streaming the main canvas to a popup via WebRTC — [team thread](https://en.rattibha.com/thread/2069804262062752183). Studio credits for Editions not found; no link to Active Theory or 14islands found.

**Messenger — Abeto (Sept 2025, browser multiplayer game on a tiny planet)**
- Stack: Three.js, three-mesh-bvh, vanilla JS, C++ (WASM); glyphs generated with WebAssembly and rendered on GPU, no MSDF fonts — [Awwwards case study](https://www.awwwards.com/messenger.html)
- World modeled as an unwrapped cube converted to a sphere — [Awwwards case study](https://www.awwwards.com/messenger.html)
- Custom 4-level LOD preserving silhouette to reduce popping; assets tracked and freed as soon as unneeded because iPhone Safari kills pages over memory limits; custom tools split/compress models and textures; character updates "dripped" in over time — [Awwwards case study](https://www.awwwards.com/messenger.html)
- Released Sept 2025; viral again June 2026 — [daily.dev](https://app.daily.dev/tags/threejs/best-of/2025/09); [Game*Spark](https://www.gamespark.jp/article/2026/06/16/168037.html)

**Tutorials for camera choreography**
- "How to Build Cinematic 3D Scroll Experiences with GSAP" (Nov 2025): ScrollTrigger + ScrollSmoother + SplitText, scroll-controlled moving camera — [Codrops](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/); code: [GitHub](https://github.com/JosephASG/codrops-cinematic-scroll-animations)
- Scroll-driven 3D gallery using a camera path authored in Blender, Three.js + GSAP — [Codrops](https://tympanus.net/codrops/?p=117076)
- "Animate a Camera Fly-through on Scroll Using Theatre.js and React Three Fiber" — [Codrops](https://tympanus.net/codrops/?p=70449)
- Forum thread on switching multiple views/scenes on scroll — [three.js forum](https://discourse.threejs.org/t/switching-between-multiple-views-scenes-on-scroll/58038)
- Crafting Scroll Based Animations in Three.js (2022, outdated baseline) — [Codrops](https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/)

### Inferences
- Common pattern: one renderer, one camera on a spline (Blender-authored or Theatre.js-keyed), scroll progress → `t` on the curve; each "scene" is a render target only drawn while its scroll window is active, and transitions are full-screen shaders mixing adjacent scene textures (Shader.se, Igloo).
- Load-time control is mostly custom: proprietary exporters, compressed volumes, procedural generation, background shader compile, device tiers, plus memory release for iOS. Off-the-shelf equivalents: glTF + Draco/meshopt + KTX2, `renderer.compileAsync`, drei `PerformanceMonitor`/`AdaptiveDpr` [unverified for this session].
- Gaussian splats are now a production tool for "baked photoreal" pieces in scroll sites (Lusion Oryzo), used in a hybrid with meshes, with separate mobile budgets.

### Gaps
- Shader.se and Shopify Spring '26 full Codrops write-ups could not be fetched (403); stack details (three.js version, Lenis vs ScrollSmoother, asset formats) unconfirmed.
- No primary documentation found for Active Theory, Resn or 14islands 2025–2026 scroll scenes. Apple-style scroll scenes typically use image-sequence/video scrubbing rather than real-time 3D [unverified; not researched here].
- Lusion Oryzo "WebGL/ThreeJS Tricks" parts 4–7 not read; Oryzo URL/awards not confirmed.

## Q2. What are the proven techniques for realistic lighting in the browser on modest GPUs (baked lightmaps, light probes, HDRI, postprocessing library choices)? Includes time-of-day.

### Takeaway
Top studios avoid real-time lighting on the main path: they bake (lightmaps, AO, matcaps, or offline renders turned into Gaussian splats) and add a thin post stack. For time-of-day, the documented cheap levers are a global colour atlas/palette swap (Messenger) and blending matcaps/lightmaps/env maps with a scroll-driven factor. No primary write-up of a scroll-driven dusk-to-dawn lightmap blend was found.

### Cited Findings
- Lusion (MaxMara "Bearing Gifts"): no real-time lighting at all so it runs on every device; everything is matcap or prebaked; prebaked AO called the easiest quality win. Awwwards + FWA Site of the Day — [Lusion work page (snippet)](https://v2.lusion.co/work/maxmara-bearing-gifts)
- Lusion Oryzo: real-time PBR tested and rejected; lighting comes from offline Redshift renders baked into splats — [Lusion blog Part 2](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics)
- Crosswire (Codrops 2023): matcaps as a baked lighting model; one matcap was not enough, so they faded between multiple matcaps as the camera moved — a cheap "lighting changes along the camera path" technique — [Codrops Case Study: Crosswire](https://tympanus.net/codrops/2023/04/04/case-study-crosswire/)
- Messenger: every colour comes from a 16×16 pixel colour atlas, so the whole world's lighting/mood can be changed at once — a direct time-of-day lever — [Awwwards case study](https://www.awwwards.com/messenger.html)
- Day/night blending: forum advice shows hard texture swap for day/night GLTF textures; shader mix of day/night textures with soft blend recommended; cosine "day factor" lerping ambient colour and light intensity — [webglfundamentals Q&A](https://webglfundamentals.org/webgl/lessons/webgl-qna-show-a-night-view-vs-a-day-view-on-a-3d-earth-sphere.html); [UT course project](https://courses.cs.ut.ee/2024/cg/fall/Main/Project-DynamicDayNightCycle); [three.js forum: transition environment texture](https://discourse.threejs.org/t/smoothly-transition-environment-texture/75158)
- three.js ships `ProgressiveLightMap` (examples/jsm/misc) for in-browser lightmap accumulation — [unpkg three@0.166.1](https://unpkg.com/browse/three@0.166.1/examples/jsm/misc/ProgressiveLightMap.js)
- Baked-lighting lesson (Blender bake → three.js) — [Three.js Journey lesson 38](https://threejs-journey.com/lessons/38) [content not read; title/number from search]
- The Sleepers (Codrops, July 2026): Bruno Simon three.js challenge entry; aims for atmosphere with simplest techniques — swirling intro transition from a B/W texture, animated fog, mesh outlines, infinite worlds — [Codrops (snippet)](https://tympanus.net/codrops/2026/07/10/the-sleepers-creating-an-atmospheric-webgl-experience-with-lightweight-techniques/)
- Cheap fog: distance/depth-based fog colour mix; linear fog in vertex shader for perf — [WebGLFundamentals fog](https://webglfundamentals.org/webgl/lessons/webgl-fog.html); [DEV dunes terrain](https://dev.to/keaukraine/rendering-dunes-terrain-in-webgl-30k2)

**Postprocessing choices**
- N8AO works with pmndrs/postprocessing (needs a RenderPass first); forum user reports the pmndrs build is "night and day" faster than the three/jsm EffectComposer build; `halfRes` mode for perf; transparent objects rendered twice; quality presets performance→ultra — [n8ao npm](https://npmjs.com/package/n8ao); [three.js forum SSAO thread](https://discourse.threejs.org/t/best-ssao-that-is-on-par-with-sketchfab-quality-performance/54284.md); [angular-three N8AO ref](https://angularthree.netlify.app/reference/postprocessing/n8ao)
- Known N8AO issue: circular artefacts on sky domes — [three.js forum](https://discourse.threejs.org/t/n8ao-causing-circular-artefacts-in-the-sky/88233)
- WebGPURenderer has its own TSL node post stack (bloom node, new DOF, SSGI, SSS) — [three.js manual: WebGPU post-processing](https://threejs.org/manual/en/webgpu-postprocessing)
- Per a secondary skill doc: `PostProcessing` renamed `RenderPipeline` in r183 (old name deprecated wrapper); DOF API rewritten in r181 — [third-party TSL doc](https://cdn.jsdelivr.net/npm/claude-code-skills@0.5.0/data/skills/webgpu-threejs-tsl/docs/post-processing.md) **[unverified against official release notes]**
- WebGPU bloom grain issue reported on forum — [three.js forum](https://discourse.threejs.org/t/how-to-remove-webgpu-bloomnode-grain/72711)

### Inferences
- Recommended modest-GPU recipe: bake GI + AO in Blender (or render offline to splats for hero props), KTX2 textures, HDRI/PMREM env only for reflections, one post stack (pmndrs/postprocessing on WebGL; TSL nodes on WebGPU) with bloom + tone mapping + vignette/grain, N8AO at half res only on high tiers, DOF only on desktop tier.
- Dusk-to-dawn on scroll: bake 2–3 lightmap/matcap sets (e.g. day, golden hour, night), mix in a custom shader by a scroll factor; lerp sky/fog colour, env intensity, exposure and bloom threshold in parallel; or palette-swap a colour atlas (Messenger approach) for stylised looks. This is synthesis, not a documented recipe.

### Gaps
- drei `AccumulativeShadows`, `Lightformer`, `Environment` costs: no source returned this session.
- No primary case study found of a scroll-driven dusk-to-dawn lightmap blend on an award site.
- Lusion's own studio site awards: search hinted FWA/Awwwards/CSSDA Site of the Year — [Awwwards Lusion case study (snippet)](https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html) — year not confirmed **[unverified]**.
- Volumetric haze/light shafts in production sites: not specifically documented here beyond fog.

## Q3. What open-source ink/sketch/line-art shaders and "sketch to photoreal" transition effects exist?

### Takeaway
The canonical web references are Maxime Heckel's Moebius post-process (Sobel on depth + normals, luma-threshold hatching, sine/hash wobble; open source) and Codrops' Sketchy Pencil Effect (2022). Production examples include Messenger's custom outline system and The Sleepers' mesh outlines. No ready-made "drawing becomes real" tutorial was found; it is built by rendering both a line pass and a shaded pass and dissolving between them with a noise mask.

### Cited Findings
- Maxime Heckel, "Moebius-style post-processing and other stylized shaders" (Mar 26, 2024, updated Aug 5, 2024): custom `MoebiusPass` extending postprocessing's `Pass`, wired via drei `Effects` (because `@react-three/postprocessing` lacked custom-pass support); FullScreenQuad from three-stdlib; depth via `useFBO({depthBuffer:true})`; normals via `scene.overrideMaterial`; Sobel 3×3 on depth + normal luma, depth weighted ×25 to catch inner outlines; hatching by luma thresholds (tonal, raster dots, crosshatch with `mod`); Blinn-Phong specular in normal material so Sobel outlines highlights; diffuse in alpha; outline wobble via sin/cos displacement × hash at ~0.08 frequency — [blog.maximeheckel.com](https://blog.maximeheckel.com/posts/moebius-style-post-processing)
  - Demo: r3f.maximeheckel.com/moebius; source: github.com/maximeheckel/blog.maximeheckel.com — [same article](https://blog.maximeheckel.com/posts/moebius-style-post-processing)
- Heckel's related posts: "On Crafting Painterly Shaders" (Kuwahara-style painterly) and "Post-Processing Shaders as a Creative Medium" — [painterly](https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders); [creative medium](https://blog.maximeheckel.com/posts/post-processing-as-a-creative-medium/)
- Codrops "Sketchy Pencil Effect with Three.js Post-Processing" (Nov 2022, Maya Nedeljković): Sobel edge detection + pencil texture — [Codrops](https://tympanus.net/codrops/2022/11/29/sketchy-pencil-effect-with-three-js-post-processing/)
- Messenger: custom outline system with adjustable thickness/colour/transparency for the hand-drawn look — [Awwwards case study](https://www.awwwards.com/messenger.html)
- Common ancestor of Moebius ports: UselessGameDev video; Godot ports (Moebius shader; outline + hatching) — [Godot Shaders](https://godotshaders.com/shader/moebius-shader/); [Godot outline+hatching](https://godotshaders.com/shader/mobius-outline-hatching/)
- Transition building blocks:
  - Render model twice (solid + wireframe) and blend in a shader with animated transition (Aug 2025) — [Codrops Blended Material Shader](https://tympanus.net/codrops/2025/08/12/building-a-blended-material-shader-in-webgl-with-solid-js/)
  - Dual-scene fluid X-ray reveal (Mar 2026) — two scenes revealed by a fluid mask — [Codrops](https://tympanus.net/codrops/2026/03/23/building-a-dual-scene-fluid-x-ray-reveal-effect-in-three-js/)
  - Flame dissolve shader (threshold noise dissolve) — [Patreon](https://www.patreon.com/posts/create-flame-and-75059938)
  - Texture-driven swirl transition (The Sleepers) — [Codrops](https://tympanus.net/codrops/2026/07/10/the-sleepers-creating-an-atmospheric-webgl-experience-with-lightweight-techniques/)
  - Risograph grain light effect — [Codrops](https://tympanus.net/codrops/?p=58657)
- Repos: [rwchampin/sketch-threejs](https://github.com/rwchampin/sketch-threejs); [3d-game-shaders-for-beginners three.js port](https://github.com/seelingzheng/3d-game-shaders-for-beginners) (contents not inspected)

### Inferences
- "Drawing becomes real" recipe: (1) line pass = Sobel on depth/normals (Heckel) on paper-coloured background, optional hatching; (2) shaded pass = baked/PBR render; (3) composite `mix(lineArt, shaded, smoothstep(t-w, t+w, noise(uv)+gradient))` with `t` from scroll, adding an ink-bleed edge colour in the threshold band. Variant: object-space reveal using world-position height or distance from a point as the mask. Synthesis, untested.
- Outline approach choice: post-process Sobel (whole-scene, cheap per object, needs depth+normal buffers) vs inverted-hull per mesh (cheap, no extra buffers, silhouette only) vs custom geometry lines (Messenger). Heckel's normal-buffer pass doubles scene draws; on mobile consider deriving normals from depth or using MRT on WebGPU.

### Gaps
- No public "sketch to photoreal" scroll site with a write-up was found.
- Heckel's Moebius article is pre-TSL (WebGL/GLSL); no TSL/WebGPU port verified.

## Q4. What does WebGPU change in 2025–2026 for these effects, and is it production-ready on mobile Safari/Chrome?

### Takeaway
WebGPU is now in all major browsers (Safari 26 on iOS/iPadOS/macOS/visionOS since late 2025), and three.js WebGPURenderer + TSL is used in production (Shader.se 2026). But iOS 26.0–26.2 had a WebGPU bug serious enough that the Construct engine disabled WebGPU on iOS; a fix was expected in iOS 26.4. Production sites still ship WebGL fallbacks and device tiers.

### Cited Findings
- WebGPU supported in all major browsers; Safari 26 ships it on macOS Tahoe 26, iOS 26, iPadOS 26, visionOS 26 — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers)
- Construct team found WebGPU on iOS 26.0.1 "completely unusable" and fell back to WebGL; still reproducing on iOS 26.2 (Jan 2026); WebKit comment (Feb 2026) says resolved in iOS 26.4 beta 1 — [WebKit Bugzilla 301627](https://bugs.webkit.org/show_bug.cgi?id=301627). Fix in shipping release not confirmed.
- three.js WebGPURenderer falls back automatically to WebGL 2 — [three.js manual: WebGPURenderer](https://threejs.org/manual/en/webgpurenderer); secondary: [vr.org (May 2026)](https://vr.org/articles/webgpu-baseline-2026-three-js-webxr-default) (opinion-heavy)
- New-renderer-only post effects: better DoF, SSGI, SSS — [three.js manual](https://threejs.org/manual/en/webgpu-postprocessing)
- Shader.se 2026 multi-scene scroll pipeline built on WebGPU — [Codrops (snippet)](https://tympanus.net/codrops/2026/05/19/80s-business-tech-seamless-scene-transitions-inside-shader-ses-scroll-driven-webgpu-pipeline/)
- Codrops "Exploring Procedural Geometry with Three.js and WebGPU" (Aug 2026) — [Codrops](https://tympanus.net/codrops/2026/08/11/exploring-procedural-geometry-with-three-js-and-webgpu/)
- Advanced TSL/WebGPU rendering reference repo — [Makio64/advanced-threejs-tsl-webgpu-rendering](https://github.com/Makio64/advanced-threejs-tsl-webgpu-rendering)
- 2024 Codrops called WebGPURenderer "not fully production-ready yet" (outdated signal) — [Codrops BatchedMesh + WebGPURenderer](https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/)
- Third-party docs advise pinning three.js version since TSL is under active development; API renames in r181/r183 — [skills.sh threejs-impl-webgpu](https://skills.sh/openaec-foundation/three.js-claude-skill-package/threejs-impl-webgpu) **[unverified]**
- Igloo Inc and Messenger (Abeto) both shipped on WebGL Three.js, not WebGPU — [Igloo case study](https://awwwards.com/igloo-inc-case-study.html); [Messenger case study](https://www.awwwards.com/messenger.html)

### Inferences
- WebGPU's practical gains for this brief: compute shaders (particles, fluid, splat sorting), MRT G-buffers for cheaper depth+normal outline passes, TSL node post stack with SSGI/DOF, and one shader source compiled to WGSL or GLSL.
- Production stance for late 2026: write in TSL with WebGPURenderer (auto WebGL2 fallback), pin the three.js version, keep device tiers, and test on real iOS 26.4+ devices. For a portfolio, plain WebGL + pmndrs/postprocessing remains the lower-risk path; most award winners cited still use WebGL.

### Gaps
- No 2026 mobile WebGPU performance benchmarks found.
- Chrome Android WebGPU device coverage not confirmed this session.
- Official three.js release notes for r181/r183 API changes not checked.
