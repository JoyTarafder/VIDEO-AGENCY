import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { InquiryForm } from "@/components/contact/InquiryForm";
import { OfficeClocks } from "@/components/contact/OfficeClocks";
import { Reveal } from "@/components/ui/Motion";
import { ArrowUpRight } from "@/components/ui/Button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with VIDEO AGENCY — tell us about your film, your timeline and your budget. A producer replies within one business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        index="C."
        eyebrow="New business — worldwide"
        title={
          <>
            Let&apos;s make
            <br />
            <span className="text-outline">your film</span>
          </>
        }
        sub="Tell us what you're making. A producer — not a form robot — replies within one business day."
      />

      <section className="z-content relative grid gap-16 px-6 pb-32 md:grid-cols-12 md:px-10" aria-label="Contact">
        {/* Studio info column */}
        <Reveal className="md:col-span-5">
          <div className="space-y-10">
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
                Direct lines
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                  <span className="text-fog">{site.newBusiness.split("@")[1]} — new business</span>
                  <a href={`mailto:${site.newBusiness}`} className="font-medium text-paper hover:text-acid">
                    {site.newBusiness.split("@")[0]}
                  </a>
                </li>
                <li className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                  <span className="text-fog">Careers — crew & talent</span>
                  <a href={`mailto:${site.careers}`} className="font-medium text-paper hover:text-acid">
                    {site.careers.split("@")[0]}
                  </a>
                </li>
                <li className="flex items-baseline justify-between gap-4">
                  <span className="text-fog">Phone — LA studio</span>
                  <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="font-medium text-paper hover:text-acid">
                    {site.phone}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
                Prefer to talk?
              </h2>
              <a
                href={site.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-4 inline-flex items-center gap-3 rounded-full border border-paper/25 px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:border-acid hover:text-acid"
              >
                Book a 20-min intro call
                <ArrowUpRight />
              </a>
            </div>

            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
                Studios — local time
              </h2>
              <OfficeClocks className="mt-4" />
            </div>
          </div>
        </Reveal>

        {/* Form column */}
        <Reveal delay={0.1} className="md:col-span-7">
          <h2 className="mb-8 font-display text-2xl font-bold uppercase tracking-tight">
            Project inquiry
          </h2>
          <InquiryForm />
        </Reveal>
      </section>
    </>
  );
}
