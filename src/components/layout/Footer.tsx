"use client";

import { site } from "@/content/site";
import { useI18n, locales, type Locale } from "@/i18n";
import { TransitionLink } from "./TransitionProvider";
import { NewsletterForm } from "@/components/contact/NewsletterForm";
import { OfficeClock } from "@/components/contact/OfficeClocks";
import { Timecode } from "@/components/ui/Timecode";
import { ArrowUpRight } from "@/components/ui/Button";

const columns = [
  { title: "Sitemap", links: [
    { href: "/work", key: "nav.work" as const },
    { href: "/services", key: "nav.services" as const },
    { href: "/about", key: "nav.about" as const },
    { href: "/contact", key: "nav.contact" as const },
  ]},
];

export function Footer() {
  const { t, locale, setLocale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-ink" data-scene="footer">
      <div className="z-content px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-20 md:px-10">
        {/* Mobile: Sitemap and Social sit side by side (2-col base grid). */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12 md:gap-14">
          {/* Newsletter + wordmark */}
          <div className="col-span-2 md:col-span-5">
            <NewsletterForm />
            <TransitionLink
              href="/"
              aria-label="VIDEO AGENCY — home"
              className="mt-10 block font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold uppercase leading-none tracking-tight text-outline transition-opacity hover:opacity-80"
            >
              VIDEO
              <span className="text-rec [-webkit-text-stroke:0]">●</span>
              <br />
              AGENCY
            </TransitionLink>
          </div>

          {/* Sitemap */}
          {columns.map((col) => (
            <nav key={col.title} className="col-span-1 md:col-span-2" aria-label={col.title}>
              <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <TransitionLink href={l.href} className="group inline-flex items-center gap-1.5 text-sm text-paper/85 hover:text-acid">
                      {t(l.key)}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Socials */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">Social</h3>
            <ul className="space-y-3">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-paper/85 hover:text-acid"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studios + language */}
          <div className="col-span-2 md:col-span-3">
            <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
              {t("contact.offices")}
            </h3>
            <ul className="space-y-3 text-sm">
              {site.offices.map((o) => (
                <li key={o.city}>
                  <OfficeClock city={o.city} tz={o.tz} className="flex justify-between gap-4" />
                </li>
              ))}
            </ul>
            <label className="mt-8 block">
              <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
                {t("footer.language")}
              </span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="rounded-md border border-paper/20 bg-transparent px-3 py-2 text-sm text-paper focus:border-acid focus:outline-none"
              >
                {locales.map((l) => (
                  <option key={l} value={l} className="bg-ink text-paper">
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="z-content mt-16 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-fog sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {site.legalName} — {t("footer.rights")}
          </span>
          <span className="flex items-center gap-5">
            <span>EST. {site.founded}</span>
            <Timecode className="text-acid" />
            <span>4K — 24FPS</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
