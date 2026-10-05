"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { QualityTier } from "@/store/scene";

/**
 * Global post grade — deliberately light budget. Tier 2: bloom only.
 * Tiers 0–1: none. (Film grain already lives in the DOM layer, so there is
 * no WebGL noise pass.)
 */
export function Effects({ tier }: { tier: QualityTier }) {
  if (tier < 1) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.32} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
    </EffectComposer>
  );
}
