import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — Cinematic Video Production Agency`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded Open Graph card: letterbox bars + wordmark on cinema black. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f2f0ea",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Letterbox bars */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#8f8e88" }}>
            {"VIDEO — PRODUCTION — WORLDWIDE"}
          </div>
          <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, background: "#ff3b30" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            VIDEO
            <div style={{ display: "flex", width: 28, height: 28, borderRadius: 14, background: "#ff3b30", margin: "0 12px" }} />
            AGENCY
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#8f8e88", marginTop: 24 }}>
            {site.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 56, height: 6, background: "#c8ff2e" }} />
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#f2f0ea" }}>
            COMMERCIALS · BRAND FILMS · SOCIAL · MOTION · 3D/CGI
          </div>
        </div>

        {/* Acid frame edge */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 2,
            background: "linear-gradient(90deg, #c8ff2e 0%, transparent 65%)",
          }}
        />
      </div>
    ),
    size
  );
}
