"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { SceneDirector } from "@/components/three/SceneDirector";

/**
 * Remounts on every route change — the entrance half of the film-wipe
 * transition (the exit half lives in TransitionProvider). Opacity only:
 * a transform here would break ScrollTrigger pin measurements.
 * SceneDirector re-binds the section→3D scroll wiring for each route.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.55, ease: "easeOut" }}
    >
      <SceneDirector />
      {children}
    </motion.div>
  );
}
