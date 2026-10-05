/**
 * Services — each renders a detailed block on /services and a row on the home preview.
 * `poster` reuses project art; point it at dedicated reel art whenever you have it.
 */

export interface Service {
  id: string;
  index: string;
  name: string;
  short: string;
  description: string;
  capabilities: string[];
  deliverables: string[];
  poster: string;
  stat: { value: string; label: string };
}

export const services: Service[] = [
  {
    id: "commercials",
    index: "01",
    name: "Commercials & TVC",
    short: "Scroll-stopping spots for every screen.",
    description:
      "From 6-second bumpers to 90-second hero spots — we develop the idea, direct the shoot, and deliver broadcast-ready masters with every cutdown your media plan needs. In-house directors, color and online.",
    capabilities: ["Concept & script", "Direction", "Full production service", "Broadcast delivery", "Cutdown systems", "Celebrity & talent handling"],
    deliverables: ["Master 4K + broadcast QC", "9:16 / 1:1 / 16:9 cutdowns", "Subtitled & localized versions"],
    poster: "/posters/neon-district.svg",
    stat: { value: "180+", label: "spots delivered" },
  },
  {
    id: "brand-films",
    index: "02",
    name: "Brand Films & Documentaries",
    short: "The story behind the brand, told properly.",
    description:
      "Longer-form films that build belief: founder stories, culture pieces and documentary series. We embed with your team, find the narrative spine and deliver films people choose to finish.",
    capabilities: ["Story development", "Documentary direction", "Multi-day production", "Interview direction", "Original score", "Festival strategy"],
    deliverables: ["Hero film (2–10 min)", "Teaser & trailer edits", "Photo + BTS package"],
    poster: "/posters/long-game.svg",
    stat: { value: "60+", label: "brand films" },
  },
  {
    id: "social",
    index: "03",
    name: "Social & Content Systems",
    short: "Engineered for the feed, built to last.",
    description:
      "We don't make one video and hope — we design content systems: shoot days that yield dozens of assets, templates your team can reuse, and hook-first editing tuned to each platform's grammar.",
    capabilities: ["Platform strategy", "Vertical-first shooting", "Hook & retention editing", "Creator collabs", "Monthly retainers", "Asset systems"],
    deliverables: ["30–60 assets per shoot day", "Editable templates", "Performance review session"],
    poster: "/posters/slow-mornings.svg",
    stat: { value: "500M+", label: "organic views" },
  },
  {
    id: "motion",
    index: "04",
    name: "Motion Graphics & Animation",
    short: "Design that moves with intent.",
    description:
      "Title sequences, product explainers, idents and full brand motion systems. Our design team builds in Figma and After Effects with type-first art direction — no template energy.",
    capabilities: ["Title design", "2D animation", "Cel & stop motion", "Brand motion systems", "Data visualization", "Sound design"],
    deliverables: ["Motion guidelines", "Master + platform versions", "Source project files"],
    poster: "/posters/pulse.svg",
    stat: { value: "400+", label: "motion projects" },
  },
  {
    id: "cgi",
    index: "05",
    name: "3D, CGI & VFX",
    short: "Photoreal worlds, impossible shots.",
    description:
      "Full-CG product films, digital doubles, CG set extensions and invisible VFX. Physically-based look dev, Houdini simulation and a render farm that doesn't sleep — integrated with live-action or standing alone.",
    capabilities: ["Full-CG films", "Look dev & lighting", "Houdini FX", "Set extension", "Digital doubles", "Invisible VFX"],
    deliverables: ["4K/6K masters", "Turntable & stills", "WebGL-ready assets"],
    poster: "/posters/aether.svg",
    stat: { value: "8", label: "CGI artists in-house" },
  },
];
