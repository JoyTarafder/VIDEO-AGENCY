"use client";

import { Reveal } from "@/components/ui/Motion";
import { ArrowUpRight } from "@/components/ui/Button";
import { TransitionLink } from "@/components/layout/TransitionProvider";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-fog">[ Error 404 — Slate 24 ]</p>
        <h1 className="mt-6 font-display text-[clamp(3rem,10vw,8rem)] font-extrabold uppercase leading-none tracking-tight">
          Scene <span className="text-outline-acid">missing.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-fog">
          This frame never made the final cut. Let&apos;s get you back to the set.
        </p>
        <TransitionLink
          href="/"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-acid px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-paper"
        >
          Back to the set <ArrowUpRight />
        </TransitionLink>
      </Reveal>
    </section>
  );
}
