# VIDEO AGENCY — Cinematic Video Production Site

An ultra-premium, cinematic website for a worldwide video production agency.
Dark, film-inspired art direction with a 3D hero, scroll-driven storytelling,
hover-to-play portfolio, film-wipe page transitions, and a Node.js backend for
project inquiries and newsletter signups.

> **Stack** — Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 ·
> React Three Fiber + drei · GSAP ScrollTrigger · Framer Motion · Lenis ·
> MongoDB (Mongoose) · Nodemailer (SMTP)

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see "Environment variables" below)
cp .env.example .env.local

# 3. Run the dev server
npm run dev            # → http://localhost:3000

# Production
npm run build
npm start

# Quality gates
npm run typecheck
npm run lint
```

Works with zero configuration: without `MONGODB_URI` / SMTP, the API routes
validate, log submissions server-side and still succeed — wire up the database
and email when you're ready (they hot-swap, no code changes).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for metadata, OG, sitemap, JSON-LD |
| `NEXT_PUBLIC_BOOKING_URL` | recommended | "Book a call" link (Cal.com, Calendly…) |
| `MONGODB_URI` | for persistence | MongoDB Atlas / local connection string |
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASS` | for email | Nodemailer transport. Resend works too: `smtp.resend.com`, port `465`, user `resend`, pass = API key |
| `MAIL_FROM` | for email | From-address, e.g. `"VIDEO AGENCY <no-reply@domain.com>"` |
| `CONTACT_TO` | for email | Inbox that receives inquiry notifications (comma-separated ok) |

## Where things live

```
src/
├── app/                      # Routes (App Router)
│   ├── layout.tsx            # Fonts, metadata, JSON-LD, providers
│   ├── template.tsx          # Route-enter fade (exit half = TransitionProvider wipe)
│   ├── page.tsx              # Home — hero, services, work, process, testimonials, CTA
│   ├── work/                 # Filterable video portfolio
│   ├── services/             # Detailed service blocks + sample reels
│   ├── about/                # Story, values, team
│   ├── contact/              # Project inquiry form + booking link + live studio clocks
│   ├── api/inquiries/        # POST — validation, honeypot, rate-limit, Mongo, SMTP
│   ├── api/newsletter/       # POST — footer signup, idempotent upsert
│   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg
├── components/
│   ├── layout/               # Header, Footer, SmoothScroll (Lenis), TransitionProvider,
│   │                         # Preloader (film-leader countdown), CustomCursor, GrainOverlay
│   ├── three/HeroScene.tsx   # R3F hero: glass core + aperture rings + sparkles
│   ├── home/                 # Hero, Intro, ServicesPreview, FeaturedWork, ProcessSection
│   │                         # (pinned horizontal scroll), Stats, Testimonials, Clients, CTA
│   ├── work/                 # WorkGrid (filters), ProjectCard (hover-to-play + glitch)
│   ├── services/ services/   # ServiceBlock
│   ├── video/                # Global fullscreen VideoModalProvider
│   ├── contact/              # InquiryForm, NewsletterForm, OfficeClocks
│   └── ui/                   # Magnetic, Reveal, Marquee, Counter, SectionHeading, Button…
├── content/                  # ALL copy & data: site, projects, services, home, team
├── i18n/                     # LocaleProvider + typed dictionaries (en, de, fr, es)
├── hooks/                    # Reduced-motion / fine-pointer / low-power detection
├── lib/                      # gsap setup, validation (zod), db, mailer, rate-limit, utils
└── models/                   # Mongoose schemas (Inquiry, Subscriber)
public/
├── posters/                  # Hand-crafted SVG poster art (replace with real frames)
└── videos/                   # Drop your MP4s here — see below
```

## Swapping in real content

Everything an editor needs is in **`src/content/`** — no component edits required:

1. **Videos** — drop files into `public/videos/`, then set `video: "/videos/your-file.mp4"`
   on each project in `src/content/projects.ts` and the showreel in `src/content/site.ts`.
   Any direct MP4/WebM/HLS URL also works (Mux `*.m3u8` plays in Safari; for Chrome
   HLS support add `hls.js` in `VideoModalProvider` — or use a Mux/Vimeo embed).
   The URLs shipped in the data files are short public sample clips so hover-to-play
   works out of the box.
2. **Posters** — `/public/posters/*.svg` are generated placeholder art.
   Replace with 1600×900 JPG/WebP frames and update the `poster` fields.
3. **Client logos** — `src/content/home.ts` renders styled wordmarks; drop real
   logo SVGs into `public/clients/` and swap the spans for `<img>` in `ClientsMarquee`.
4. **Team photos** — add `photo: "/team/name.jpg"` (portrait 4:5) in `src/content/team.ts`.
5. **Copy** — all section copy lives beside its data in `src/content/`.

## i18n readiness

UI chrome (nav, forms, footer, modal, 404) is fully localized via typed
dictionaries in `src/i18n/dictionaries/` (English, German, French, Spanish) with
automatic English fallback and a language switcher in the footer. To go fully
localized: move section copy from `src/content/` into per-locale dictionaries and
add locale-prefixed routing (e.g. `next-intl`) — the provider/hook pattern is
already in place.

## Performance & accessibility notes

- 3D scene is **lazy, client-only**, and gated to fine-pointer, non-low-power
  devices; everyone else gets poster + parallax. `AdaptiveDpr` protects weak GPUs.
- All videos are `preload="none"` with poster fallbacks; hover-to-play only.
- GSAP + Lenis respect `prefers-reduced-motion` globally (preloader, pins,
  marquee, cursor all disable themselves).
- SEO: per-page metadata, Organization/WebSite/VideoObject JSON-LD, generated
  Open Graph image, sitemap, robots, manifest, semantic landmarks, skip link.

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Vercel (frontend + API), MongoDB Atlas,
SMTP/Resend, plus a Render/Railway walkthrough.
