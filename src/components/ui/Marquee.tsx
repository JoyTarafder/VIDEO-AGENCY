import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite marquee. Children are rendered twice on a translating track
 * (translateX -50% → 0) so the loop is seamless; hover pauses the roll.
 */
export function Marquee({
  children,
  className,
  slow = false,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  slow?: boolean;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-center",
          slow ? "animate-marquee-slow" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
