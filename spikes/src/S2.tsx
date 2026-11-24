import { CameraControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { dpr, FpsProbe, reducedMotion } from './common';
import { Floor } from './Floor';
import { Post } from './Post';
import { Splat, splatHud } from './Splat';

// The scan faces +z. Start behind the right shoulder; end at eye height, looking the same way.
const SHOULDER = [0.35, 1.75, -1.0, 0, 1.5, 2] as const;
const EYE = new THREE.Vector3(0, 1.62, 0.08);
const AHEAD = new THREE.Vector3(0, 1.6, 2);

/** S2: third-person → first-person. The splat fades out before the camera reaches the head, so it never clips. */
export function S2() {
  const controls = useRef<CameraControls>(null);
  const opacity = useRef(1);
  const fade = useRef<HTMLDivElement>(null);
  const [rm, setRm] = useState(reducedMotion);

  const reset = () => {
    const c = controls.current!;
    gsap.killTweensOf(opacity);
    opacity.current = 1;
    unclamp(c);
    void c.setLookAt(...SHOULDER, false);
  };

  const play = async () => {
    const c = controls.current!;
    reset();
    if (rm) {
      // Reduced motion: a 300 ms crossfade through black replaces the move.
      fade.current!.style.opacity = '1';
      await new Promise((r) => setTimeout(r, 320));
      opacity.current = 0;
      firstPerson(c, false);
      fade.current!.style.opacity = '0';
      return;
    }
    c.smoothTime = 0.9;
    gsap.to(opacity, { current: 0, duration: 0.9, delay: 0.5, ease: 'power2.in' });
    await c.setLookAt(EYE.x, EYE.y, EYE.z, AHEAD.x, AHEAD.y, AHEAD.z, true);
    firstPerson(c, false);
  };

  return (
    <>
      <Canvas dpr={dpr} camera={{ position: [SHOULDER[0], SHOULDER[1], SHOULDER[2]], fov: 50, near: 0.01 }} gl={{ antialias: false }}>
        <color attach="background" args={['#0b0806']} />
        <Floor />
        <Splat opacity={opacity} />
        <CameraControls ref={controls} onStart={() => undefined} makeDefault />
        <Post />
        <FpsProbe extra={() => `${splatHud()}\nopacity ${opacity.current.toFixed(2)}  reduced-motion ${rm}`} />
      </Canvas>
      <div className="fade" ref={fade} />
      <div className="bar">
        <button onClick={play}>Play shift</button>
        <button onClick={reset}>Reset</button>
        <label>
          <input type="checkbox" checked={rm} onChange={(e) => setRm(e.target.checked)} /> reduced motion
        </label>
      </div>
    </>
  );
}

/** Hand over to a look-only rig: orbit point a centimetre ahead of the eye, so dragging turns the head in place. */
function firstPerson(c: CameraControls, animate: boolean) {
  const dir = AHEAD.clone().sub(EYE).normalize().multiplyScalar(0.01);
  void c.setLookAt(EYE.x, EYE.y, EYE.z, EYE.x + dir.x, EYE.y + dir.y, EYE.z + dir.z, animate);
  const az = c.azimuthAngle;
  const polar = c.polarAngle;
  c.minAzimuthAngle = az - THREE.MathUtils.degToRad(35);
  c.maxAzimuthAngle = az + THREE.MathUtils.degToRad(35);
  c.minPolarAngle = polar - THREE.MathUtils.degToRad(20);
  c.maxPolarAngle = polar + THREE.MathUtils.degToRad(20);
  c.dollySpeed = 0;
  c.truckSpeed = 0;
  c.azimuthRotateSpeed = c.polarRotateSpeed = -0.4; // drag moves the view like turning your head
}

function unclamp(c: CameraControls) {
  c.minAzimuthAngle = c.minPolarAngle = -Infinity;
  c.minPolarAngle = 0;
  c.maxAzimuthAngle = Infinity;
  c.maxPolarAngle = Math.PI;
  c.dollySpeed = c.truckSpeed = 1;
  c.azimuthRotateSpeed = c.polarRotateSpeed = 1;
}
