"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";
import { cn } from "@/lib/utils";

type TransitionContextValue = { navigate: (href: string) => void };

const TransitionContext = createContext<TransitionContextValue | null>(null);

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside <TransitionProvider>");
  return ctx;
};

const SCENE_NAMES: Record<string, string> = {
  "/": "Home",
  "/work": "Work",
  "/services": "Services",
  "/about": "About",
  "/contact": "Contact",
};

const sceneName = (href: string) =>
  SCENE_NAMES[href] ??
  (href
    .replace("/", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Home");

/**
 * Film-style wipe between routes: an ink panel with an acid leading edge
 * covers the viewport, a "CUT TO — <scene>" slate flashes while the route
 * swaps underneath, then the panel lifts away. Reads as an intentional cut,
 * not a blank screen. Reduced-motion users get an instant swap.
 * Every internal link uses <TransitionLink> to opt in.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const wipeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);
  const [scene, setScene] = useState("");

  const navigate = useCallback(
    (href: string) => {
      if (animating.current || href === pathname) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        router.push(href);
        return;
      }

      animating.current = true;
      setScene(sceneName(href));
      lenis?.stop();

      gsap
        .timeline({
          onComplete: () => {
            animating.current = false;
            lenis?.start();
          },
        })
        .set(wipeRef.current, { yPercent: 100, visibility: "visible" })
        .set(labelRef.current, { opacity: 0, y: 18 })
        .to(wipeRef.current, { yPercent: 0, duration: 0.5, ease: "power4.inOut" })
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, "-=0.12")
        .add(() => {
          // Swap the route while the screen is covered…
          window.scrollTo(0, 0);
          lenis?.scrollTo(0, { immediate: true, force: true });
          router.push(href);
        })
        .to({}, { duration: 0.1 })
        .to(labelRef.current, { opacity: 0, y: -12, duration: 0.12, ease: "power1.in" })
        .to(wipeRef.current, { yPercent: -100, duration: 0.6, ease: "power4.inOut" }, "<")
        .set(wipeRef.current, { visibility: "hidden" });
    },
    [lenis, pathname, router]
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={wipeRef}
        aria-hidden="true"
        className="invisible fixed inset-0 z-[90] flex translate-y-full items-center justify-center border-y-2 border-acid/70 bg-ink will-change-transform"
      >
        {/* Slate shown only while the screen is covered */}
        <div ref={labelRef} className="flex flex-col items-center gap-3 opacity-0">
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-fog">
            Cut to
          </span>
          <span className="font-display text-4xl font-extrabold uppercase tracking-tight text-paper md:text-6xl">
            {scene}
          </span>
          <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.4em] text-rec">
            VIDEO<span className="text-fog">●</span>AGENCY
          </span>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

/** Next <Link> that triggers the wipe transition for internal routes. */
export function TransitionLink({
  href,
  children,
  className,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  const { navigate } = useTransition();
  return (
    <Link
      href={href}
      className={cn(className)}
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
