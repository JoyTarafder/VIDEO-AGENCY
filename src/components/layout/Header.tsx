"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { Magnetic } from "@/components/ui/Motion";
import { cn } from "@/lib/utils";
import { TransitionLink } from "./TransitionProvider";

const links = [
  { href: "/work", key: "nav.work" },
  { href: "/services", key: "nav.services" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
] as const;

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Glass on scroll, hide on scroll-down, reveal on scroll-up.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 32);
        setHidden(y > 140 && y > last);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Mobile menu a11y: hide the page from AT, move focus in, Escape to close,
  // restore focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const background = ["main", "footer"]
      .map((sel) => document.querySelector<HTMLElement>(sel))
      .filter((el): el is HTMLElement => Boolean(el));
    background.forEach((el) => el.setAttribute("inert", ""));
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      background.forEach((el) => el.removeAttribute("inert"));
      document.removeEventListener("keydown", onKey);
      toggle?.focus?.();
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-all duration-500",
          scrolled && !hidden
            ? "border-b border-line bg-ink/80 backdrop-blur-md"
            : "border-b border-transparent",
          hidden && !open && "-translate-y-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 md:px-10">
          <TransitionLink
            href="/"
            aria-label="VIDEO AGENCY — home"
            className="group flex items-center font-mono text-sm font-bold tracking-[0.22em] text-paper"
          >
            VIDEO
            <span
              aria-hidden="true"
              className="mx-1.5 inline-block h-2 w-2 animate-blink rounded-full bg-rec transition-colors group-hover:bg-acid"
            />
            AGENCY
          </TransitionLink>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {links.map((l) => (
              <TransitionLink
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={cn(
                  "relative -mx-1 -my-2 px-1 py-2 font-mono text-[12px] uppercase tracking-[0.2em] transition-colors",
                  pathname === l.href ? "text-acid" : "text-paper/80 hover:text-paper"
                )}
              >
                {t(l.key)}
                {pathname === l.href && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-3 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-acid"
                  />
                )}
              </TransitionLink>
            ))}
            <Magnetic strength={0.25}>
              <TransitionLink
                href="/contact"
                className="rounded-full bg-acid px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-paper"
              >
                {t("cta.startProject")}
              </TransitionLink>
            </Magnetic>
          </nav>

          <button
            type="button"
            ref={toggleRef}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="px-2 py-2 font-mono text-xs uppercase tracking-[0.25em] text-paper md:hidden"
          >
            {open ? t("nav.close") : t("nav.menu")}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            className="fixed inset-0 z-[65] flex flex-col justify-center bg-ink px-8 md:hidden"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <nav className="flex flex-col gap-3" aria-label="Mobile">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <TransitionLink
                    href={l.href}
                    className={cn(
                      "font-display text-5xl font-bold uppercase tracking-tight",
                      pathname === l.href ? "text-acid" : "text-paper"
                    )}
                  >
                    {t(l.key)}
                  </TransitionLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <TransitionLink
                  href="/contact"
                  className="inline-block rounded-full bg-acid px-7 py-3.5 font-semibold text-ink"
                >
                  {t("cta.startProject")}
                </TransitionLink>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
