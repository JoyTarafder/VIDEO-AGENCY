/**
 * Per-section "shots": camera pose, object blocking and grade.
 * The rig continuously lerps toward the active shot, so moving from one
 * section to the next is always a camera glide, never a cut.
 *
 * Each section gets its own film-production object (cinema camera, film
 * strips, clapperboard, timeline…) — add a Shot here when a section gets
 * its data-scene attribute. Unknown ids fall back to the parked "page" shot.
 */
export type V3 = [number, number, number];

export interface Shot {
  cam: V3;
  look: V3;
  obj: V3;
  scale: number;
  /** accent light / glow color for the section's grade */
  tint: string;
  /** glow sprite strength */
  glow: number;
}

export const SHOTS: Record<string, Shot> = {
  hero: {
    cam: [0, 0, 6.4], look: [0, 0, 0], obj: [1.75, 0.05, 0],
    scale: 1.02, tint: "#c8ff2e", glow: 0.5,
  },
  // Intro: clapperboard + floating film frames enter as the hero camera exits.
  intro: {
    cam: [0.35, 0.1, 7.1], look: [0, 0, 0], obj: [2.5, 0.05, -0.5],
    scale: 0.8, tint: "#dcff8a", glow: 0.35,
  },
  // Parked shots — Steps B/C/D replace these with themed treatments.
  services: {
    cam: [-0.35, 0, 7.3], look: [0, 0, 0], obj: [-4.1, 1.1, -1.6],
    scale: 0.42, tint: "#c8ff2e", glow: 0.3,
  },
  work: {
    cam: [0, 0.15, 7.5], look: [0, 0, 0], obj: [4.3, 2.7, -2.2],
    scale: 0.38, tint: "#c8ff2e", glow: 0.28,
  },
  process: {
    cam: [0, 0, 7.2], look: [0, 0, 0], obj: [0, -5.2, -1.5],
    scale: 0.5, tint: "#c8ff2e", glow: 0.22,
  },
  clients: {
    cam: [0, 0, 7.4], look: [0, 0, 0], obj: [0, 5.4, -2],
    scale: 0.34, tint: "#c8ff2e", glow: 0.22,
  },
  testimonials: {
    cam: [0.2, 0, 7.3], look: [0, 0, 0], obj: [-3.9, -1.5, -1.4],
    scale: 0.42, tint: "#dcff8a", glow: 0.28,
  },
  cta: {
    cam: [0, 0, 6.9], look: [0, 0, 0], obj: [0, -1.15, -4.6],
    scale: 0.42, tint: "#c8ff2e", glow: 0.55,
  },
  footer: {
    cam: [0, 0.2, 7.6], look: [0, 0, 0], obj: [0, -4.55, -1.6],
    scale: 0.5, tint: "#c8ff2e", glow: 0.22,
  },
  // Routes without registered sections (until Step D) — object fully off-frame
  // (below the frustum incl. float wobble), only the ambient particle field remains.
  page: {
    cam: [0, 0, 7.4], look: [0, 0, 0], obj: [0, -8.6, -6],
    scale: 0.3, tint: "#c8ff2e", glow: 0,
  },
  // Not a section: the hero camera's exit pose during the hero→intro handover
  // (flies off left while the clapperboard enters from the right).
  handoff: {
    cam: [0.35, 0.1, 7.1], look: [0, 0, 0], obj: [-5.4, 1.3, -2.2],
    scale: 0.25, tint: "#dcff8a", glow: 0.1,
  },
};

export function getShot(id: string): Shot {
  return SHOTS[id] ?? SHOTS.page;
}
