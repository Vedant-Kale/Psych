import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { dpr, FpsProbe, reducedMotion } from './common';
import { Floor } from './Floor';
import { Post } from './Post';
import { Splat, splatHud } from './Splat';

/** S1: amber splat on a baked floor. Slow auto-orbit keeps the splat sort busy, so fps is measured under motion. */
export function S1() {
  return (
    <Canvas dpr={dpr} camera={{ position: [0, 1.5, 3], fov: 40, near: 0.05 }} gl={{ antialias: false }}>
      <color attach="background" args={['#0b0806']} />
      <Floor />
      <Splat />
      <OrbitControls target={[0, 1, 0]} autoRotate={!reducedMotion} autoRotateSpeed={0.6} enableDamping />
      <Post />
      <FpsProbe extra={splatHud} />
    </Canvas>
  );
}
