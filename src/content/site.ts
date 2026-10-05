/**
 * Global site config — the single place for brand-level facts.
 */

export const site = {
  name: "VIDEO AGENCY",
  legalName: "Video Agency Studio LLC",
  tagline: "Cinematic film & video production — worldwide.",
  description:
    "VIDEO AGENCY is a worldwide video production agency crafting commercials, brand films, social video, motion graphics and 3D/CGI for brands that refuse to be ignored.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://cal.com/your-handle/intro-call",
  email: "hello@videoagency.studio",
  newBusiness: "new-business@videoagency.studio",
  careers: "talent@videoagency.studio",
  phone: "+1 (310) 555-0140",
  founded: 2014,
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/video.agency" },
    { label: "Vimeo", href: "https://vimeo.com/videoagency" },
    { label: "Behance", href: "https://www.behance.net/videoagency" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/video-agency" },
  ],
  offices: [
    { city: "Los Angeles", detail: "5410 Sunset Blvd — HQ", tz: "America/Los_Angeles" },
    { city: "London", detail: "12 Charlotte Rd, Shoreditch", tz: "Europe/London" },
    { city: "Singapore", detail: "78 South Bridge Rd", tz: "Asia/Singapore" },
  ],
} as const;

/**
 * Showreel source. Accepts anything a <video> tag can play (MP4/WebM/HLS).
 * ▸ REPLACE with your own reel: drop `showreel.mp4` into /public/videos and
 *   set this to "/videos/showreel.mp4" — or paste a Mux / Vimeo file URL.
 * The current URL is a short public sample clip so the player works out of the box.
 */
export const showreel = {
  title: "Showreel 2026",
  src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  /** Text-free art for the hero backdrop (the headline owns that frame). */
  heroPoster: "/posters/showreel-hero.svg",
  /** Type-led art for the player/poster contexts. */
  poster: "/posters/showreel.svg",
  /** Placeholder WebVTT — swap for the real mix transcript. */
  captions: "/captions/sample-en.vtt",
  year: 2026,
  duration: "90 SEC",
};
