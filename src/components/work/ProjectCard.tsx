"use client";

import { useRef, useState } from "react";
import { useVideoModal } from "@/components/video/VideoModalProvider";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";

/**
 * Widescreen project frame. On hover: the preview video rolls (poster gets a
 * Ken Burns drift when no video exists), the chromatic glitch filter kicks in,
 * and the custom cursor morphs into a PLAY disc. Click opens the fullscreen
 * cinematic player.
 */
export function ProjectCard({
  project,
  className,
  eager = false,
}: {
  project: Project;
  className?: string;
  eager?: boolean;
}) {
  const { openVideo } = useVideoModal();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);

  const open = () =>
    openVideo({
      title: project.title,
      client: project.client,
      category: project.category,
      year: project.year,
      duration: project.duration,
      src: project.video,
      poster: project.poster,
      description: project.description,
      captions: project.captions,
      transcriptUrl: project.transcriptUrl,
    });

  const start = () => {
    setHover(true);
    videoRef.current?.play().catch(() => {});
  };
  const stop = () => {
    setHover(false);
    videoRef.current?.pause();
  };

  return (
    <article className={className}>
      <button
        type="button"
        onClick={open}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        data-cursor="play"
        aria-label={`Play ${project.title} for ${project.client}`}
        className="group block w-full text-left"
      >
        <div className="relative aspect-video overflow-hidden bg-coal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.poster}
            alt={`${project.title} — ${project.client}, ${project.category}`}
            loading={eager ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-700 ease-out",
              hover && !project.video && "[animation:ken-burns_7s_ease-in-out_infinite_alternate]",
              hover && "glitch scale-[1.04]"
            )}
          />
          {project.video && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              src={project.video}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                hover ? "opacity-95" : "opacity-0"
              )}
            />
          )}

          {/* Frame chrome */}
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 rounded-full border border-paper/20 bg-ink/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-paper/90 backdrop-blur-sm"
          >
            {project.duration}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/80 to-transparent"
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-3 left-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/80 transition-opacity",
              hover ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="inline-block h-1.5 w-1.5 animate-blink rounded-full bg-rec" />
            Rolling preview
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight transition-colors group-hover:text-acid md:text-2xl">
            {project.title}
          </h3>
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-fog">
            {project.client} · {project.year}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
          {project.category}
        </p>
      </button>
    </article>
  );
}
