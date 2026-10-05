"use client";

import { useState, type FormEvent } from "react";
import { inquirySchema, type InquiryInput } from "@/lib/validation";
import { useI18n } from "@/i18n";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";
type FieldErrors = Partial<Record<keyof InquiryInput, string>>;

const PROJECT_TYPE_OPTIONS: InquiryInput["projectType"][] = [
  "Commercial / TVC",
  "Brand Film",
  "Social Video",
  "Motion Graphics",
  "3D / CGI / Animation",
  "Not sure yet",
];

const BUDGET_OPTIONS: InquiryInput["budget"][] = [
  "< $10k",
  "$10k – $25k",
  "$25k – $50k",
  "$50k – $100k",
  "$100k+",
  "Let's discuss",
];

const inputClass =
  "w-full rounded-lg border border-paper/20 bg-coal/60 px-4 py-3 text-sm text-paper placeholder:text-fog/60 transition-colors focus:border-acid focus:outline-none";
const labelClass = "mb-2 block font-mono text-[11px] uppercase tracking-[0.25em] text-fog";

export function InquiryForm() {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setFormError(false);

    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      projectType: String(fd.get("projectType") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
      locale,
    };

    // Client-side pre-validation; the API re-validates as source of truth.
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""])));
      setFormError(true);
      return;
    }
    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { id?: string };
      setReference(data.id ?? null);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-acid/40 bg-coal/60 p-10 text-center" role="status">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-acid">
          [ Take one — printed ]
        </p>
        <h3 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight">
          {t("form.successTitle")}
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-fog">
          {t("form.successBody")}
        </p>
        {reference && (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
            Reference — <span className="text-paper">{reference.slice(0, 12)}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Honeypot — visually hidden, humans never fill it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {t("form.name")} *
          </label>
          <input id="name" name="name" type="text" autoComplete="name" className={cn(inputClass, errors.name && "border-rec")} />
          {errors.name && <p className="mt-1.5 text-xs text-rec">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {t("form.email")} *
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className={cn(inputClass, errors.email && "border-rec")} />
          {errors.email && <p className="mt-1.5 text-xs text-rec">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>
            {t("form.company")}
          </label>
          <input id="company" name="company" type="text" autoComplete="organization" className={inputClass} />
        </div>
        <div>
          <label htmlFor="projectType" className={labelClass}>
            {t("form.projectType")} *
          </label>
          <select id="projectType" name="projectType" defaultValue="" required className={cn(inputClass, "appearance-none")}>
            <option value="" disabled className="bg-ink">
              —
            </option>
            {PROJECT_TYPE_OPTIONS.map((o) => (
              <option key={o} value={o} className="bg-ink">
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="budget" className={labelClass}>
            {t("form.budget")} *
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("form.budget")}>
            {BUDGET_OPTIONS.map((b, i) => (
              <label
                key={b}
                className="cursor-pointer rounded-full border border-paper/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/70 transition-colors has-[:checked]:border-acid has-[:checked]:bg-acid has-[:checked]:text-ink hover:border-paper/50"
              >
                <input
                  type="radio"
                  name="budget"
                  value={b}
                  defaultChecked={i === BUDGET_OPTIONS.length - 1}
                  className="sr-only"
                />
                {b}
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClass}>
            {t("form.message")} *
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder={t("form.messagePlaceholder")}
            className={cn(inputClass, "resize-y", errors.message && "border-rec")}
          />
          {errors.message && <p className="mt-1.5 text-xs text-rec">{errors.message}</p>}
        </div>
      </div>

      {formError && (
        <p className="mt-4 text-sm text-rec" role="alert">
          {t("form.validation")}
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-rec" role="alert">
          {t("form.errorBody")}{" "}
          <a href={`mailto:${site.newBusiness}`} className="underline underline-offset-4 hover:text-paper">
            {site.newBusiness}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="group mt-8 inline-flex items-center gap-3 rounded-full bg-acid px-8 py-4 text-sm font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-60"
      >
        {status === "sending" ? t("form.sending") : t("form.send")}
        <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current transition-transform duration-300 group-hover:translate-x-1" fill="none" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="square" />
        </svg>
      </button>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
        By sending you agree to be contacted about this inquiry. No newsletters, no spam.
      </p>
    </form>
  );
}
