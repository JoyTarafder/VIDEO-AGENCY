import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Motion";

/**
 * Section header in the house style: a mono index/eyebrow rule framed like
 * a film slate, followed by an oversized display title.
 * Pass the title as children to mix solid and outlined words.
 */
export function SectionHeading({
  index,
  eyebrow,
  children,
  className,
  size = "lg",
}: {
  index: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={cn("mb-14 md:mb-20", className)}>
      <Reveal>
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-fog">
          <span className="text-acid">[ {index} ]</span>
          <span>{eyebrow}</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span className="hidden sm:block" aria-hidden="true">
            ○ ○ ○
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "mt-6 font-display font-bold uppercase leading-[1.02] tracking-tight text-paper",
            size === "lg" ? "text-[clamp(2.4rem,6vw,5.5rem)]" : "text-[clamp(1.9rem,4vw,3.4rem)]"
          )}
        >
          {children}
        </h2>
      </Reveal>
    </div>
  );
}
