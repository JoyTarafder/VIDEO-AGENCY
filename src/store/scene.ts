import { create } from "zustand";

export type QualityTier = 0 | 1 | 2; // 0 = minimal, 1 = mid (post FX on), 2 = full

type SceneState = {
  /** id of the section currently owning the frame ("hero", "intro", "page"…) */
  activeSection: string;
  /** id of the section we transitioned FROM — the rig glides between the two */
  prevSection: string;
  /** 0→1 scroll coverage per section id, written by ScrollTrigger (SceneDirector) */
  progress: Record<string, number>;
  quality: QualityTier;
  /** true while a full-screen modal owns the viewport — the canvas stops rendering */
  paused: boolean;
  /** index of the active service row (0-4) — drives the services 3D object swap */
  activeService: number;
  setQuality: (q: QualityTier) => void;
  setPaused: (p: boolean) => void;
};

/**
 * Single source of truth between the DOM world (ScrollTrigger) and the WebGL
 * world. Written on scroll, read via getState() inside useFrame — no React
 * re-renders in the render loop.
 */
export const useSceneStore = create<SceneState>((set) => ({
  activeSection: "hero",
  prevSection: "hero",
  progress: {},
  quality: 2,
  paused: false,
  activeService: 0,
  setQuality: (quality) => set({ quality }),
  setPaused: (paused) => set({ paused }),
}));

// DevTools debug handle: `__vaScene.getState()` in the browser console.
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__vaScene = useSceneStore;
}
