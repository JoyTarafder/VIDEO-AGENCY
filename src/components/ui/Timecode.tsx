"use client";

import { useEffect, useRef } from "react";
import { cn, timecode } from "@/lib/utils";

/** Running HH:MM:SS:FF camera timecode at 24fps. */
export function Timecode({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      if (ref.current) ref.current.textContent = timecode(performance.now() - start);
    }, 1000 / 24);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      00:00:00:00
    </span>
  );
}
