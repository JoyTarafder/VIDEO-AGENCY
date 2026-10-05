"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useFinePointer, useLowPowerDevice, usePrefersReducedMotion } from "@/hooks/use-media";

/* Heavy scene code (drei, postprocessing) splits into its own chunk. */
const SceneContents = dynamic(() => import("./SceneContents"), { ssr: false });

/**
 * The site's single persistent WebGL layer: fixed, full-screen, behind DOM
 * content (z-20 — above section media, below z-30 content wrappers), fully
 * decorative (aria-hidden, pointer-events none). Never unmounts across
 * routes; SceneDirector (per-route) drives what it shows.
 */
export default function GlobalCanvas() {
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const lowPower = useLowPowerDevice();

  if (reduced || !fine || lowPower) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[20] [&_*]:pointer-events-none" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.4], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <SceneContents />
      </Canvas>
    </div>
  );
}
