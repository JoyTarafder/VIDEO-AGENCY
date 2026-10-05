"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGSAP, gsap } from "@/lib/gsap";
import { useLoaderReady } from "@/components/layout/Preloader";
import { TransitionLink } from "@/components/layout/TransitionProvider";
import { useVideoModal } from "@/components/video/VideoModalProvider";
import { useI18n } from "@/i18n";
import { Magnetic } from "@/components/ui/Motion";
import { Timecode } from "@/components/ui/Timecode";
import { showreel, site } from "@/content/site";
import { cn } from "@/lib/utils";

const lineVar: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] } },
};

const containerVar: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

export function Hero() {
  const { t } = useI18n();
  const { ready } = useLoaderReady();
  const { openVideo } = useVideoModal();
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Reduced-motion users get the poster, never an autoplaying video.
  // Everyone else: pause while the hero is off-screen, resume on return.
  useEffect(() => {
    const video = videoElRef.current;
    const root = rootRef.current;
    if (!video || !root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduced) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduced]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      if (!ready || reduced) return;

      // Letterbox bars snap in — the "iris opens" moment.
      gsap.fromTo(
        [topBarRef.current, bottomBarRef.current],
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.1,
          ease: "power4.inOut",
          stagger: 0.14,
          transformOrigin: (i: number) => (i === 0 ? "top center" : "bottom center"),
        }
      );
      gsap.fromTo(
        mediaRef.current,
        { scale: 1.14 },
        { scale: 1, duration: 2.2, ease: "power3.out" }
      );

      // Scroll: the frame recedes while the film keeps rolling underneath.
      // (The 3D object's own exit is driven by the global scene rig.)
      const scrub = { trigger: root, start: "top top", end: "bottom top", scrub: true as const };
      gsap.to(mediaRef.current, { yPercent: 14, ease: "none", scrollTrigger: scrub });
      gsap.to(contentRef.current, { yPercent: -12, opacity: 0.1, ease: "none", scrollTrigger: scrub });
    },
    { scope: rootRef, dependencies: [ready, reduced] }
  );

  const openShowreel = () =>
    openVideo({
      title: showreel.title,
      client: site.name,
      category: "Showreel",
      year: showreel.year,
      duration: showreel.duration,
      src: showreel.src,
      poster: showreel.poster,
      captions: showreel.captions,
      description:
        "Ninety seconds through the archive — spots, brand films and CGI frames from four continents.",
    });

  return (
    <section ref={rootRef} data-scene="hero" className="relative min-h-[100svh] overflow-hidden" aria-label="Showreel">
      {/* Film layer: poster always paints; video cross-fades over it */}
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={showreel.heroPoster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        {showreel.src && (
          <video
            ref={videoElRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms]",
              videoReady ? "opacity-60" : "opacity-0"
            )}
            autoPlay={!reduced}
            muted
            loop
            playsInline
            preload="metadata"
            poster={showreel.heroPoster}
            src={showreel.src}
            onCanPlay={() => setVideoReady(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-ink/40" aria-hidden="true" />
      </div>

      {/* The 3D layer is the site-wide GlobalCanvas (z-20) — the lens assembly
          sits over the film layer here and glides into the next section. */}

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-30 mx-auto flex min-h-[100svh] w-full max-w-[110rem] flex-col justify-center px-6 pb-24 pt-28 md:px-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-fog"
        >
          <span className="inline-block h-2 w-2 animate-blink rounded-full bg-rec" aria-hidden="true" />
          {ready ? t("hero.available") : ""}
        </motion.p>

        <motion.h1
          variants={containerVar}
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="font-display text-[clamp(2.7rem,8vw,7.75rem)] font-extrabold uppercase leading-[0.98] tracking-tight"
        >
          <span className="block overflow-hidden pb-1">
            <motion.span className="block" variants={lineVar}>
              We make
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span className="block text-outline" variants={lineVar}>
              films that
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-2">
            <motion.span className="block text-acid" variants={lineVar}>
              move people
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-8 max-w-md text-base leading-relaxed text-paper/75 md:text-lg"
        >
          A worldwide video production agency crafting commercials, brand films and
          CGI for teams who refuse to be ignored.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Magnetic>
            <button
              type="button"
              onClick={openShowreel}
              className="group inline-flex items-center gap-3 rounded-full bg-acid px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-paper"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-acid transition-colors group-hover:bg-acid group-hover:text-ink">
                <svg viewBox="0 0 10 10" className="ml-0.5 h-2.5 w-2.5 fill-current" aria-hidden="true">
                  <path d="M1 0v10l9-5z" />
                </svg>
              </span>
              {t("cta.watchReel")} — {showreel.duration}
            </button>
          </Magnetic>
          <Magnetic>
            <TransitionLink
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-7 py-4 text-sm font-medium text-paper transition-colors hover:border-acid hover:text-acid"
            >
              {t("cta.startProject")}
            </TransitionLink>
          </Magnetic>
        </motion.div>
      </div>

      {/* Letterbox bars */}
      <div
        ref={topBarRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-40 h-12 origin-top border-b border-paper/10 bg-ink md:h-14"
      />
      <div
        ref={bottomBarRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-40 flex h-12 origin-bottom items-center justify-between border-t border-paper/10 bg-ink px-6 font-mono text-[10px] uppercase tracking-[0.28em] text-fog md:h-14 md:px-10 md:text-[11px]"
      >
        <span>Scene 01 — Showreel &rsquo;26</span>
        <motion.span
          className="hidden items-center gap-2 sm:flex"
          animate={reduced ? {} : { y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {t("hero.scroll")}
          <svg viewBox="0 0 12 12" className="h-3 w-3 stroke-current" aria-hidden="true">
            <path d="M6 1v10M2.5 7.5 6 11l3.5-3.5" fill="none" strokeWidth="1.2" />
          </svg>
        </motion.span>
        <span className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 md:flex">
            <span className="inline-block h-1.5 w-1.5 animate-blink rounded-full bg-rec" />
            REC
          </span>
          <Timecode className="text-acid" />
          <span className="hidden md:block">4K — 24FPS</span>
        </span>
      </div>
    </section>
  );
}
