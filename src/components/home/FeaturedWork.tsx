"use client";

import { TransitionLink } from "@/components/layout/TransitionProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Motion";
import { ArrowUpRight } from "@/components/ui/Button";
import { useI18n } from "@/i18n";
import { featuredProjects } from "@/content/projects";
import { ProjectCard } from "@/components/work/ProjectCard";
import { cn } from "@/lib/utils";

/* Editorial span pattern + vertical offsets for the asymmetric grid. */
const LAYOUT = [
  "md:col-span-7",
  "md:col-span-5 md:mt-24",
  "md:col-span-5 md:-mt-12",
  "md:col-span-7 md:mt-24",
  "md:col-span-6",
  "md:col-span-6 md:mt-16",
];

export function FeaturedWork() {
  const { t } = useI18n();

  return (
    <section className="relative px-6 py-28 md:px-10 md:py-40" aria-label="Featured work" data-scene="work">
      <SectionHeading index="02" eyebrow="Selected work" className="z-content">
        Films that moved
        <br />
        <span className="text-outline">the needle</span>
      </SectionHeading>

      <div className="z-content grid gap-x-8 gap-y-16 md:grid-cols-12 md:gap-y-8">
        {featuredProjects.map((project, i) => (
          <Reveal key={project.slug} delay={(i % 2) * 0.08} className={cn("col-span-1", LAYOUT[i % LAYOUT.length])}>
            <ProjectCard project={project} eager={i < 2} />
          </Reveal>
        ))}
      </div>

      <Reveal className="z-content mt-20 flex justify-center">
        <TransitionLink
          href="/work"
          className="group inline-flex items-center gap-3 rounded-full border border-paper/25 px-8 py-4 text-sm font-medium text-paper transition-colors hover:border-acid hover:text-acid"
        >
          {t("cta.viewAllWork")} <ArrowUpRight />
        </TransitionLink>
      </Reveal>
    </section>
  );
}
