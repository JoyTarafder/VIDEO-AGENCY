"use client";

import { TransitionLink } from "@/components/layout/TransitionProvider";
import { Magnetic } from "@/components/ui/Motion";
import { Marquee } from "@/components/ui/Marquee";
import { ArrowUpRight } from "@/components/ui/Button";

/**
 * Closing CTA: giant display type, a slow outline marquee bleeding behind,
 * and a magnetic circular "Let's roll" button — the conversion moment.
 */
export function CTABanner() {
  return (
    <section className="relative overflow-hidden px-6 py-32 text-center md:py-52" aria-label="Start a project" data-scene="cta">
      {/* Ghost marquee backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center opacity-[0.06]">
        <Marquee slow pauseOnHover={false}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap px-8 font-display text-[16vw] font-extrabold uppercase leading-none tracking-tight text-outline">
              Let&apos;s roll —
            </span>
          ))}
        </Marquee>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid/10 blur-[140px]"
      />

      <div className="z-content">
        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.35em] text-fog">
          [ 06 — Your story ]
        </p>
        <h2 className="mx-auto max-w-5xl font-display text-[clamp(2.6rem,7.5vw,7rem)] font-extrabold uppercase leading-[1.02] tracking-tight">
          Got a story
          <br />
          worth <span className="text-outline">telling?</span>
        </h2>

        <div className="mt-14 flex justify-center">
          <Magnetic strength={0.45}>
            <TransitionLink
              href="/contact"
              className="group grid h-40 w-40 place-items-center rounded-full bg-acid text-center font-semibold text-ink shadow-[0_0_80px_rgba(200,255,46,0.25)] transition-colors duration-300 hover:bg-paper md:h-48 md:w-48"
            >
              <span className="flex flex-col items-center gap-2 text-lg leading-tight">
                Let&apos;s roll
                <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </TransitionLink>
          </Magnetic>
        </div>

        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
          Replies within one business day — wherever you are
        </p>
      </div>
    </section>
  );
}
