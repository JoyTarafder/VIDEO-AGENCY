import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CTABanner } from "@/components/home/CTABanner";
import { Values, TeamGrid, CultureMarquee } from "@/components/about/AboutSections";
import { Reveal } from "@/components/ui/Motion";

export const metadata: Metadata = {
  title: "About",
  description:
    "VIDEO AGENCY is a worldwide collective of directors, producers, animators and editors — studios in Los Angeles, London and Singapore since 2014.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        index="A."
        eyebrow="The studio — est. 2014"
        title={
          <>
            Built like a crew,
            <br />
            <span className="text-outline">not an agency</span>
          </>
        }
        sub="Three studios, twelve time zones, one standard: cinema."
      />

      {/* Story */}
      <section className="z-content relative px-6 pb-8 md:px-10" aria-label="Story">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <p className="font-display text-[clamp(1.4rem,2.8vw,2.4rem)] font-bold leading-[1.25] tracking-tight">
              We started in a rented edit suite with one rule that never changed —
              <span className="text-acid"> treat a 6-second ad like a scene from a feature.</span>{" "}
              Ten years on, that rule has carried us from local spots to launch films for
              brands on four continents.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="md:col-span-5 md:pt-2">
            <div className="space-y-4 text-sm leading-relaxed text-fog md:text-base">
              <p>
                Directors, producers, animators and editors sit together — literally, across
                three studios. Ideas don&apos;t get thrown over walls, because there are no
                walls: the person who pitches your concept is in the grade, and the colorist
                has been in the dailies since day one.
              </p>
              <p>
                We work worldwide and shoot anywhere the story lives — 28 countries so far —
                with a producer who owns your project end to end and answers within the day.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Values />
      <CultureMarquee />
      <TeamGrid />
      <CTABanner />
    </>
  );
}
