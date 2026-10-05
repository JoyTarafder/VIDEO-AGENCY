"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { categories, projects, type ProjectCategory } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/* Editorial span pattern for the 12-col grid (keeps it asymmetric). */
const LAYOUT = [
  "md:col-span-7",
  "md:col-span-5 md:mt-24",
  "md:col-span-5 md:-mt-12",
  "md:col-span-7 md:mt-24",
  "md:col-span-6",
  "md:col-span-6 md:mt-16",
  "md:col-span-7 md:-mt-8",
  "md:col-span-5 md:mt-12",
];

export function WorkGrid() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <div className="z-content">
      {/* Filter slate */}
      <div className="mb-14 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          {t("work.filterAll")}
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)}>
            {c}
          </FilterChip>
        ))}
      </div>

      <motion.div layout className="grid gap-x-8 gap-y-16 md:grid-cols-12 md:gap-y-8">
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className={cn("col-span-1", LAYOUT[i % LAYOUT.length])}
            >
              <ProjectCard project={project} eager={i < 2} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="py-24 text-center font-mono text-sm uppercase tracking-[0.25em] text-fog">
          {t("work.empty")}
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-300",
        active
          ? "border-acid bg-acid text-ink"
          : "border-paper/20 text-paper/70 hover:border-paper/50 hover:text-paper"
      )}
    >
      {children}
    </button>
  );
}
