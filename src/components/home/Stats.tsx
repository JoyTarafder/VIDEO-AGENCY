"use client";

import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Motion";
import { stats } from "@/content/home";

export function Stats() {
  return (
    <section className="border-y border-line bg-coal/40" aria-label="Studio in numbers">
      <div className="z-content grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.06}
            className={`border-line px-6 py-12 text-center md:py-16 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""} ${i === 1 ? "md:border-r" : ""} ${i === 2 ? "md:border-r" : ""}`}
          >
            <p className="font-display text-5xl font-extrabold tracking-tight text-paper md:text-6xl">
              <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
              {s.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
