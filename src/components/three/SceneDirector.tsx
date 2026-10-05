"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSceneStore } from "@/store/scene";

/**
 * Per-route bridge between the DOM scroll world and the persistent 3D scene.
 * Creates one ScrollTrigger per [data-scene] section; killed automatically
 * on route change (template remount → context revert).
 *
 * With a root `loading.tsx`, the page content streams in AFTER the layout
 * shell hydrates — so this observes `main` and re-binds whenever the set of
 * sections changes (loading fallback → real page swap).
 */
export function SceneDirector() {
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let raf = 0;
    let lastCount = -1;

    const setup = () => {
      ctx?.revert();

      // Only real document sections: some tooling (e.g. in-app-browser
      // snapshot mirrors like div#S:0) clones the DOM — those zero-size
      // copies must never own triggers or the "most visible" vote.
      const isRealSection = (el: HTMLElement) =>
        (el.closest("main") !== null || el.tagName === "FOOTER") &&
        el.offsetWidth + el.offsetHeight > 0;

      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]")).filter(
        isRealSection
      );
      lastCount = sections.length;

      if (sections.length === 0) {
        useSceneStore.setState({ activeSection: "page", prevSection: "page" });
        return;
      }

      ctx = gsap.context(() => {
        // Active owner = the section covering most of the viewport, recomputed
        // on scroll (a section "arrives" when it dominates the screen, not when
        // its top edge merely enters at the bottom).
        const pickMostVisible = () => {
          let best: HTMLElement | null = null;
          let bestRatio = 0;
          for (const el of sections) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            const ratio = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = el;
            }
          }
          if (!best) return; // nothing visible — keep the last owner
          const id = best.dataset.scene ?? "page";
          useSceneStore.setState((st) =>
            st.activeSection === id ? st : { activeSection: id, prevSection: st.activeSection }
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
              useSceneStore.setState((st) => ({
                progress: { ...st.progress, [id]: self.progress },
              }));
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

      // DevTools debug handles: `__vaST.getAll()`, `__vaSections`
      if (typeof window !== "undefined") {
        (window as unknown as Record<string, unknown>).__vaST = ScrollTrigger;
        (window as unknown as Record<string, unknown>).__vaSections = sections.map(
          (s) => s.dataset.scene
        );
      }
    };

    setup();

    const observer = new MutationObserver(() => {
      const count = document.querySelectorAll("[data-scene]").length;
      if (count !== lastCount) {
        lastCount = count;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(setup);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return null;
}
