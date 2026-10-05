/** Team grid for /about. Swap `initials` placeholders for portrait photos when ready:
 *  add images to /public/team and give each member a `photo: "/team/mara.jpg"` field. */

export interface TeamMember {
  name: string;
  role: string;
  base: string;
  initials: string;
  hue: number;
  photo?: string;
}

export const team: TeamMember[] = [
  { name: "Mara Voss", role: "Executive Producer", base: "Los Angeles", initials: "MV", hue: 78 },
  { name: "Jonas Beck", role: "Founder / Director", base: "London", initials: "JB", hue: 4 },
  { name: "Yuki Tanaka", role: "Head of 3D & CGI", base: "Singapore", initials: "YT", hue: 165 },
  { name: "Amara Diallo", role: "Director of Photography", base: "London", initials: "AD", hue: 32 },
  { name: "Leo Marchetti", role: "Lead Editor / Colorist", base: "Los Angeles", initials: "LM", hue: 260 },
  { name: "Sofia Reyes", role: "Head of Post", base: "Singapore", initials: "SR", hue: 200 },
];
