"use client";

import { TransitionLink } from "@/components/layout/TransitionProvider";
import { ArrowUpRight } from "@/components/ui/Button";

/** Branded route-error boundary — matches the 404 "scene" language. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-fog">
        [ Runtime error{error.digest ? ` — ${error.digest}` : ""} ]
      </p>
      <h1 className="mt-6 font-display text-[clamp(3rem,10vw,8rem)] font-extrabold uppercase leading-none tracking-tight">
        Cut <span className="text-outline-acid">short.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-md text-fog">
        Something interrupted the take. Try again — or head back to the set.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-acid px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-paper"
        >
          Try again
        </button>
        <TransitionLink
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-paper/25 px-7 py-3.5 font-medium text-paper transition-colors hover:border-acid hover:text-acid"
        >
          Back to the set <ArrowUpRight />
        </TransitionLink>
      </div>
    </section>
  );
}
