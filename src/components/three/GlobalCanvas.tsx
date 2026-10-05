"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media";
import { useLoaderReady } from "@/components/layout/Preloader";

/* Heavy scene code (drei, postprocessing) splits into its own chunk. */
const SceneContents = dynamic(() => import("./SceneContents"), { ssr: false });

/**
 * The site's single persistent WebGL layer: fixed, full-screen, behind DOM
 * content (z-20 — above section media, below z-30 content wrappers), fully
 * decorative (aria-hidden, pointer-events none). Never unmounts across
 * routes; SceneDirector (per-route) drives what it shows.
 *
 * The canvas MOUNTS only after the preloader hands over plus a short idle
 * gap — shader/texture compilation is a several-hundred-ms main-thread stall,
 * and it must never compete with first paint or the intro animation.
 */
export default function GlobalCanvas() {
  const reduced = usePrefersReducedMotion();
  const { ready } = useLoaderReady();
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (!ready || reduced) return;
    const id = window.setTimeout(() => setMount(true), 200);
    return () => window.clearTimeout(id);
  }, [ready, reduced]);

  if (reduced || !mount) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[20] [&_*]:pointer-events-none" aria-hidden="true">
      <Canvas
        frameloop="demand"
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
