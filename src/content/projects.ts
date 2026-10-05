/**
 * Portfolio data. `video` is optional — when present, cards play it on hover
 * and the modal streams it fullscreen. Drop files into /public/videos and set
 * e.g. video: "/videos/neon-district.mp4", or paste any direct MP4/WebM/HLS URL.
 * The sample URLs below are short public clips so hover-to-play works instantly.
 */

export type ProjectCategory =
  | "Commercial"
  | "Brand Film"
  | "Social"
  | "Motion Graphics"
  | "3D & CGI";

export const categories: ProjectCategory[] = [
  "Commercial",
  "Brand Film",
  "Social",
  "Motion Graphics",
  "3D & CGI",
];

export interface Project {
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: number;
  duration: string;
  poster: string;
  video?: string;
  description: string;
  tags: string[];
  featured?: boolean;
  /** WebVTT caption track (a11y — WCAG 1.2.2). Placeholder file ships as the pattern. */
  captions?: string;
  /** Optional external transcript document. */
  transcriptUrl?: string;
}

const SAMPLE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

export const projects: Project[] = [
  {
    slug: "neon-district",
    title: "Neon District",
    client: "Volta EV",
    category: "Commercial",
    year: 2025,
    duration: "0:60",
    poster: "/posters/neon-district.svg",
    video: `${SAMPLE}/ForBiggerJoyrides.mp4`,
    description:
      "A 60-second night ride through a rain-slicked metropolis for Volta's flagship EV launch. Shot on anamorphic across three cities in eleven nights; CG city extensions and a full sonic brand world.",
    tags: ["Direction", "Production", "CG Extension", "Color"],
    featured: true,
    captions: "/captions/sample-en.vtt",
  },
  {
    slug: "the-long-game",
    title: "The Long Game",
    client: "Atlas Sportswear",
    category: "Brand Film",
    year: 2024,
    duration: "3:20",
    poster: "/posters/long-game.svg",
    video: `${SAMPLE}/ForBiggerEscapes.mp4`,
    description:
      "Brand film following four athletes through a single dawn session — 200 crew-hours of footage cut to three minutes of restraint. Premiered at Brand Film Festival New York.",
    tags: ["Documentary", "Direction", "Edit", "Sound Design"],
    featured: true,
  },
  {
    slug: "slow-mornings",
    title: "Slow Mornings",
    client: "Kōji Coffee",
    category: "Social",
    year: 2025,
    duration: "0:15",
    poster: "/posters/slow-mornings.svg",
    video: `${SAMPLE}/ForBiggerBlazes.mp4`,
    description:
      "A 36-asset social system built from one shoot day: vertical cutdowns, loops and stop-motion idents. 41M organic views in the first quarter.",
    tags: ["Social System", "Stop Motion", "Vertical", "Loops"],
    featured: true,
  },
  {
    slug: "aether",
    title: "Aether",
    client: "Aether Audio",
    category: "3D & CGI",
    year: 2024,
    duration: "1:45",
    poster: "/posters/aether.svg",
    video: `${SAMPLE}/ForBiggerFun.mp4`,
    description:
      "Full-CG product film for Aether's debut headphone — macro photography without a camera. Physically-based rendering, volumetrics and a bespoke Houdini destruction sequence.",
    tags: ["Full CGI", "Look Dev", "Houdini", "Simulation"],
    featured: true,
  },
  {
    slug: "pulse",
    title: "Pulse — Festival Titles",
    client: "Pulse Festival",
    category: "Motion Graphics",
    year: 2025,
    duration: "0:45",
    poster: "/posters/pulse.svg",
    video: `${SAMPLE}/ForBiggerMeltdowns.mp4`,
    description:
      "Main title sequence and on-screen identity for Pulse Festival — 45 seconds of generative typography driven by the headline act's master track.",
    tags: ["Title Sequence", "Generative", "Type Design", "Audio React"],
    featured: true,
  },
  {
    slug: "iron-and-silk",
    title: "Iron & Silk",
    client: "Nordwind Watches",
    category: "Brand Film",
    year: 2023,
    duration: "2:10",
    poster: "/posters/iron-silk.svg",
    video: `${SAMPLE}/ForBiggerJoyrides.mp4`,
    description:
      "A homage to slow craft for Nordwind's 50th anniversary — the movement of a mechanical watch told through probe-lens macro and a full orchestral score.",
    tags: ["Macro", "Craft", "Score", "Direction"],
    featured: true,
  },
  {
    slug: "rush-hour",
    title: "Rush Hour",
    client: "Hyperlite",
    category: "Commercial",
    year: 2024,
    duration: "0:30",
    poster: "/posters/rush-hour.svg",
    video: `${SAMPLE}/ForBiggerEscapes.mp4`,
    description:
      "Thirty seconds of controlled chaos for Hyperlite's energy launch — bullet-time rig, 48 practical effects shots and a charting soundtrack clearance.",
    tags: ["Bullet Time", "Practical FX", "Broadcast", "Cutdowns"],
  },
  {
    slug: "fields-of-data",
    title: "Fields of Data",
    client: "Vireo Cloud",
    category: "Motion Graphics",
    year: 2023,
    duration: "1:30",
    poster: "/posters/fields-of-data.svg",
    video: `${SAMPLE}/ForBiggerFun.mp4`,
    description:
      "Explaining infrastructure without a single screenshot: an abstract data-landscape in 1:30, later extended into a six-part product series.",
    tags: ["Explainer", "Abstract", "Product Series", "Design"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
