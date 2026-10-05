import { cn } from "@/lib/utils";

/** Corner crop-marks — the film-frame motif for non-hero sections. */
export function FrameMarks({ className }: { className?: string }) {
  const mark = "absolute h-5 w-5 border-paper/30";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-4", className)}>
      <span className={cn(mark, "left-0 top-0 border-l border-t")} />
      <span className={cn(mark, "right-0 top-0 border-r border-t")} />
      <span className={cn(mark, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(mark, "bottom-0 right-0 border-b border-r")} />
    </div>
  );
}
