import type { Metadata } from "next";
import { WorkGrid } from "@/components/work/WorkGrid";
import { CTABanner } from "@/components/home/CTABanner";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Commercials, brand films, social systems, motion graphics and CGI — selected films from VIDEO AGENCY, shot worldwide.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        index="W."
        eyebrow="Selected work — 2023 → 2026"
        title={
          <>
            The <span className="text-outline">reel</span>, uncensored
          </>
        }
        sub="Eight productions out of three hundred forty. Hover to roll the preview, click to play the film."
      />
      <section className="z-content relative px-6 pb-32 md:px-10" aria-label="Project grid">
        <WorkGrid />
      </section>
      <CTABanner />
    </>
  );
}
