"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/i18n";

type Status = "idle" | "sending" | "success" | "error";

export function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <p className="mb-4 max-w-xs text-sm leading-relaxed text-fog">{t("newsletter.title")}</p>
      {status === "success" ? (
        <p className="flex items-center gap-2 text-sm text-acid" role="status">
          <span aria-hidden="true">▸</span> {t("newsletter.success")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex max-w-sm items-center gap-2" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={t("newsletter.placeholder")}
            className="w-full rounded-full border border-paper/20 bg-transparent px-4 py-2.5 text-sm text-paper placeholder:text-fog/60 focus:border-acid focus:outline-none"
          />
          {/* Honeypot — visually hidden, humans never fill it */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="newsletter-website">Website</label>
            <input
              id="newsletter-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="shrink-0 rounded-full bg-acid px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-60"
          >
            {status === "sending" ? t("newsletter.sending") : t("newsletter.subscribe")}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-rec" role="alert">
          {t("newsletter.error")}
        </p>
      )}
    </div>
  );
}
