/** Home page data: process, stats, testimonials, client wordmarks, values. */

export const process = [
  {
    step: "01",
    title: "Concept & Script",
    duration: "1–2 weeks",
    description:
      "We interrogate the brief until it confesses. References, mood frames, scripts and a treatment you can see the finished film inside of.",
    details: ["Creative discovery call", "Script + treatment", "Look development"],
  },
  {
    step: "02",
    title: "Pre-Production",
    duration: "1–3 weeks",
    description:
      "Casting, locations, storyboards, schedules and a shot budget with zero ambiguity. You approve a plan, not a vibe.",
    details: ["Casting & scouting", "Boards & previz", "Locked schedule"],
  },
  {
    step: "03",
    title: "Production",
    duration: "1–7 days",
    description:
      "A set that runs on preparation: senior crew, anamorphic or digital cinema glass, and a director who already knows the edit.",
    details: ["Cinema-grade capture", "On-set color pipeline", "Daily selects for stakeholders"],
  },
  {
    step: "04",
    title: "Post & Motion",
    duration: "2–6 weeks",
    description:
      "Edit, sound design, grade, VFX and motion — all under one roof. Three review rounds with frame-accurate feedback tools.",
    details: ["Edit & picture lock", "VFX + motion graphics", "Grade & final mix"],
  },
  {
    step: "05",
    title: "Delivery & Beyond",
    duration: "Ongoing",
    description:
      "Every master, cutdown, subtitle and platform spec your plan needs — archived, versioned and ready for the next campaign.",
    details: ["All ratios & specs", "Subtitles & localization", "Archive & re-use license"],
  },
];

export const stats = [
  { value: 340, suffix: "+", decimals: 0, label: "films delivered" },
  { value: 96, suffix: "", decimals: 0, label: "brands worldwide" },
  { value: 28, suffix: "", decimals: 0, label: "countries shot in" },
  { value: 1.4, suffix: "B", decimals: 1, label: "organic views" },
];

export const testimonials = [
  {
    quote:
      "They treated a 30-second spot with the rigor of a feature. The film outperformed every benchmark we had — and the process felt like a partnership, not a vendor relationship.",
    name: "Dana Whitfield",
    role: "CMO",
    company: "Volta EV",
  },
  {
    quote:
      "One shoot day, forty assets, a quarter of record-breaking engagement. The system they built still runs our content calendar two years later.",
    name: "Kenji Mori",
    role: "Founder",
    company: "Kōji Coffee",
  },
  {
    quote:
      "Working across three time zones should have been chaos. It was the most organized production we've ever been part of — and the film is pure cinema.",
    name: "Ingrid Halvorsen",
    role: "Marketing Director",
    company: "Nordwind Watches",
  },
];

/** Rendered as styled wordmarks — swap for real logo SVGs in /public/clients when ready. */
export const clients = [
  { name: "VOLTA", variant: 1 },
  { name: "ATLAS", variant: 2 },
  { name: "KŌJI", variant: 3 },
  { name: "NORDWIND", variant: 4 },
  { name: "HYPERLITE", variant: 5 },
  { name: "VIREO", variant: 6 },
  { name: "AETHER", variant: 7 },
  { name: "PULSE", variant: 8 },
  { name: "MONO", variant: 2 },
  { name: "FLEUR", variant: 5 },
];

export const values = [
  {
    icon: "aperture",
    title: "Cinema first",
    description:
      "Every asset — even the 6-second cutdown — is judged by one standard: would this survive on a cinema screen?",
  },
  {
    icon: "compass",
    title: "Strategy frames the shot",
    description:
      "We start with the outcome — awareness, launch, conversion — and let the creative serve it, never the reverse.",
  },
  {
    icon: "bolt",
    title: "Production is preparation",
    description:
      "Great sets are calm because nothing is left to chance. Our shoots run on plans B and C that already exist.",
  },
  {
    icon: "globe",
    title: "Worldwide, always on",
    description:
      "Three studios, twelve time zones, one producer who owns your project end to end and answers within the day.",
  },
] as const;
