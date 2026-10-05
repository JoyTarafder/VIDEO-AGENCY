"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import SceneContents from "./SceneContents";

/**
 * The site's single persistent WebGL layer: fixed, full-screen, behind DOM
 * content (z-20 — above section media, below z-30 content wrappers), fully
 * decorative (aria-hidden, pointer-events none). Never unmounts across
 * routes; SceneDirector (per-route) drives what it shows.
 */
export default function GlobalCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[20] [&_*]:pointer-events-none" aria-hidden="true">
      <Canvas
        frameloop="always"
        dpr={1}
        camera={{ position: [0, 0, 6.4], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <SceneContents />
      </Canvas>
    </div>
  );
}
