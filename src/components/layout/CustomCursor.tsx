"use client";

import { useEffect, useRef } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/hooks/use-media";
import { lerp } from "@/lib/utils";

/**
 * Custom cursor: an acid dot + trailing ring. Elements can declare
 * `data-cursor="play"` / `"view"` / `"drag"` to morph the ring into a
 * labeled disc (e.g. PLAY over video cards). Renders only on fine-pointer,
 * motion-allowed devices; native cursor stays untouched otherwise.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const labelled = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const interactive = target?.closest?.("a, button, [role='button'], input, textarea, select, label, summary");
      const label = labelled?.getAttribute("data-cursor");
      if (label) ring.setAttribute("data-label", label);
      else ring.removeAttribute("data-label");
      const labelEl = ring.querySelector<HTMLElement>(".cursor-label");
      if (labelEl) labelEl.textContent = label ?? "";
      ring.style.borderColor = interactive && !label ? "var(--color-acid)" : "";
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      rx = lerp(rx, x, 0.2);
      ry = lerp(ry, y, 0.2);
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      // Sleep once caught up — wakes again on the next mousemove.
      if (Math.abs(rx - x) < 0.1 && Math.abs(ry - y) < 0.1) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousemove", wake, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" style={{ opacity: 0 }} />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" style={{ opacity: 0 }}>
        <span className="cursor-label" data-slot="label" />
      </div>
    </>
  );
}
