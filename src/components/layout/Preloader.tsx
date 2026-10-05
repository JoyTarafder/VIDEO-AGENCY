"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap } from "@/lib/gsap";

const PreloaderContext = createContext<{ ready: boolean }>({ ready: false });

/** Hero and other entrance animations gate on this. */
export const useLoaderReady = () => useContext(PreloaderContext);

/**
 * Preloader: an old-film leader countdown — sweeping second hand, crosshair
 * circle, 000→100 counter — that lifts like a curtain when the reel is ready.
 * Plays once per session; skipped entirely for reduced-motion users.
 */
export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("va-intro-played");
    if (reduced || seen) {
      setReady(true);
      return;
    }

    setShowOverlay(true);
    document.body.style.overflow = "hidden";

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        window.sessionStorage.setItem("va-intro-played", "1");
        document.body.style.overflow = "";
        setReady(true);
        setShowOverlay(false);
      },
    });

    tl.to(counter, {
      v: 100,
      duration: 1.9,
      ease: "power2.inOut",
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
        }
      },
    })
      .to(panelRef.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.4");

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <PreloaderContext.Provider value={{ ready }}>
      {children}
      {showOverlay && (
        <div
          ref={panelRef}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink"
          role="presentation"
        >
          {/* Film-leader countdown circle */}
          <div className="relative flex h-56 w-56 items-center justify-center md:h-72 md:w-72">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(242,240,234,0.25)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(242,240,234,0.18)" strokeWidth="0.4" />
              <line x1="50" y1="2" x2="50" y2="14" stroke="rgba(242,240,234,0.4)" strokeWidth="0.5" />
              <line x1="50" y1="86" x2="50" y2="98" stroke="rgba(242,240,234,0.4)" strokeWidth="0.5" />
              <line x1="2" y1="50" x2="14" y2="50" stroke="rgba(242,240,234,0.4)" strokeWidth="0.5" />
              <line x1="86" y1="50" x2="98" y2="50" stroke="rgba(242,240,234,0.4)" strokeWidth="0.5" />
              <g className="origin-center animate-spin-slower" style={{ animationDuration: "2s" }}>
                <line x1="50" y1="50" x2="50" y2="6" stroke="#c8ff2e" strokeWidth="0.7" />
              </g>
            </svg>
            <span
              ref={countRef}
              className="font-mono text-5xl tabular-nums text-paper md:text-6xl"
              aria-label="Loading"
            >
              000
            </span>
          </div>

          <div className="absolute inset-x-0 top-6 flex items-center justify-between px-6 md:px-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-paper">
              VIDEO<span className="text-rec">●</span>AGENCY
            </span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.35em] text-fog sm:block">
              Picture start
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-6 flex items-center justify-between px-6 md:px-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-fog">
              Showreel — 26
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-fog">24 FPS</span>
          </div>

          <span className="sr-only">Loading…</span>
        </div>
      )}
    </PreloaderContext.Provider>
  );
}
