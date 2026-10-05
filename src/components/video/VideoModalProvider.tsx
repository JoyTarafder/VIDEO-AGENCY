"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLenis } from "@/components/layout/SmoothScroll";
import { useSceneStore } from "@/store/scene";
import { cn } from "@/lib/utils";

export interface VideoItem {
  title: string;
  client?: string;
  category?: string;
  year?: number;
  duration?: string;
  src?: string;
  poster: string;
  description?: string;
  /** WebVTT track for the film (a11y: WCAG 1.2.2). */
  captions?: string;
  /** Optional external transcript document. */
  transcriptUrl?: string;
}

type ModalContextValue = { openVideo: (item: VideoItem) => void };

const ModalContext = createContext<ModalContextValue | null>(null);

export const useVideoModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useVideoModal must be used inside <VideoModalProvider>");
  return ctx;
};

/**
 * Fullscreen cinematic player: letterboxed frame, corner marks, slate-style
 * metadata bar. Locks scroll, traps Tab focus, marks the background `inert`,
 * pauses the WebGL scene, and restores focus on close.
 */
export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<VideoItem | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const lenis = useLenis();
  const setPaused = useSceneStore((s) => s.setPaused);

  const openVideo = useCallback((next: VideoItem) => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setItem(next);
  }, []);

  const close = useCallback(() => {
    // Pause before unmount so playback stops immediately.
    videoRef.current?.pause();
    setItem(null);
    lastFocused.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!item) {
      setPaused(false);
      return;
    }
    setPaused(true);
    lenis?.stop();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    // Hide the page from AT and tab order while the dialog is open.
    const background = ["main", "header", "footer"]
      .map((sel) => document.querySelector<HTMLElement>(sel))
      .filter((el): el is HTMLElement => Boolean(el));
    background.forEach((el) => el.setAttribute("inert", ""));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), video, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      background.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
  }, [item, close, lenis, setPaused]);

  return (
    <ModalContext.Provider value={{ openVideo }}>
      {children}
      <AnimatePresence>
        {item && (
          <motion.div
            key="video-modal"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} — player`}
            className="fixed inset-0 z-[85] flex flex-col bg-ink/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Letterbox bars */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-10 h-[6vh] bg-ink"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 z-10 h-[6vh] bg-ink"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            />

            <div className="flex items-center justify-between px-6 py-[6vh] md:px-10">
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
                <span className="inline-block h-2 w-2 animate-blink rounded-full bg-rec" aria-hidden="true" />
                <span className="truncate text-paper">{item.title}</span>
              </div>
              <button
                ref={closeRef}
                onClick={close}
                className="group flex items-center gap-2 rounded-full border border-paper/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-colors hover:border-acid hover:text-acid"
              >
                Close <span aria-hidden="true" className="text-base leading-none transition-transform duration-300 group-hover:rotate-90">×</span>
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 pb-[6vh] md:px-10">
              <motion.div
                className="relative w-full max-w-6xl"
                initial={{ scale: 0.94, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  {item.src ? (
                    <video
                      ref={videoRef}
                      key={item.src}
                      src={item.src}
                      poster={item.poster}
                      controls
                      autoPlay
                      playsInline
                      className="h-full w-full object-contain"
                    >
                      {item.captions && (
                        <track kind="captions" src={item.captions} srcLang="en" label="English" default />
                      )}
                    </video>
                  ) : (
                    <div className="relative h-full w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.poster} alt={item.title} className="h-full w-full object-cover opacity-70" />
                      <p className="absolute inset-x-0 bottom-8 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
                        Full reel available on request — {item.client ?? "contact us"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                  <span className="text-paper">
                    {item.client ? `${item.client} — ` : ""}
                    {item.category ?? "Film"}
                  </span>
                  <span className="flex items-center gap-4">
                    {item.year && <span>{item.year}</span>}
                    {item.duration && <span>TRT {item.duration}</span>}
                    <span>4K — 24FPS</span>
                    {item.transcriptUrl && (
                      <a
                        href={item.transcriptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 transition-colors hover:text-acid"
                      >
                        Transcript
                      </a>
                    )}
                  </span>
                </div>
                {item.description && (
                  <p className={cn("mt-3 max-w-2xl text-sm leading-relaxed text-fog")}>{item.description}</p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}
