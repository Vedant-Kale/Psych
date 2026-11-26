import { useFrame, useThree } from '@react-three/fiber';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { useEffect, useMemo, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { budget, q, scanUrl } from './common';

export const splatInfo = { count: 0, status: 'loading…' };

/**
 * The scan, amber-tinted, standing with its feet on y=0, ~1.75 m tall, centred on the origin, facing +z.
 * Scaniverse/SPZ files are usually upside down in three.js (OpenCV axes): ?flip=0 turns the fix off, ?face=<deg> turns it.
 */
export function Splat({ opacity }: { opacity?: RefObject<number> }) {
  const [found, setFound] = useState(false);
  useEffect(() => {
    // Vite answers a missing file with index.html (200), which Spark would try to parse forever.
    fetch(scanUrl, { method: 'HEAD' })
      .then((r) => (r.ok && !r.headers.get('content-type')?.includes('text/html') ? setFound(true) : Promise.reject(new Error('missing'))))
      .catch(() => (splatInfo.status = `no scan: put it at captures${scanUrl} (or pass ?url=)`));
  }, []);
  return found ? <LoadedSplat opacity={opacity} /> : null;
}

function LoadedSplat({ opacity }: { opacity?: RefObject<number> }) {
  const { gl } = useThree();
  const spark = useMemo(() => new SparkRenderer({ renderer: gl, lodSplatCount: budget }), [gl]);
  const group = useMemo(() => new THREE.Group(), []);
  const mesh = useMemo(() => {
    const m = new SplatMesh({ url: scanUrl, lod: true });
    m.recolor.set(1, 0.8, 0.58); // amber grade
    if (q.get('flip') !== '0') m.quaternion.set(1, 0, 0, 0);
    return m;
  }, []);

  useEffect(() => {
    group.add(mesh);
    group.rotation.y = THREE.MathUtils.degToRad(Number(q.get('face')) || 0);
    mesh.initialized
      .then(() => {
        const box = new THREE.Box3();
        const p = new THREE.Vector3();
        mesh.forEachSplat((_i: number, center: THREE.Vector3) => box.expandByPoint(p.copy(center).applyQuaternion(mesh.quaternion)));
        const size = box.getSize(new THREE.Vector3());
        const scale = 1.75 / Math.max(size.y, 1e-6);
        mesh.scale.setScalar(scale);
        mesh.position.set(-(box.min.x + size.x / 2) * scale, -box.min.y * scale, -(box.min.z + size.z / 2) * scale);
        splatInfo.count = mesh.packedSplats?.numSplats ?? 0;
        splatInfo.status = 'loaded';
      })
      .catch((e: unknown) => {
        splatInfo.status = `failed: put the scan at captures/scan.spz or pass ?url= (${String(e)})`;
      });
    return () => {
      spark.dispose();
      mesh.dispose();
    };
  }, [group, mesh, spark]);

  useFrame(() => {
    if (opacity) mesh.opacity = opacity.current;
  });

  return (
    <>
      <primitive object={spark} />
      <primitive object={group} />
    </>
  );
}

export const splatHud = () => `splats ${splatInfo.count.toLocaleString()} (budget ${budget.toLocaleString()})  ${splatInfo.status}`;
