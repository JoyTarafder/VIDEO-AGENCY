"use client";

import { useVideoModal } from "@/components/video/VideoModalProvider";
import { Reveal } from "@/components/ui/Motion";
import type { Service } from "@/content/services";
import { cn } from "@/lib/utils";

/** One service: sticky slate on the left, copy + capabilities + sample reel on the right. */
export function ServiceBlock({ service, flip = false }: { service: Service; flip?: boolean }) {
  const { openVideo } = useVideoModal();

  const openReel = () =>
    openVideo({
      title: `${service.name} — sample reel`,
      client: "VIDEO AGENCY",
      category: service.name,
      poster: service.poster,
      description: service.description,
    });

  return (
    <article
      id={service.id}
      className="grid scroll-mt-28 gap-10 border-t border-line py-20 md:grid-cols-12 md:gap-16 md:py-28"
      aria-label={service.name}
    >
      {/* Slate column */}
      <div className={cn("md:col-span-5", flip && "md:order-2")}>
        <div className="md:sticky md:top-32">
          <Reveal>
            <span className="font-mono text-sm text-acid">/{service.index}</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
              {service.name}
            </h2>
            <p className="mt-2 text-lg text-paper/70">{service.short}</p>
            <p className="mt-8 font-display text-5xl font-extrabold text-paper">
              {service.stat.value}
              <span className="ml-3 align-middle font-mono text-[11px] font-normal uppercase tracking-[0.25em] text-fog">
                {service.stat.label}
              </span>
            </p>
          </Reveal>
        </div>
      </div>

      {/* Detail column */}
      <div className={cn("md:col-span-7", flip && "md:order-1")}>
        <Reveal delay={0.1}>
          <p className="max-w-2xl text-base leading-relaxed text-fog md:text-lg">
            {service.description}
          </p>

          <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
            Capabilities
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {service.capabilities.map((c) => (
              <li
                key={c}
                className="rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/80 transition-colors hover:border-acid/60 hover:text-acid"
              >
                {c}
              </li>
            ))}
          </ul>

          <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
            What you get
          </h3>
          <ul className="mt-4 space-y-2">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-center gap-3 text-sm text-paper/85">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-acid" />
                {d}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Sample reel frame */}
        <Reveal delay={0.15}>
          <button
            type="button"
            onClick={openReel}
            data-cursor="play"
            aria-label={`Play the ${service.name} sample reel`}
            className="group relative mt-12 block w-full overflow-hidden"
          >
            <div className="relative aspect-video overflow-hidden bg-coal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.poster}
                alt={`${service.name} sample reel frame`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/30"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-paper/40 bg-ink/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-acid group-hover:bg-acid">
                  <svg viewBox="0 0 10 10" className="ml-1 h-4 w-4 fill-paper transition-colors group-hover:fill-ink" aria-hidden="true">
                    <path d="M1 0v10l9-5z" />
                  </svg>
                </span>
              </span>
              <span className="absolute bottom-4 left-5 font-mono text-[11px] uppercase tracking-[0.3em] text-paper">
                Sample reel — {service.index}
              </span>
              <span className="absolute right-5 top-4 font-mono text-[10px] tracking-[0.2em] text-paper/70">
                TRT 1:00
              </span>
            </div>
          </button>
        </Reveal>
      </div>
    </article>
  );
}
