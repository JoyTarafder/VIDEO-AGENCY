"use client";

import { useRef, useState } from "react";
import { TransitionLink } from "@/components/layout/TransitionProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFinePointer } from "@/hooks/use-media";
import { services } from "@/content/services";
import { ArrowUpRight } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Motion";
import { cn } from "@/lib/utils";

/**
 * Services index: full-width rows; a poster preview trails the cursor while a
 * row is hovered (desktop only — the preview is disabled on touch).
 */
export function ServicesPreview() {
  const fine = useFinePointer();
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = previewRef.current;
    if (!el || !fine) return;
    el.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 110}px, 0)`;
  };

  return (
    <section
      className="relative px-6 py-28 md:px-10 md:py-40"
      aria-label="Services"
      data-scene="services"
      onMouseMove={onMove}
    >
      <div className="relative z-30">
      <SectionHeading index="01" eyebrow="What we do">
        Full-stack
        <br />
        film production
      </SectionHeading>

      <ul className="border-t border-line">
        {services.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.04}>
            <li className="border-b border-line">
              <TransitionLink
                href={`/services#${s.id}`}
                className="group flex items-center gap-6 py-7 transition-colors duration-300 hover:bg-coal/60 md:gap-10 md:py-9"
                onMouseEnter={() => fine && setPreview(s.poster)}
                onMouseLeave={() => setPreview(null)}
              >
                <span className="w-10 shrink-0 font-mono text-xs text-acid md:text-sm">
                  /{s.index}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-2xl font-bold uppercase tracking-tight transition-transform duration-500 group-hover:translate-x-3 md:text-4xl lg:text-5xl">
                    {s.name}
                  </span>
                  <span className="mt-1 block text-sm text-fog md:text-base">{s.short}</span>
                </span>
                <span className="shrink-0 text-paper/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-acid">
                  <ArrowUpRight className="h-6 w-6 md:h-8 md:w-8" />
                </span>
              </TransitionLink>
            </li>
          </Reveal>
        ))}
      </ul>
      </div>

      {/* Cursor-trailing preview frame */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-40 hidden aspect-video w-64 overflow-hidden rounded-lg border border-paper/20 shadow-2xl shadow-black/60 transition-[opacity,scale] duration-300 lg:block",
          preview ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
        style={{ transform: "translate3d(-200px,-200px,0)" }}
      >
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        )}
      </div>
    </section>
  );
}
