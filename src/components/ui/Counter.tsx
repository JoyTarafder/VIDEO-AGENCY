"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Counts from 0 to `value` when scrolled into view. Suffix appended verbatim. */
export function Counter({
  value,
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) {
      el.textContent = value.toFixed(decimals);
      return;
    }
    const counter = { v: 0 };
    const tween = gsap.to(counter, {
      v: value,
      duration: 2.1,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = counter.v.toFixed(decimals);
      },
    });
    return () => {
      tween.kill();
    };
  }, [inView, reduced, value, decimals]);

  return (
    <span className={cn("tabular-nums", className)}>
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}
