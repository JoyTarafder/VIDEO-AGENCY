"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSceneStore } from "@/store/scene";

/**
 * Per-route bridge between the DOM scroll world and the persistent 3D scene.
 * Creates one ScrollTrigger per [data-scene] section; killed automatically
 * on route change (template remount → context revert).
 */
export function SceneDirector() {
  useEffect(() => {
    useSceneStore.setState({ progress: {} });

    const ctx = gsap.context(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      if (sections.length === 0) {
        useSceneStore.setState({ activeSection: "page", prevSection: "page" });
        return;
      }

      // Active owner = the section covering most of the viewport, recomputed
      // on scroll (a section "arrives" when it dominates the screen, not when
      // its top edge merely enters at the bottom).
      const pickMostVisible = () => {
        let best: HTMLElement | null = null;
        let bestRatio = 0;
        for (const el of sections) {
          const r = el.getBoundingClientRect();
          const ratio = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = el;
          }
        }
        if (!best) return; // nothing visible — keep the last owner
        const id = best.dataset.scene ?? "page";
        useSceneStore.setState((st) =>
          st.activeSection === id
            ? st
            : { activeSection: id, prevSection: st.activeSection }
        );
      };

      // Per-section coverage progress (drives scrubs + snap thresholds).
      for (const el of sections) {
        const id = el.dataset.scene;
        if (!id) continue;
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            useSceneStore.setState((st) => ({ progress: { ...st.progress, [id]: self.progress } }));
          },
        });
      }

      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: pickMostVisible,
      });
      pickMostVisible();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
