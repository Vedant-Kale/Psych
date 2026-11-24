import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

export const q = new URLSearchParams(location.search);
export const isMobile = matchMedia('(pointer: coarse)').matches;
/** Splat budget: ticket S1 says ~300K desktop, ~100K mobile. Override with ?budget=. */
export const budget = Number(q.get('budget')) || (isMobile ? 100_000 : 300_000);
/** Put the scan at captures/scan.spz (or .ply) — or pass ?url=/other.ply. */
export const scanUrl = q.get('url') ?? '/scan.spz';
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || q.has('rm');
export const usePost = q.get('post') !== '0';
/** Cap the pixel ratio: full Retina on a phone GPU costs ~4× the fill for little visible gain. */
export const dpr: [number, number] = [1, Number(q.get('dpr')) || 2];

/** Writes fps to #hud: current 1 s, run average after a 3 s warm-up, and worst 1 s. Read these into md-files/spikes.md. */
export function FpsProbe({ extra = () => '' }: { extra?: () => string }) {
  const { gl } = useThree();
  const s = useRef({ frames: 0, t0: 0, start: 0, total: 0, secs: 0, worst: Infinity, gpu: '' });
  useEffect(() => {
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    s.current.gpu = ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'unknown GPU';
  }, [gl]);
  useFrame(() => {
    const now = performance.now();
    const st = s.current;
    if (!st.start) st.start = st.t0 = now;
    st.frames++;
    if (now - st.t0 < 1000) return;
    const fps = (st.frames * 1000) / (now - st.t0);
    if (now - st.start > 3000) {
      st.total += fps;
      st.secs++;
      st.worst = Math.min(st.worst, fps);
    }
    st.frames = 0;
    st.t0 = now;
    const hud = document.getElementById('hud');
    if (hud) {
      hud.textContent =
        `fps ${fps.toFixed(0)}  avg ${st.secs ? (st.total / st.secs).toFixed(1) : '…'}  worst ${st.secs ? st.worst.toFixed(0) : '…'}\n` +
        `dpr ${gl.getPixelRatio().toFixed(2)}  ${gl.domElement.width}×${gl.domElement.height}  post ${usePost ? 'on' : 'off'}\n` +
        `${st.gpu}${extra() ? `\n${extra()}` : ''}`;
    }
  });
  return null;
}
