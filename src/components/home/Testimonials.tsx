"use client";

import { Reveal } from "@/components/ui/Motion";
import { testimonials } from "@/content/home";
import { FrameMarks } from "@/components/ui/FrameMarks";

export function Testimonials() {
  return (
    <section className="relative px-6 py-28 md:px-10 md:py-40" aria-label="Testimonials" data-scene="testimonials">
      <FrameMarks />
      <p className="z-content mb-14 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-fog">
        [ 05 — Word of mouth ]
      </p>
      <div className="z-content grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <figure className="flex h-full flex-col justify-between rounded-2xl border border-line bg-coal/50 p-8 transition-colors duration-300 hover:border-acid/40">
              <blockquote className="text-base leading-relaxed text-paper/90 md:text-lg">
                <span aria-hidden="true" className="mb-3 block font-display text-4xl leading-none text-acid">
                  &ldquo;
                </span>
                {t.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-line pt-5">
                <p className="text-sm font-semibold text-paper">{t.name}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                  {t.role} — {t.company}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
