import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { dpr, FpsProbe } from './common';
import { Post } from './Post';
import { progress, setTarget } from './progress';

gsap.registerPlugin(Observer);

/** Procedural stand-in for a baked lightmap: a vertical gradient (Blender bakes replace these in M3). */
function lightmap(top: string, bottom: string) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 16×16×16 colour-grade LUT packed as a 256×16 atlas (16 blue slices side by side). */
function lutAtlas(grade: (r: number, g: number, b: number) => [number, number, number]) {
  const data = new Uint8Array(256 * 16 * 4);
  for (let b = 0; b < 16; b++)
    for (let g = 0; g < 16; g++)
      for (let r = 0; r < 16; r++) {
        const [R, G, B] = grade(r / 15, g / 15, b / 15);
        const i = (g * 256 + b * 16 + r) * 4;
        data.set([R * 255, G * 255, B * 255, 255], i);
      }
  const t = new THREE.DataTexture(data, 256, 16);
  t.magFilter = t.minFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const duskGrade = (r: number, g: number, b: number): [number, number, number] => [clamp(r * 1.1 + 0.04), clamp(g * 0.95 + 0.02), clamp(b * 0.75)];
const nightGrade = (r: number, g: number, b: number): [number, number, number] => {
  const l = 0.3 * r + 0.59 * g + 0.11 * b;
  return [clamp(l * 0.55 + r * 0.25), clamp(l * 0.65 + g * 0.2), clamp(l * 0.95 + b * 0.25 + 0.03)];
};

const shader = {
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D uDusk, uNight, uLutDusk, uLutNight; uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
    vec3 lut(sampler2D t, vec3 c){
      c = clamp(c, 0., 1.); float b = c.b * 15.; float s0 = floor(b); float s1 = min(s0 + 1., 15.);
      float y = (c.g * 15. + .5) / 16.;
      vec3 a = texture2D(t, vec2((s0 * 16. + c.r * 15. + .5) / 256., y)).rgb;
      vec3 d = texture2D(t, vec2((s1 * 16. + c.r * 15. + .5) / 256., y)).rgb;
      return mix(a, d, b - s0);
    }
    void main(){
      vec3 light = mix(texture2D(uDusk, vUv).rgb, texture2D(uNight, vUv).rgb, uTime);
      vec3 c = uColor * light * 1.6;
      gl_FragColor = vec4(mix(lut(uLutDusk, c), lut(uLutNight, c), uTime), 1.);
      #include <colorspace_fragment>
    }`,
};

const PATH = new THREE.CatmullRomCurve3(
  // Stand-in for the spline exported from Blender.
  [[-3, 1.6, 4], [-1, 1.4, 3], [1, 1.5, 2.6], [2.6, 1.7, 1.2], [3, 1.9, -0.5]].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
);
const LOOK = new THREE.Vector3(0, 1, -1);

function Bar() {
  const uniforms = useMemo(
    () => ({
      uDusk: { value: lightmap('#ffb46a', '#3b1e0c') },
      uNight: { value: lightmap('#2a3a66', '#070a14') },
      uLutDusk: { value: lutAtlas(duskGrade) },
      uLutNight: { value: lutAtlas(nightGrade) },
      uTime: { value: 0 },
    }),
    [],
  );
  const mat = (color: string) => <shaderMaterial args={[{ ...shader, uniforms: { ...uniforms, uColor: { value: new THREE.Color(color) } } }]} />;

  useFrame(({ camera }, dt) => {
    progress.shown = THREE.MathUtils.damp(progress.shown, progress.target, 6, dt);
    uniforms.uTime.value = progress.shown;
    camera.position.copy(PATH.getPointAt(progress.shown));
    camera.lookAt(LOOK);
  });

  return (
    <>
      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[10, 10]} />
        {mat('#5a3a22')}
      </mesh>
      <mesh position={[0, 2, -2.5]}>
        <planeGeometry args={[10, 4]} />
        {mat('#3a2a20')}
      </mesh>
      <mesh position={[0, 0.55, -1]}>
        <boxGeometry args={[3.2, 1.1, 0.6]} />
        {mat('#6b4428')}
      </mesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.32, -1]}>
          <cylinderGeometry args={[0.06, 0.08, 0.45, 16]} />
          {mat('#c98a3a')}
        </mesh>
      ))}
    </>
  );
}

/** Drag the hand to scrub. 0 = 18:00 (dusk), 1 = 06:00. */
function Clock() {
  const [, rerender] = useState(0);
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const id = setInterval(() => rerender((n) => n + 1), 50);
    return () => clearInterval(id);
  }, []);
  const fromPointer = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)));
    const next = (a < 0 ? a + 2 * Math.PI : a) / (2 * Math.PI);
    if (Math.abs(next - progress.target) < 0.5) setTarget(next); // no jump across 12 o'clock
  };
  const angle = progress.target * 360;
  const hour = (18 + progress.target * 12) % 24;
  return (
    <svg
      ref={ref}
      className="clock"
      viewBox="-50 -50 100 100"
      width={120}
      height={120}
      style={{ position: 'fixed', right: 16, bottom: 16, touchAction: 'none', cursor: 'grab', zIndex: 10 }}
      onPointerDown={(e) => {
        progress.dragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => progress.dragging && fromPointer(e)}
      onPointerUp={() => (progress.dragging = false)}
      role="slider"
      aria-label="Time of night"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress.target * 100)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setTarget(progress.target + 0.02);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setTarget(progress.target - 0.02);
      }}
    >
      <circle r={46} fill="#1d1510" stroke="#ffb45c" strokeWidth={2} />
      <line x2={0} y2={-36} stroke="#ffb45c" strokeWidth={4} strokeLinecap="round" transform={`rotate(${angle})`} />
      <text y={22} textAnchor="middle" fill="#f3e6d2" fontSize={12}>
        {String(Math.floor(hour)).padStart(2, '0')}:{String(Math.floor((hour % 1) * 60)).padStart(2, '0')}
      </text>
    </svg>
  );
}

/** S3: scroll and clock write one target; the scene damps toward it, so the two inputs can never fight. */
export function S3() {
  useEffect(() => {
    const obs = Observer.create({
      target: window,
      type: 'wheel,touch',
      ignore: '.clock',
      preventDefault: true,
      onChangeY: (self) => {
        if (!progress.dragging) setTarget(progress.target + self.deltaY * 0.0008);
      },
    });
    return () => obs.kill();
  }, []);
  return (
    <>
      <Canvas dpr={dpr} camera={{ fov: 45 }} gl={{ antialias: false }}>
        <color attach="background" args={['#050403']} />
        <Bar />
        <Post />
        <FpsProbe extra={() => `progress target ${progress.target.toFixed(3)} shown ${progress.shown.toFixed(3)}  dragging ${progress.dragging}`} />
      </Canvas>
      <Clock />
    </>
  );
}
