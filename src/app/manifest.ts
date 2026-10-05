import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VIDEO AGENCY — Cinematic Video Production",
    short_name: "VIDEO AGENCY",
    description:
      "Worldwide film & video production — commercials, brand films, social, motion graphics and CGI.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
