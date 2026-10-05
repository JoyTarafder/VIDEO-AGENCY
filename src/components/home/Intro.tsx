"use client";

import { useRef } from "react";
import { Reveal } from "@/components/ui/Motion";
import { ArrowUpRight } from "@/components/ui/Button";
import { TransitionLink } from "@/components/layout/TransitionProvider";
import { useGSAP, gsap } from "@/lib/gsap";

const STATEMENT =
  "We are a worldwide collective of directors, producers, animators and editors — turning brand ambitions into cinema, from six-second cutdowns to six-minute epics.";

/** Studio statement: words ink in one by one as the section scrolls through. */
export function Intro() {
  const rootRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const words = wordsRef.current?.querySelectorAll<HTMLElement>("[data-word]");
      if (!words?.length) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(words, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 78%",
            end: "top 25%",
            scrub: true,
          },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} data-scene="intro" className="relative px-6 py-28 md:px-10 md:py-44">
      <FrameRule />
      <div className="relative z-30 grid gap-12 md:grid-cols-12">
        <p
          ref={wordsRef}
          className="font-display text-[clamp(1.6rem,3.6vw,3.1rem)] font-bold leading-[1.18] tracking-tight md:col-span-9"
        >
          {STATEMENT.split(" ").map((word, i) => (
            <span key={`${word}-${i}`} data-word className="inline-block">
              {word === "cinema," || word === "cinema" ? (
                <span className="text-acid">{word}</span>
              ) : (
                word
              )}
              {"\u00A0"}
            </span>
          ))}
        </p>
        <Reveal delay={0.15} className="md:col-span-3 md:pt-3">
          <p className="text-sm leading-relaxed text-fog">
            Founded in 2014 between Los Angeles, London and Singapore — one producer owns
            your film from first call to final master, wherever your time zone sits.
          </p>
          <TransitionLink
            href="/about"
            className="group mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-paper hover:text-acid"
          >
            The studio <ArrowUpRight />
          </TransitionLink>
        </Reveal>
      </div>
    </section>
  );
}

function FrameRule() {
  return <span aria-hidden="true" className="absolute left-6 right-6 top-8 h-px bg-line md:left-10 md:right-10" />;
}
