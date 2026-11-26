# PSYCH — Spike results (M3 gate)

Throwaway prototypes in `spikes/` answer the riskiest M3 questions before the M3 plan (#19) is written.
Run: `npm --prefix spikes install && npm --prefix spikes run dev`, then open the **Network** URL it prints on the phone (same Wi-Fi).
Each page shows a HUD: current fps, run average (after a 3 s warm-up) and worst second, plus pixel ratio, resolution and GPU. Record the **avg** and **worst** after about 30 s.

Query options: `?budget=100000` (splat budget), `?dpr=1.5` (pixel-ratio cap), `?post=0` (no bloom/vignette), `?rm` (reduced motion), `?flip=0` / `?face=180` (scan orientation), `?url=/other.ply`.

## S1 — amber-graded splat on a phone (#3)

Scan: Scaniverse capture, exported as SPZ or PLY to `captures/scan.spz` (gitignored, never committed). For the SOG file size, open the scan in SuperSplat and export SOG.

| Device | Budget | dpr | Post | avg fps | worst fps | Notes |
|---|---|---|---|---|---|---|
| M-series Mac | 300K | 2 | on | | | |
| Phone | 100K | 2 | on | | | |
| Phone | 100K | 1.5 | on | | | |
| Phone | 100K | 2 | off | | | |

Scan splat count: · SOG size: · **Decision (go ≥ 30 fps on phone at 100K and ≤ 20 MiB):**

## S2 — third-person to first-person (#4)

| Check | Result |
|---|---|
| Move plays with no visible pop or clipping | |
| Reduced-motion crossfade replaces the move | |
| Owner sign-off on feel | |

## S3 — dusk-to-night blend and clock scrub (#5)

Stand-ins: procedural gradient lightmaps and a code spline replace the Blender bakes and exported spline. The grade is a real 16×16×16 LUT atlas (256×16) per state, blended in the shader.

| Check | Result |
|---|---|
| Scroll and clock drive one `progress`, never conflict | Verified on desktop: scroll set 0.800, then a clock drag set 0.753; scene followed both |
| Phone avg / worst fps during the blend | |

## S4 — ink-to-real dissolve (#6)

Inverted-hull outline + screen-space tone hatching + fresnel edges on paper, dissolved by 3D value noise into the lit pass with an amber burn edge. The page itself turns from paper to the dark bar.

| Check | Result |
|---|---|
| Reads as "drawing becomes real" (owner) | |
| Phone avg / worst fps | |

## Desktop baseline (headless Chromium, Apple M4, 1024×768, dpr 1, no scan)

S1–S4 all hold 60 fps (vsync cap) with post on. Not a phone result.
