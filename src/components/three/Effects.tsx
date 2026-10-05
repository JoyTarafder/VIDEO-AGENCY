"use client";

import { Bloom, ChromaticAberration, EffectComposer, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useMemo } from "react";
import * as THREE from "three";

/**
 * Global post grade — deliberately light budget: bloom + chromatic aberration
 * + noise, nothing else. Disabled on quality tier 0 (and therefore on the
 * mobile/low-power path, which never mounts the canvas at all).
 */
export function Effects({ enabled }: { enabled: boolean }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.00035, 0.00055), []);
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.32} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
      <ChromaticAberration offset={caOffset} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.035} />
    </EffectComposer>
  );
}
