"use client";

import { useEffect } from "react";

/** Normalized pointer (-1..1), shared by every 3D consumer without re-renders. */
export const pointer = { x: 0, y: 0 };

export function useGlobalPointerTracking() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}
