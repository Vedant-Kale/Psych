import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { usePost } from './common';

export function Post() {
  if (!usePost) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.6} />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  );
}
