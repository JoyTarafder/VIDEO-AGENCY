/** Route-level loading state — cheap, no client JS, on-brand. */
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-label="Loading">
      <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.4em] text-fog">
        <span className="inline-block h-2 w-2 animate-blink rounded-full bg-rec" aria-hidden="true" />
        Loading reel
        <span className="inline-flex gap-1" aria-hidden="true">
          <span className="h-1 w-1 animate-blink rounded-full bg-paper/60" />
          <span className="h-1 w-1 animate-blink rounded-full bg-paper/60 [animation-delay:0.2s]" />
          <span className="h-1 w-1 animate-blink rounded-full bg-paper/60 [animation-delay:0.4s]" />
        </span>
      </p>
    </div>
  );
}
