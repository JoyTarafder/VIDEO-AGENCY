"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Motion";
import { values } from "@/content/home";
import { team } from "@/content/team";
import { site } from "@/content/site";
import { Marquee } from "@/components/ui/Marquee";

/* Stroke-drawn SVG icons — pathLength animates 0→1 when scrolled into view. */
type Seg = { tag: "path" | "circle"; d?: string; cx?: number; cy?: number; r?: number };

const ICONS: Record<string, Seg[]> = {
  aperture: [
    { tag: "circle", cx: 12, cy: 12, r: 9 },
    { tag: "path", d: "M12 3v6M21 12h-6M12 21v-6M3 12h6" },
    { tag: "path", d: "M18.4 5.6l-4.3 4.3M18.4 18.4l-4.3-4.3M5.6 18.4l4.3-4.3M5.6 5.6l4.3 4.3" },
  ],
  compass: [
    { tag: "circle", cx: 12, cy: 12, r: 9 },
    { tag: "path", d: "M15.5 8.5 13 13l-4.5 2.5L11 11z" },
  ],
  bolt: [{ tag: "path", d: "M13 2 4.5 13.5H11L9.5 22 18 10.5h-6.5L13 2Z" }],
  globe: [
    { tag: "circle", cx: 12, cy: 12, r: 9 },
    { tag: "path", d: "M3 12h18" },
    { tag: "path", d: "M12 3c2.8 2.6 4 5.6 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.6-4-9s1.2-6.4 4-9Z" },
  ],
};

const draw = (j: number) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true },
  transition: { duration: 1.1, delay: 0.15 + j * 0.14, ease: "easeInOut" as const },
});

export function Values() {
  return (
    <section className="z-content relative px-6 py-24 md:px-10 md:py-32" aria-label="Values">
      <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.35em] text-fog">
        [ What we believe ]
      </p>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => (
          <Reveal
            key={v.title}
            delay={i * 0.07}
            className="bg-ink p-8 transition-colors duration-300 hover:bg-coal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-acid"
              aria-hidden="true"
            >
              {(ICONS[v.icon] ?? []).map((seg, j) =>
                seg.tag === "circle" ? (
                  <motion.circle key={j} cx={seg.cx} cy={seg.cy} r={seg.r} {...draw(j)} />
                ) : (
                  <motion.path key={j} d={seg.d} {...draw(j)} />
                )
              )}
            </svg>
            <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-tight">{v.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fog">{v.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function TeamGrid() {
  return (
    <section className="z-content relative px-6 py-24 md:px-10 md:py-32" aria-label="Team">
      <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.35em] text-fog">
        [ The crew — principals ]
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m, i) => (
          <Reveal key={m.name} delay={(i % 3) * 0.07}>
            <article className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-coal">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  /* Duotone portrait placeholder — drop photos into /public/team to replace */
                  <div
                    className="absolute inset-0 grid place-items-center transition-transform duration-700 group-hover:scale-[1.05]"
                    style={{
                      background: `radial-gradient(120% 120% at 30% 20%, hsl(${m.hue} 90% 55% / 0.28), transparent 60%), linear-gradient(160deg, #1a1a18 0%, #0d0d0c 100%)`,
                    }}
                  >
                    <span className="font-display text-7xl font-extrabold tracking-tight text-paper/25">
                      {m.initials}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent"
                    />
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-4 rounded-full border border-paper/20 bg-ink/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-paper/80 backdrop-blur-sm"
                >
                  {m.base}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-tight transition-colors group-hover:text-acid">
                {m.name}
              </h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                {m.role}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CultureMarquee() {
  const items = [
    "EST. 2014",
    "LOS ANGELES",
    "LONDON",
    "SINGAPORE",
    "340+ FILMS",
    "28 COUNTRIES",
    "4K — 24FPS",
    site.name,
  ];
  return (
    <section aria-hidden="true" className="border-y border-line py-6">
      <Marquee slow pauseOnHover={false}>
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-center whitespace-nowrap px-8 font-mono text-sm uppercase tracking-[0.4em] text-paper/30"
          >
            {item}
            <span className="ml-8 inline-block h-1.5 w-1.5 rounded-full bg-acid/50" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
