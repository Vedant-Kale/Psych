# Realistic 3D capture of a person (Gaussian splats / scans) for a web portfolio — status late 2026

Research date: 2026-11-24. Items marked **[UNVERIFIED]** come from training knowledge or secondary aggregators and were not confirmed on an official page during this session.

## Q1. Which renderer is the best choice to combine a human splat with a three.js / R3F scene with custom lighting and post-processing?

### Takeaway
Spark (sparkjs.dev, World Labs, MIT) is the strongest choice for a three.js/R3F portfolio in late 2026: actively developed (v2.0 April 2026, examples now on 2.4.0), WebGL2 (broad device reach), reads every common format, mixes splats with normal meshes, has an official R3F starter, and offers per-splat GPU shader hooks (dyno) plus a `recolor` tint for grading. three.js r186 (Sept 2026) now has native splats, but they need WebGPURenderer and have no LoD — a good second option if the project already uses WebGPU/TSL. mkkellogg GaussianSplats3D is no longer actively developed; do not start new work on it.

### Cited Findings

**Spark (sparkjsdev/spark, World Labs)**
- Described as "an advanced 3D Gaussian Splatting renderer for THREE.js"; can "integrate in your scene with other meshes and splats"; "programmable dynamic splat effects"; has Level-of-Detail docs and a 0.1 to 2.0 migration guide — [sparkjs.dev](https://sparkjs.dev/)
- README: MIT licence; formats PLY (including compressed PLY), SPZ, SPLAT, KSPLAT, SOG; fuses splat and mesh objects in the THREE.js pipeline; renders multiple splat objects with correct sorting; real-time splat colour editing; shader-graph system for editing splats on the GPU; examples use three.js 0.180.0 and Spark 2.4.0; "renders fast even on low-powered mobile devices"; targets "98%+ WebGL2 support" — [Spark README](https://raw.githubusercontent.com/sparkjsdev/spark/main/README.md)
- Spark 2.0 released 14 April 2026. WebGL2 only (the post calls WebGL2 "the only 3D web API that is almost guaranteed to run on every device today"). Continuous LoD via per-object "LoD splat tree"; per-frame splat budget of 500K–2.5M splats depending on device type; traversal in Rust→WASM in a Web Worker; new streamable `.RAD` format (64K-splat chunks, coarse version appears almost immediately); fixed 16M-splat GPU page pool with LRU eviction — [World Labs blog: Spark 2.0](https://worldlabs.ai/blog/spark-2.0)
- Sorting: GPU computes splat distances, reads back to CPU, two-pass radix sort in a background Web Worker; single instanced draw call — [World Labs blog](https://worldlabs.ai/blog/spark-2.0)
- Radiance Fields described Spark 2.0 as a developer preview largely backward compatible with 0.1, and mentions a later v2.2.0 — [Radiance Fields](https://radiancefields.com/world-labs-previews-spark-2.0). CGWorld lists the licence as MIT — [CGWorld](https://cgworld.jp/flashnews/01-202605-Spark20.html)
- Official R3F starter `spark-react-r3f`: camera with CameraControls, a `SparkRenderer` and a `SplatMesh`, registered via R3F `extend`; Next.js and React Router starters also exist — [spark-react-r3f](https://github.com/sparkjsdev/spark-react-r3f), [spark-react-nextjs](https://github.com/sparkjsdev/spark-react-nextjs)
- `SplatMesh` has `recolor` (THREE.Color tint multiplied into every splat, default white) and `opacity`; per-splat edits via dyno `objectModifier`/`worldModifier`, then `splatMesh.updateGenerator()`; dyno graphs are written in JS/TS and compiled to GLSL — [Spark SplatMesh docs](https://sparkjs.dev/docs/splat-mesh/)
- A 2026 guide lists Spark as "actively developed by World Labs; recommended for production" — [Utsubo guide, updated 24 Sept 2026](https://www.utsubo.com/blog/gaussian-splatting-guide)

**three.js native splats (r186)**
- three.js r186 (released ~8 Sept 2026) adds a built-in `GaussianSplat` mesh type and loaders: `SPZLoader` (recommended, v4 zstd), `GaussianSplatPLYLoader`, `KSPLATLoader`, `SPLATLoader`, glTF `KHR_gaussian_splatting`. "GaussianSplat needs WebGPURenderer"; compute-shader depth sort every frame; extends `THREE.Mesh` (transforms, raycasting work). SOG not mentioned. No LoD streaming or culling — built for single object/room scale — [Ben Houston, 7 Sept 2026](https://ben3d.ca/blog/how-to-use-threejs-native-gaussian-splats)
- Conflict: a forum showcase using the r186 native renderer says it "recommends WebGPU and falls back to WebGL2" — [three.js forum, northprint, 16 Sept 2026](https://discourse.threejs.org/t/two-gunpla-scanned-as-3d-gaussian-splats-relit-inside-a-three-js-city/94407.md). Treat WebGL2 fallback as unconfirmed.
- Another three.js add-on announced: "Gaussian Splat Lite 1.0: WebGPU, Streaming LOD and Depth Rendering for Three.js" — [three.js forum](https://discourse.threejs.org/t/gaussian-splat-lite-1-0-webgpu-streaming-lod-and-depth-rendering-for-three-js/94234) (not evaluated)

**mkkellogg GaussianSplats3D — DEPRECATED for new work**
- README: "no longer in active development"; author recommends Spark. MIT. Formats: .ply, .splat, .ksplat. Can share a three.js scene (`threeScene`) or be a `DropInViewer`, but only opaque, depth-writing objects mix reliably (no transparent objects). Known issues: "Sub-optimal performance on mobile devices", GPU sort disabled on mobile, CPU sort artifacts on fast camera moves — [GitHub](https://github.com/mkkellogg/GaussianSplats3D)

**drei `<Splat>`**
- drei's splat issues are mostly closed (scale, .ksplat, quality vs mkkellogg viewer, Android GPU); current drei work centres on v11 / R3F 10 alpha — [pmndrs/drei issues](https://github.com/pmndrs/drei/issues?q=splat). Quality and format coverage lag Spark **[inference from issue list]**.

**PlayCanvas / SuperSplat**
- SuperSplat: PlayCanvas engine (WebGL, WebGPU), MIT, imports PLY/SPZ/SOG/SPLAT/KSPLAT — [Utsubo guide](https://www.utsubo.com/blog/gaussian-splatting-guide). PlayCanvas engine itself MIT **[UNVERIFIED this session]**. Not three.js; would replace the R3F stack. PlayCanvas engine reportedly added dynamic LOD/streaming of splats — [Babylon forum mention](https://forum.babylonjs.com/t/the-future-of-gs-in-bbl/60666)

**Babylon.js**
- Babylon 8.0 added SPZ and compressed PLY, spherical harmonics, memory/CPU/GPU optimisations — [Windows Developer blog](https://blogs.windows.com/windowsdeveloper/2025/03/31/part-2-babylon-js-8-0-audio-gaussian-splat-and-physics-updates/); Apache 2.0, WebGL+WebGPU, PLY/SPLAT/SPZ/SOG — [Utsubo](https://www.utsubo.com/blog/gaussian-splatting-guide). Reports of WebGPU splat rendering broken in 8.3.1 — [Babylon forum](https://forum.babylonjs.com/t/new-feature-niantic-spz-gaussian-splatting-and-spherical-harmonics/55124). Not three.js.

**gsplat.js (Hugging Face)**
- MIT, not archived, 62 commits, empty Releases; formats .ply, .splat (no SH). Standalone (three.js-like API, not three.js) — [GitHub](https://github.com/huggingface/gsplat.js/). Low activity; treat as dormant **[inference]**.

**Luma web library**
- Luma's library says Luma splats can illuminate three.js scenes; has an R3F example via `LumaSplatsThree` — [luma-web-library](https://github.com/lumalabs/luma-web-library). Depends on Luma-hosted captures; Luma has wound down capture products (see Q4). Treat as legacy **[inference]**.

### Inferences
- Recommended stack: R3F + Spark `SparkRenderer`/`SplatMesh` + normal three.js meshes for the room; postprocessing (pmndrs `postprocessing` / drei `EffectComposer`) runs on the final framebuffer so bloom, vignette, grain and LUT grading apply to splats and meshes alike. Splats do not write reliable depth like opaque meshes, so depth-based effects (SSAO, DoF) may treat splats oddly — test early.
- Choose three.js r186 native only if the whole site moves to WebGPURenderer/TSL and the scan is a single small object.

### Gaps
- No measured Spark FPS on a specific mid-range phone found.
- Spark depth-write behaviour with post-processing (DoF/SSAO) not documented in sources fetched.
- Spark latest exact version/date not confirmed from GitHub Releases (2.4.0 inferred from README examples).

## Q2. Can splats be relit or colour-graded to match an amber, low-key lighting scene, and how?

### Takeaway
Standard splats have lighting baked in; they do not respond to three.js lights. Practical options: (1) capture under flat, even light so baking is neutral; (2) grade the splat itself (SuperSplat colour tools before export, Spark `recolor` tint at runtime); (3) write a custom per-splat shader (Spark dyno) for directional/radial "fake" light; (4) grade the whole frame in post. True relighting needs research-grade relightable splats.

### Cited Findings
- SuperSplat 3.0 colour tools: select region, adjust tint, temperature, saturation, brightness, black point, white point, transparency; live preview, then Apply to bake — [search summary of SuperSplat docs/CG Channel](https://www.cgchannel.com/2026/09/playcanvas-releases-supersplat-editor-3-0/)
- Spark `recolor` multiplies a colour into every splat (e.g., an amber tint and lower value for low-key) — [Spark SplatMesh docs](https://sparkjs.dev/docs/splat-mesh/)
- Spark dyno `objectModifier`/`worldModifier` run custom per-splat GPU code (could compute a fall-off from a point light position to darken/warm splats) — [Spark SplatMesh docs](https://sparkjs.dev/docs/splat-mesh/)
- A three.js r186 showcase noted splats "came with baked lighting" and wrote a custom "relight pass" to respond to a dusk key light and fire glow; built a convex hull from splat positions as an invisible shadow caster because splats cast no shadows — [three.js forum, northprint](https://discourse.threejs.org/t/two-gunpla-scanned-as-3d-gaussian-splats-relit-inside-a-three-js-city/94407.md) (technique details not published)
- Luma's library claimed splats could illuminate three.js scenes (splat as light source, not relit splat) — [luma-web-library](https://github.com/lumalabs/luma-web-library)

### Inferences
- For an amber low-key room: capture the person in soft, even, neutral light (no hard shadows); in SuperSplat lower brightness/black point and warm temperature; at runtime set Spark `recolor` to a warm value (~#ffb070-ish scaled down) and add a dyno modifier for a one-sided gradient matching the key light direction; then unify with a global LUT/vignette/grain in post. Add a soft blob or hull shadow under the figure.

### Gaps
- No published, reusable "relight" dyno code for Spark found.
- Relightable splat research (normals/BRDF per splat) not surveyed; not production-ready for web per sources found.

## Q3. What file size and frame rate are realistic on a mid-range phone?

### Takeaway
A cropped, single-person splat of roughly 200K–500K splats compressed to SOG/SPZ lands in the low tens of MB at most (often under ~15 MB) and should hold ~30–60 fps on recent phones with Spark. No hard benchmark for a mid-range phone was found; numbers below are vendor targets.

### Cited Findings
- Uncompressed PLY ~248 bytes/splat, ~250 MB per million splats; SPZ ~10x smaller; SOG ~15–20x smaller. Mobile target: 200K–500K splats, 15–30 MB, 30–45 fps; vendor target under 50 MB for mobile. Targets, not benchmarks — [Utsubo guide](https://www.utsubo.com/blog/gaussian-splatting-guide)
- Spark: most consumer devices render ~1–5M splats at interactive rates; per-frame budget 500K–2.5M by device; mobile browsers cap GPU memory; 10M splats ≈ 2.3 GB PLY vs 200–250 MB SPZ — [World Labs blog](https://worldlabs.ai/blog/spark-2.0)
- SPZ cuts size ~90% (250 MB PLY to ~25 MB) — [Medium student guide](https://medium.com/@Jamesroha/gaussian-splatting-a-complete-student-guide-to-3d-capture-in-2026-1195a6265870)
- Extreme low end: a homepage portrait reduced a 689K-splat PLY to 15K points (importance-sampled by opacity/volume), custom 8-byte packing (~120 KB by calculation), drawn on Canvas 2D; IntersectionObserver pauses off-screen — [Eliseo Martelli, 28 Mar 2026](https://www.eliseomartelli.it/blog/2026-03-28-gaussian-splat-portrait/)
- GaussianSplats3D is sub-optimal on mobile and disables GPU sort there — [GitHub](https://github.com/mkkellogg/GaussianSplats3D)

### Inferences
- Budget: crop to the person in SuperSplat, decimate to ~300K splats, export SOG (or SPZ for three.js native). Expect ~5–15 MB **[estimate from 15–20x SOG ratio on ~75 MB PLY]**. Drop SH bands to SH0/SH1 to save more.
- Lazy-load the splat after the room meshes, show a low-res proxy first (Spark `.RAD` streaming gives a coarse 64K-splat preview).

### Gaps
- No measured FPS on a named mid-range phone (e.g., Pixel 7a, Galaxy A-series) with Spark found.

## Q4. Which free capture app gives the best human captures with export rights? (plus capture tips, cleanup)

### Takeaway
At $0 in late 2026: Scaniverse is the best fit — Classic Scaniverse (iOS) still gives free, unlimited on-device splats, and the New Scaniverse Free plan exports PLY/SPZ with 20,000 credits/month, with use in your own projects allowed (no commercial/resale rights below Pro). Polycam free tier no longer clearly includes splat export; KIRI 3DGS is Pro-only; Postshot free cannot export; RealityScan does poses only; Luma has wound down capture. Fully free desktop route: RealityScan/COLMAP poses, then Brush, LichtFeld Studio or Nerfstudio/gsplat training (NVIDIA GPU).

### Cited Findings

**Capture apps (official where possible)**
- Scaniverse (Niantic Spatial) Free plan $0: 20,000 credits/month (~10 min mobile capture), Gaussian splats, export FBX, SPZ, PLY; no 360 splats or USDZ. Classic Scaniverse remains available with "free, unlimited on-device splat generation"; New Scaniverse for Android still in development. Free users may use assets for their own projects within ToS; "For commercial rights, including resale, you must be on a Pro plan or Enterprise contract." Plus $20/mo, Pro $50/mo — [Niantic Spatial pricing (official)](https://nianticspatial.com/pricing)
- SPZ is Niantic's open-source (MIT) compressed splat format — [Scaniverse news](https://scaniverse.com/news/spz-gaussian-splat-open-source-file-format)
- KIRI Engine: 3DGS ("3DGS Scan with Mesh") listed only under Pro, USD 79.99/year; free Basic has unlimited Photo/LiDAR scans with OBJ/FBX/STL/GLB export; no ownership terms on page — [KIRI pricing (official)](https://www.kiriengine.app/pricing)
- Polycam: official pricing could not be confirmed; aggregators conflict. Free tier reportedly GLTF-only export with watermarks; splats on Basic or Pro depending on source — [Polycam Basic plan (FR)](https://poly.cam/fr-fr/basic-plan), [TrustRadius](https://www.trustradius.com/products/polycam/details) **[UNVERIFIED / conflicting]**. Polycam's plain PLY export is a point cloud, not a splat — [PlayCanvas recommended tools](https://developer.playcanvas.com/user-manual/gaussian-splatting/creating/recommended-tools/)
- Postshot: free plan non-commercial; reports that since March 2026 the free version cannot export .ply — [HKU bookstack](https://bookstack.hku.nl/books/3d-scan/page/gaussian-splatting-online-and-local), [SplatMart](https://www.splatmart.com/blog/best-3dgs-software-2026) **[secondary sources]**
- RealityScan: free for individuals and companies under $1M revenue; does not train splats itself but exports COLMAP poses for splat trainers; free route suggested: RealityScan or COLMAP, then Brush or LichtFeld Studio — [SplatMart](https://www.splatmart.com/blog/best-3dgs-software-2026) **[secondary]**
- Luma: Flythroughs and Genie sunset 1 Jan 2026 (Flythroughs cloud data deleted); iOS Luma 3D Capture still listed (v1.3.14, Jan 2026); Android removed; radiance-field uploads reportedly disabled since Nov 2024 — [Radiance Fields](https://radiancefields.com/luma-ai-to-sunset-flythroughs-on-january-1-2026), [App Store](https://apps.apple.com/us/app/-/id1615849914). Treat Luma as not viable for new captures **[inference]**.
- Original 3DGS research code is non-commercial; consider the data source licence — [gsplat.js README](https://github.com/huggingface/gsplat.js/). Nerfstudio's `gsplat` library is Apache 2.0 **[UNVERIFIED this session]**.

**Capture tips for a static human pose**
- Radiance Fields: avoid capturing people unless they are the subject; still subjects easier — [Radiance Fields capture guide](https://radiancefields.com/how-to-capture-radiance-fields)
- Lock exposure and focus; move slowly to avoid blur; ~100–300 sharp overlapping images for small subjects; each surface in at least 3 overlapping images — [freegaussian.ai](https://www.freegaussian.ai/blog/best-practices-capture)
- Prefer wider lenses over long portrait lenses; avoid heavy denoise/compression which causes floaters — [Jeffrey Ian Wilson](https://jeffreyianwilson.substack.com/p/capstone-project-advanced-gaussian)
- Walk slowly around the subject in a spiral, vary height — [Medium student guide](https://medium.com/@Jamesroha/gaussian-splatting-a-complete-student-guide-to-3d-capture-in-2026-1195a6265870)
- Face capture via short 5–10 s video is one documented approach — [Vulkan docs capture guide](https://docs.vulkan.org/samples/latest/samples/complex/render_octomap/Tutorials/capturing-gaussian-splats.html)
- Single-image route: Apple ml-sharp produced a 689K-splat face PLY from one photo — [Eliseo Martelli](https://www.eliseomartelli.it/blog/2026-03-28-gaussian-splat-portrait/)

**Cleanup: SuperSplat**
- SuperSplat Editor 3.0 (Sept 2026) rebuilt on WebGPU; streaming chunked export of PLY, compressed PLY, SOG, SPZ; SOG export needs WebGPU; colour tools; File, Publish to hosted viewer; publishing API — [PlayCanvas blog](https://blog.playcanvas.com/new-in-supersplat-editor-3-0-rebuilt-on-webgpu), [CG Channel](https://www.cgchannel.com/2026/09/playcanvas-releases-supersplat-editor-3-0/)
- Use SuperSplat to remove floaters, crop background, adjust colour, compress — [Gaussian splat platforms guide](https://ar-go.co/blog/gaussian-splatting-platforms/)

### Inferences
- Static pose: seated pose with arms supported (lean on desk/chair) holds stiller than standing; eyes fixed on a point; capture in ~60–90 s; plain, textured-but-uncluttered background; overcast or large softbox light. Have a helper orbit the camera in 2–3 height rings. Hair and eyes produce most artifacts. **[practitioner inference, not sourced]**
- Use Classic Scaniverse on iPhone for a free, on-device splat; export PLY, clean in SuperSplat, export SOG (Spark) or SPZ (three.js native).
- Personal portfolio display of your own likeness falls under "your own projects" on Scaniverse Free; if the portfolio is monetised or the scan is used for client work, read the ToS or consider Pro.

### Gaps
- Official Polycam free-tier splat export terms not fetched.
- KIRI free-tier export of splats not stated on page.
- No source with "number of photos for a full human body" specifically.
- Scaniverse ToS ownership wording not read in full.

## Q5. Privacy / deepfake considerations of publishing a high-detail face scan, and mitigations

### Takeaway
A downloadable, high-fidelity 3D face splat is a stronger identity asset than ordinary photos/video: research already shows GS-based face swapping/reenactment and flags biometric-authentication risk. Mitigate by publishing a reduced, stylised, or partial scan and not exposing the raw file.

### Cited Findings
- Realistic GS face avatars "could be exploited to produce convincing deepfakes" — [HyperGaussians, arXiv 2507.02803](https://arxiv.org/pdf/2507.02803)
- A 3D deepfake framework on Gaussian splatting enables identity-preserving face swap and reenactment across viewpoints — [arXiv 2509.11624](https://arxiv.org/abs/2509.11624v1)
- AEGIS: photoreal GS avatars introduce online identity-theft risk, especially for biometric authentication; proposes adversarial perturbations on Gaussian colour coefficients, reducing face retrieval/verification accuracy to 0% while keeping perceptual quality (research prototype) — [AEGIS arXiv 2511.17747](https://arxiv.org/pdf/2511.17747)

### Inferences
- Mitigations: (1) downsample (e.g., 15K-point stylised portrait as in Martelli's site); (2) drop SH / desaturate / heavy amber grade, which also suits a low-key scene; (3) frame mostly from mid-distance or third-person behind/side so the face is never a clean frontal; (4) cap camera orbit so the full head is never visible; (5) serve compressed SOG/SPZ only, never the source PLY or capture images; note that anything rendered client-side is downloadable; (6) no "this is my face" metadata; (7) consider AEGIS-style perturbation if research code is available.
- Legal: publishing your own likeness voluntarily is generally low legal risk; biometric laws (GDPR Art. 9, BIPA) target processing others' data **[UNVERIFIED — not researched]**.

### Gaps
- No legal analysis found on self-published 3D face scans under GDPR/BIPA.
- AEGIS code availability not checked.

## Q6. Techniques for camera transitions from third-person to first-person in a web 3D scene

### Takeaway
Use `camera-controls` (drei `<CameraControls>`) with `setLookAt(...)` and `smoothTime`, awaiting promises to chain a third-person orbit into an over-the-shoulder then head-height position, then hand over to a first-person rig (PointerLock/look controls). Or lerp position and look-at target together in `useFrame`. Fade/hide the person splat as the camera enters the head to avoid clipping through splats.

### Cited Findings
- camera-controls: OrbitControls-like, built for smooth transitions; documents first-person and third-person (with meshwalk) modes; official drei wrapper; transitions return promises (await to chain); `.smoothTime` controls speed — [camera-controls README](https://cdn.jsdelivr.net/npm/camera-controls@3.1.2/readme.md)
- Spark's R3F starter already uses CameraControls with SparkRenderer/SplatMesh — [spark-react-r3f](https://github.com/sparkjsdev/spark-react-r3f)
- Manual approach: lerp camera position with `THREE.MathUtils.lerp` inside `useFrame` toggled by state; lerping the look-at target together is the tricky part — [three.js forum](https://discourse.threejs.org/t/lerping-camera-and-lookat-together-with-dynamic-taret-react-three-fiber/28896), [SO via kiwix](https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/72104953/how-to-make-smooth-camera-transition-in-react-three-fiber)

### Inferences
- Sequence: (1) third-person establishing shot orbiting the seated splat; (2) `await controls.setLookAt(shoulderPos, deskTarget, true)`; (3) `await controls.setLookAt(eyePos, monitorTarget, true)` while tweening `splatMesh.opacity` (Spark) to 0 and narrowing FOV slightly; (4) disable orbit (`controls.enabled=false` or swap to first-person look rig with clamped yaw/pitch). Use slerp on quaternions if look-at lerp causes flips. Respect `prefers-reduced-motion` with a cut/crossfade.

### Gaps
- No found example of this exact transition with a human splat; no named award-winning site documented.

## Examples of websites showing a person as a splat (Objective 1)
- Eliseo Martelli homepage portrait: single photo, then Apple ml-sharp to a 689K splat PLY, cropped in SuperSplat, importance-sampled to 15K points, custom Canvas 2D renderer — [blog, 28 Mar 2026](https://www.eliseomartelli.it/blog/2026-03-28-gaussian-splat-portrait/)
- Gunpla splats relit in a three.js city (objects, not a person) — shows relight + hull shadow techniques — [three.js forum](https://discourse.threejs.org/t/two-gunpla-scanned-as-3d-gaussian-splats-relit-inside-a-three-js-city/94407.md)
- Codrops: 3D portal effect extended with Gaussian splatting in R3F — [Codrops](https://tympanus.net/codrops/?p=74549) (content not fetched)
- Gap: no Awwwards-recognised portfolio featuring a human splat was found in searches; the Oct 2026 Awwwards "Portfolio website" nominee (Poulo) shows no splat usage — [Awwwards](https://www.awwwards.com/sites/portfolio-website-2). Searching awwwards.com directly for "gaussian" is the next step.
