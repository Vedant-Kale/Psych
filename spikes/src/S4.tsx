import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { dpr, FpsProbe, reducedMotion } from './common';
import { Post } from './Post';

/** A bottle: lathe profile (stand-in for the bar's hero object). */
const BOTTLE = new THREE.LatheGeometry(
  [[0, 0], [0.32, 0], [0.34, 0.05], [0.34, 0.9], [0.3, 1.05], [0.13, 1.2], [0.11, 1.55], [0.13, 1.6], [0, 1.6]].map(([x, y]) => new THREE.Vector2(x, y)),
  64,
);

const frag = /* glsl */ `
  uniform float uProgress, uCrossfade; uniform vec3 uLight;
  varying vec3 vN, vWorld, vView;
  float hash(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x){
    vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float lines(vec2 p, float spacing, float width){ return step(abs(fract(p.x / spacing) - .5), width); }
  void main(){
    vec3 N = normalize(vN), V = normalize(vView), L = normalize(uLight);
    float ndl = max(dot(N, L), 0.);
    // Lit pass: amber glass-ish.
    vec3 lit = vec3(.85, .45, .12) * (.12 + .88 * ndl) + pow(max(dot(reflect(-L, N), V), 0.), 48.) * vec3(1., .9, .7);
    // Ink pass: paper, tone hatching in screen space, fresnel edge as the outline.
    vec2 sp = gl_FragCoord.xy;
    float ink = 0.;
    if (ndl < .85) ink = max(ink, lines(vec2(sp.x + sp.y, 0.), 9., .2));
    if (ndl < .45) ink = max(ink, lines(vec2(sp.x - sp.y, 0.), 9., .2));
    if (ndl < .2)  ink = max(ink, lines(vec2(sp.x, 0.), 6., .22));
    ink = max(ink, smoothstep(.55, .65, 1. - abs(dot(N, V))));
    vec3 inked = mix(vec3(.95, .91, .82), vec3(.12, .09, .07), ink);
    // Dissolve: noise mask driven by progress, with a hot amber burn edge that the bloom picks up.
    float n = noise(vWorld * 4.) * .75 + noise(vWorld * 11.) * .25;
    float t = uProgress * 1.1 - .05;
    vec3 c = n < t ? lit : inked;
    c += vec3(1.4, .6, .15) * (1. - smoothstep(0., .035, abs(n - t))) * step(.01, uProgress) * step(uProgress, .99);
    if (uCrossfade > .5) c = mix(inked, lit, uProgress); // reduced motion: plain crossfade
    gl_FragColor = vec4(c, 1.);
    #include <colorspace_fragment>
  }`;
const vert = /* glsl */ `
  varying vec3 vN, vWorld, vView;
  void main(){
    vec4 w = modelMatrix * vec4(position, 1.);
    vWorld = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vView = cameraPosition - w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

function Bottle({ value, auto }: { value: number; auto: boolean }) {
  const uniforms = useMemo(() => ({ uProgress: { value: 0 }, uCrossfade: { value: reducedMotion ? 1 : 0 }, uLight: { value: new THREE.Vector3(2, 3, 2) } }), []);
  const outline = useMemo(() => new THREE.MeshBasicMaterial({ color: '#1f1712', side: THREE.BackSide, transparent: true }), []);
  const paper = useMemo(() => new THREE.Color('#efe7d6'), []);
  const bar = useMemo(() => new THREE.Color('#0b0806'), []);
  useFrame(({ clock, scene }) => {
    const p = auto ? 0.5 - 0.5 * Math.cos((clock.elapsedTime * Math.PI) / 4) : value;
    uniforms.uProgress.value = p;
    outline.opacity = 1 - THREE.MathUtils.smoothstep(p, 0.4, 0.8); // ink silhouette fades as the bottle becomes real
    // The page is paper while it's a drawing and turns into the dark bar as it becomes real.
    (scene.background as THREE.Color).lerpColors(paper, bar, THREE.MathUtils.smoothstep(p, 0.2, 0.9));
  });
  return (
    <group position-y={-0.8}>
      <mesh geometry={BOTTLE}>
        <shaderMaterial args={[{ uniforms, vertexShader: vert, fragmentShader: frag }]} />
      </mesh>
      {/* Inverted hull: a slightly bigger back-face copy draws the ink outline. */}
      <mesh geometry={BOTTLE} material={outline} scale={[1.04, 1.015, 1.04]} position-y={-0.012} />
    </group>
  );
}

/** S4: one object drawn in ink, dissolving into its lit version as progress goes 0 → 1. */
export function S4() {
  const [value, setValue] = useState(0);
  const [auto, setAuto] = useState(!reducedMotion);
  return (
    <>
      <Canvas dpr={dpr} camera={{ position: [0, 0.2, 3], fov: 40 }} gl={{ antialias: false }}>
        <color attach="background" args={['#0b0806']} />
        <Bottle value={value} auto={auto} />
        <Post />
        <FpsProbe />
      </Canvas>
      <div className="bar">
        <label>
          progress <input type="range" min={0} max={1} step={0.01} value={value} onChange={(e) => (setAuto(false), setValue(Number(e.target.value)))} />
        </label>
        <button onClick={() => setAuto((a) => !a)}>{auto ? 'Stop auto' : 'Auto'}</button>
      </div>
    </>
  );
}
