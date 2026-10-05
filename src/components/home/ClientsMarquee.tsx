"use client";

import { Marquee } from "@/components/ui/Marquee";
import { clients } from "@/content/home";
import { cn } from "@/lib/utils";

/* Fictional client wordmarks — swap the spans for <img> logo SVGs when ready. */
const variants = [
  "font-display font-extrabold tracking-tight",
  "font-mono font-bold tracking-[0.45em]",
  "font-display font-bold italic tracking-tight",
  "font-body font-bold uppercase tracking-[0.3em]",
  "font-mono font-normal tracking-[0.55em]",
  "font-display font-bold lowercase tracking-tight",
];

export function ClientsMarquee() {
  return (
    <section className="py-20 md:py-28" aria-label="Clients" data-scene="clients">
      <p className="z-content mb-10 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-fog">
        Trusted by ambitious teams worldwide
      </p>
      <Marquee className="z-content border-y border-line py-8">
        {clients.map((c, i) => (
          <span
            key={`${c.name}-${i}`}
            className={cn(
              "cursor-default whitespace-nowrap px-10 text-2xl text-paper/35 transition-colors duration-300 hover:text-acid md:px-14 md:text-4xl",
              variants[c.variant - 1]
            )}
          >
            {c.name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
