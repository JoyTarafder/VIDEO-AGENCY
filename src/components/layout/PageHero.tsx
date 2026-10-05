import { Reveal } from "@/components/ui/Motion";
import type { ReactNode } from "react";

/** Shared inner-page header: slate-style eyebrow + oversized display title. */
export function PageHero({
  index,
  eyebrow,
  title,
  sub,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <header className="z-content relative px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-48">
      <Reveal>
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
          <span className="text-acid">[ {index} ]</span>
          <span>{eyebrow}</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span aria-hidden="true">○ ○ ○</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h1 className="mt-8 font-display text-[clamp(2.8rem,8vw,7.5rem)] font-extrabold uppercase leading-[1] tracking-tight">
          {title}
        </h1>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-fog md:text-lg">{sub}</p>
        </Reveal>
      )}
    </header>
  );
}
