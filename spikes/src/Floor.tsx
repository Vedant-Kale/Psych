import { useMemo } from 'react';
import * as THREE from 'three';

function radial(stops: [number, string][], size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) grad.addColorStop(at, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Stand-in for a baked-lit floor: an unlit plane whose texture is the light pool, plus a blob contact shadow. Zero lights. */
export function Floor() {
  const pool = useMemo(() => radial([[0, '#7a4a22'], [0.35, '#3a2312'], [1, '#0b0806']]), []);
  const blob = useMemo(() => radial([[0, 'rgba(0,0,0,0.75)'], [0.6, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0)']], 128), []);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial map={pool} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial map={blob} transparent depthWrite={false} />
      </mesh>
    </>
  );
}
