"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { SmoothScroll } from "./SmoothScroll";
import { TransitionProvider } from "./TransitionProvider";
import { PreloaderProvider } from "./Preloader";
import { CustomCursor } from "./CustomCursor";
import { GrainOverlay } from "./GrainOverlay";
import { VideoModalProvider } from "@/components/video/VideoModalProvider";
import { I18nProvider } from "@/i18n";

/* The persistent WebGL layer — client-only, its own chunk. */
const GlobalCanvas = dynamic(() => import("@/components/three/GlobalCanvas"), { ssr: false });

/** Client-side composition root: everything that needs browser APIs lives here. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <I18nProvider>
        <TransitionProvider>
          <PreloaderProvider>
            <VideoModalProvider>
              <GlobalCanvas />
              {children}
              <GrainOverlay />
              <CustomCursor />
            </VideoModalProvider>
          </PreloaderProvider>
        </TransitionProvider>
      </I18nProvider>
    </SmoothScroll>
  );
}
