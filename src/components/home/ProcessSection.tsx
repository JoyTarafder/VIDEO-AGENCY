"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/gsap";
import { process } from "@/content/home";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * The process, told horizontally: the section pins and the reel of steps
 * translates as you scroll (desktop, motion-allowed). On mobile it falls
 * back to a native snap-scroll track.
 */
export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        if (!track) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: 1,
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      data-scene="process"
      className="relative overflow-hidden py-28 md:flex md:h-screen md:flex-col md:justify-center md:py-0"
      aria-label="Our process"
    >
      <div className="z-content px-6 md:px-10">
        <SectionHeading index="03" eyebrow="Concept → edit → delivery" className="mb-10 md:mb-12">
          The reel, frame
          <br />
          by <span className="text-acid">frame</span>
        </SectionHeading>
      </div>

      <div
        ref={trackRef}
        className="z-content flex snap-x snap-mandatory gap-10 overflow-x-auto px-6 pb-4 md:w-max md:snap-none md:gap-20 md:overflow-visible md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {process.map((step) => (
          <article
            key={step.step}
            className="w-[82vw] shrink-0 snap-start border-l border-line pl-6 md:w-[30rem] md:pl-10"
          >
            <div className="flex items-baseline gap-4">
              <span className="font-display text-6xl font-extrabold text-outline-acid md:text-7xl">
                {step.step}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                {step.duration}
              </span>
            </div>
            <h3 className="mt-6 font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              {step.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-fog md:text-base">{step.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {step.details.map((d) => (
                <li
                  key={d}
                  className="rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70"
                >
                  {d}
                </li>
              ))}
            </ul>
          </article>
        ))}
        <div aria-hidden="true" className="w-2 shrink-0" />
      </div>

      {/* Progress hairline (desktop scrub) */}
      <div aria-hidden="true" className="mx-6 mt-10 hidden h-px bg-line md:mx-10 md:block">
        <div ref={progressRef} className="h-px origin-left scale-x-0 bg-acid" />
      </div>
    </section>
  );
}
