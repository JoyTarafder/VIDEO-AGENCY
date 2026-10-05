# AUDIT_REPORT.md — VIDEO AGENCY (`video-agency/`)

**Audit date:** 2026-10-05 · **Scope:** architecture, performance, security, backend/DB, SEO, accessibility, UX/motion, responsive, i18n, DevOps, testing
**Method:** full source scan of `src/` + configs; real runs of `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm audit`, `npm outdated`; grep-based evidence pass. Findings cite `file:line` or verbatim snippets. Anything requiring a live environment is marked **NEEDS MANUAL CHECK** with instructions. **No code was changed in this pass.**

> Note: a previous, now-stale audit was found in this repo (preserved as `AUDIT_REPORT.previous.md`). Its build-failure finding ("Invariant: no direct app page entry for /icon.svg") no longer reproduces — the current clean build passes 15/15 (verified below) — and it cites `src/components/three/HeroScene.tsx`, which no longer exists (replaced by `objects/CinemaCamera.tsx` during the film-themed redesign).

---

## 1. Executive Summary

**Verdict:** A genuinely strong creative front-end — cohesive cinematic design system, one disciplined WebGL pipeline, real data validation — sitting on an under-hardened production skeleton: no security headers, an open Image Optimizer policy, zero tests, two material accessibility gaps (modal focus order, video captions), one live performance bug (adaptive quality tier never applied), and 8 npm-audit vulnerabilities (fixes for the two main packages are major-version bumps).

| # | Area | Score /10 | Justification |
|---|------|-----------:|---------------|
| 1 | Architecture & Code Quality | **7.5** | Clean modular structure, strict TS, zero `any`; missing error/loading boundaries; 1 lint error + 4 warnings; minor dead code |
| 2 | Performance | **6.5** | Good code-splitting + DPR strategy; but adaptive-quality bug, always-on WebGL rendering, hero video never pauses, no WebM/HLS |
| 3 | Security | **6.0** | Real validation/honeypot/rate-limiting; **no security headers**, open image-optimizer policy, 8 audit vulns, no body cap |
| 4 | Backend & Database | **7.0** | Fail-safe email, idempotent upsert, indexes, cached serverless connection; in-memory limiter, no body cap, PII in logs |
| 5 | SEO | **8.0** | Metadata/canonical/sitemap/JSON-LD/dynamic OG image all present; placeholder video assets, no hreflang |
| 6 | Accessibility | **6.0** | Excellent reduced-motion coverage + skip link; **no focus traps, no video captions**, autoplay under reduced motion |
| 7 | UX & Motion Quality | **8.5** | Cohesive film language, real polish, clear conversion ladder; hover-heavy but tap alternatives exist |
| 8 | Responsive & Cross-browser | **7.5** | `100svh`, `overflow-x clip`, WebGL gated on low-end; Safari/iOS specifics NEEDS MANUAL CHECK |
| 9 | i18n & Content | **6.5** | 4-locale chrome dictionaries with EN fallback; content EN-only (documented), no hreflang |
| 10 | DevOps & Deployment | **6.5** | Build passes, docs good; no CI, no monitoring/analytics, no `engines` field |
| 11 | Testing & Maintainability | **2.0** | Zero tests of any kind |
| — | **Overall** | **6.8** | Launch blockers are cheap; list below |

### Top 5 critical risks
1. **P-1 (perf bug):** `PerformanceMonitor` writes the quality tier to the store, but `SceneContents` never subscribes — particle count and post-processing are frozen at initial values. The adaptive-quality system only half-exists.
2. **S-1:** No security headers at all (no CSP/HSTS/X-Frame-Options — `next.config.ts` has no `headers()`).
3. **S-2:** `images.remotePatterns: [{ hostname: "**" }]` turns the Next Image Optimizer into a fetch-any-host proxy (SSRF/cost abuse) the moment it's used.
4. **A11Y-1 / A11Y-2:** No focus trap in the video modal or mobile menu; project videos have no captions/text alternative (WCAG 1.2.2 + focus-order failures, legal exposure).
5. **T-1 + A-2:** Zero tests while `eslint.ignoreDuringBuilds: true` lets lint errors ship — nothing catches regressions mechanically.

### Top 5 quick wins (≤ 1h each)
1. Subscribe `SceneContents` to the quality tier → particles + post-FX become genuinely adaptive.
2. Add security headers via `next.config.ts` `headers()` (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, baseline CSP).
3. Delete or enumerate `images.remotePatterns` (the app currently uses plain `<img>` everywhere).
4. Add branded `app/error.tsx` + `app/loading.tsx`.
5. Newsletter honeypot + 20 KB body-cap + origin check on both POST routes.

---

## 2. Findings Table

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low · ⚪ Info

| ID | Area | Sev | Evidence (file:line / snippet) | Issue | Why it matters | Recommended fix |
|----|------|-----|--------------------------------|-------|-----------------|-----------------|
| P-1 | Perf | 🟠 | `src/components/three/SceneContents.tsx:63-64` — `<ParticleField count={PARTICLES[useSceneStore.getState().quality]} />` · `<Effects enabled={useSceneStore.getState().quality >= 1} />` | Quality tier is read via `getState()` **during render**; `SceneContents` has no store subscription, so it never re-renders when `PerformanceMonitor` lowers/raises the tier (only `QualityDpr`, lines 81-85, which subscribes, reacts) | The adaptive-quality promise is decorative: slow devices keep full particle load + post-FX (only DPR adapts) | `const quality = useSceneStore((s) => s.quality)` in `SceneContents`, pass to both children |
| P-2 | Perf | 🟡 | `src/components/three/SceneContents.tsx` — `InvalidateOnActivity`: `const loop = () => { if (!running) return; invalidate(); raf = requestAnimationFrame(loop); }` | rAF invalidates every frame while the tab is visible → `frameloop="demand"` behaves as `always` | Continuous GPU/CPU draw; battery drain on laptops; modal-open and idle states still render | Add idle cutoff (stop invalidating when rig lerps settled + pointer idle) and pause while the video modal is open |
| P-3 | Perf | 🟡 | `src/components/home/Hero.tsx:97-106` — `<video … autoPlay muted loop playsInline preload="metadata" …>` | Hero video keeps playing when scrolled off-screen (only visual opacity fades via GSAP) | Wasted bandwidth/CPU all session; competes with LCP | IntersectionObserver → pause/play; load video on idle, poster-first |
| P-4 | Perf | 🟡 | `src/content/site.ts:16-21`, `src/content/projects.ts` (`SAMPLE` URLs) | All videos are remote Google sample-bucket MP4s; no WebM/AV1, no HLS/Mux/CDN | No control over size/availability; production content pipeline missing | Mux/Cloudflare Stream or self-hosted MP4+WebM; README documents the swap — implement it |
| S-1 | Sec | 🟠 | `next.config.ts` (grep `headers` → none) | No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | Clickjacking/MIME/MITM exposure; no CSP ceiling on XSS | Add `headers()` with the standard hardening set + `frame-ancestors 'none'` |
| S-2 | Sec | 🟠 | `next.config.ts:9` — `remotePatterns: [{ protocol: "https", hostname: "**" }]` | Image Optimizer accepts any HTTPS host | Open fetch proxy (SSRF/cost) once `next/image` is used | Remove (app uses plain `<img>` today) or enumerate real hosts |
| S-3 | Sec | 🟠 | `npm audit` (real output): **8 vulnerabilities (1 moderate, 7 high)** — nodemailer 6.10.1 ×4 (GHSA-cc9r-2j5m-2m83, GHSA-6vj9-mwq6-2f5v, GHSA-8vvx-rff5-p5rq, GHSA-v53p-9fqp-m79j), postcss ≤8.5.22 ×4 via next | Email delivery manipulation/DoS surface; build-time XSS/arbitrary-read in PostCSS | Production risk; fixes are major bumps (nodemailer@10, next@16) | `npm audit fix` (non-breaking) now; schedule the two major upgrades with tests |
| S-4 | Sec | 🟡 | `src/app/api/inquiries/route.ts:27`, `newsletter/route.ts:22` | POST endpoints accept any origin/content-type (no CSRF/origin check) | Low risk today (no cookies/auth), becomes real with any session feature | Compare `origin` header against `NEXT_PUBLIC_SITE_URL`; reject mismatches |
| S-5 | Sec | 🟡 | same lines — `body = await req.json()` with no Content-Length check | Unbounded request body | Serverless memory DoS | Reject `content-length > ~20 KB` before parsing |
| S-6 | Sec | 🔵 | `src/lib/validation.ts:31-33` (newsletter schema = email only) vs inquiry honeypot at :24-25 | Newsletter has no honeypot | Spam signups → DB pollution + outbound welcome spam | Mirror the inquiry honeypot |
| S-7 | Sec | 🔵 | `src/app/api/inquiries/route.ts:72-77`, `newsletter/route.ts:52`, `lib/mailer.ts:75` — `console.log("[inquiry…] (no DB configured)", { from: \`${data.name} <${data.email}>\` … })` | PII (name, email, budget) written to server logs | GDPR data-minimization; platform log aggregation exposure | Log a reference id only |
| S-8 | Sec | 🔵 | `src/lib/rate-limit.ts` (`clientIp` takes first `x-forwarded-for` entry) | Spoofable limiter key on non-proxy hosts | Rate-limit bypass outside Vercel/known proxies | Behind Vercel it's platform-set (OK); assert/strip or document for other hosts |
| S-9 | Sec | ⚪ | `src/lib/mailer.ts:84` — `replyTo: \`${data.name} <${data.email}>\`` | Header-injection reliance on nodemailer sanitization; bodies are HTML-escaped via `escape()` ✓ | NEEDS MANUAL CHECK on installed version; the nodemailer@10 upgrade resolves the advisory family | Upgrade nodemailer; add unit test for CRLF in name/email |
| A-1 | Arch | 🟡 | `src/app/` listing — no `error.tsx`, `global-error.tsx`, `loading.tsx` | No branded error/loading states | Runtime exception → default Next error page; forms have no pending boundary | Add both; keep brand voice ("Scene missing" style) |
| A-2 | Arch | 🟡 | `next.config.ts:6` — `eslint: { ignoreDuringBuilds: true }` | Lint errors cannot fail the build | A-3's error ships silently | Fix lint, remove flag |
| A-3 | Arch | 🔵 | `npm run lint` (real output): `next-env.d.ts:3 error triple-slash-reference`; `Preloader.tsx:12 warning 'cn' unused`; `VideoModalProvider.tsx:72 warning ref cleanup`; `db.ts:18,20 unused eslint-disable directives` | 1 error + 4 warnings | Noise hides signal; generated file needs an ignore entry | Add `next-env.d.ts` to eslint ignores; fix the four warnings |
| A-4 | Arch | 🔵 | `src/components/three/SceneContents.tsx` (export tail) — `export type { Shot }` unused elsewhere; radial-glow texture duplicated (rig `glowTex` vs `CinemaCamera.makeRadialTexture`) | Dead code + duplication | Maintainability | Consolidate into one texture util |
| A11Y-1 | A11y | 🟠 | `src/components/video/VideoModalProvider.tsx:62` — `closeRef.current?.focus()` only; `Header.tsx` mobile menu similar | No focus trap; Tab escapes dialogs into background content; background not `inert` | WCAG 2.2 focus-order failure on the site's core interaction | Implement trap (or native `<dialog>`); keyboard-release already restores focus ✓ |
| A11Y-2 | A11y | 🟠 | `src/components/video/VideoModalProvider.tsx:134` — `<video controls …>` with no `<track>` | No captions/transcript for project films | WCAG 1.2.2 failure; legal exposure | Add `tracks` + transcript fields to project data; render `<track kind="captions">` |
| A11Y-3 | A11y | 🟡 | `src/components/home/Hero.tsx:102` — `autoPlay` ungated | Hero video autoplays under `prefers-reduced-motion` (3D/preloader/Lenis are gated; video is not) | Vestibular trigger; wasted data | Poster-only under reduced motion; play only after user opt-in |
| A11Y-4 | A11y | 🔵 | `src/app/globals.css:40` — `html.has-cursor * { cursor: none !important; }` | Native cursor hidden everywhere on fine pointers (incl. inputs) | Intentional awwwards pattern; loses text-caret affordance | Scope away from `input/textarea`; document toggle |
| A11Y-5 | A11y | 🔵 | `Header.tsx` nav links ≈28 px tall; chips ≈34 px | Target size: AA 2.5.8 (≥24 px) passes; AAA (≥44 px) doesn't | Touch comfort | Expand hit area via padding |
| B-1 | Backend | 🟡 | `src/lib/rate-limit.ts` — in-memory `Map` | Per-instance limiter in serverless | Effective limit = N × configured | Upstash/Redis at launch (documented in DEPLOYMENT.md) |
| B-2 | Backend | 🔵 | `src/lib/db.ts:34` — `mongoose.connect(MONGODB_URI, { dbName: undefined })` | No-op option; no `serverSelectionTimeoutMS` | Cold Mongo failures can hang a serverless invocation ~30 s | Drop `dbName`; set explicit 5 s timeouts |
| B-3 | Backend | 🔵 | `src/app/api/inquiries/route.ts` success payload — `{ ok, id, persisted, notified }` | Internal config state exposed to clients | Noisy contract; tells bots whether DB/mail exist | Return `{ ok: true, id }` |
| B-4 | Backend | ⚪ | `models/Inquiry.ts`, `models/Subscriber.ts`, routes | Idempotent `$setOnInsert` upsert, email indexes, unique subscriber, timestamps, per-send try/catch, consistent `{ ok }` errors, correct 201/400/429 | **Pass** | — |
| SEO-1 | SEO | 🔵 | `src/content/site.ts:16-21` — VideoObject `contentUrl` = Google sample MP4; `thumbnailUrl` = `/posters/showreel.svg` | Placeholder video assets; SVG thumbnails are not eligible for Google video rich results | Video SEO claims invalid until replaced | Real MP4 + raster poster; validate in Rich Results Test — NEEDS MANUAL CHECK |
| SEO-2 | SEO | 🔵 | `src/i18n/index.tsx:28,38` (localStorage locale) + no `alternates.languages` | 4 UI locales but no hreflang/route segments | de/fr/es users get mixed-language pages; no per-locale URLs for search | Locale routing (next-intl) or drop the public switcher |
| SEO-3 | SEO | 🔵 | `src/content/site.ts` socials; `Footer.tsx` links | Placeholder social profile URLs | Broken outbound trust signals | Replace with real profiles |
| UX-1 | UX | 🔵 | `ProjectCard.tsx`, `ServicesPreview.tsx` | Hover previews have no touch preview gesture (tap opens the full modal — acceptable alternative) | Mobile users skip the tease | Optional first-tap preview on touch |
| UX-2 | UX | 🔵 | content files + `Footer` | Placeholder media/socials (by design, loudly commented) | Unprofessional if shipped as-is | Content swap task (also see P-4/SEO-3) |
| R-1 | Resp | 🔵 | `src/app/layout.tsx` (no `viewport-fit=cover`); footer bottom bar | No safe-area padding for notched phones | Home-indicator overlap on iOS | `viewport-fit=cover` + `env(safe-area-inset-bottom)` |
| R-2 | Resp | ⚪ | `GlobalCanvas.tsx` gating (reduced/coarse/low-power → no canvas) | WebGL fallback policy is solid; Safari/iOS autoplay + backdrop-filter + Lenis feel | NEEDS MANUAL CHECK on real devices |
| I-1 | i18n | ⚪ | `src/i18n/index.tsx` | Typed dictionaries en/de/fr/es, EN fallback, `documentElement.lang` synced, localStorage persistence; content EN-only by design; counter uses `Intl` | Pass as *ready*, not *complete* (documented) |
| D-1 | DevOps | 🟡 | repo root — no `.github/workflows`, no Sentry/analytics wiring, `package.json` has no `engines` | No CI, no error monitoring, runtime unpinned (dev uses Node 26; Vercel default differs) | Silent regressions; opaque prod failures | CI (typecheck+lint+build), Sentry, `engines: { "node": ">=20" }` |
| D-2 | DevOps | ⚪ | `.gitignore` (`.env*`, `.next`), `public/posters` = 44 KB total, no videos in repo | Secrets and heavy assets excluded; `.next` 367 MB is local-only build output | **Pass** |
| D-3 | DevOps | ⚪ | `README.md`, `DEPLOYMENT.md` | Setup, env matrix, Vercel/Render/Railway/Atlas/Resend walkthroughs, post-deploy checklist | **Pass** — good docs |
| T-1 | Testing | 🟠 | `find` for `*.test.*`/`*.spec.*` → none; no test script in package.json | Zero automated tests; `eslint.ignoreDuringBuilds` compounds it | Every change is a manual-QA gamble | Vitest (validation/API/rate-limit) + Playwright smoke |

---

## 3. Detailed Findings by Area

### 1) Architecture & Code Quality — 7.5/10
**Good.** Feature-first folders (`components/{layout,three,home,work,services,video,contact,ui}`, `content/`, `lib/`, `models/`, `store/`, `i18n/`, `hooks/`); content data fully separated from components; `tsconfig` `strict: true` and `npx tsc --noEmit` exits clean (verified this pass); grep for `any` returns **nothing** (the one R3F typing escape used `as never` and was removed with the old blob material); server/client boundary is disciplined — server pages compose client islands, and all 39 `"use client"` files justify themselves (browser APIs: WebGL, GSAP, media, storage); API routes pinned `runtime = "nodejs"`.
**Wrong:** A-1 (no error/loading boundaries), A-2 (lint suppressed at build time), A-3 (current lint output), A-4 (small dead code + a duplicated canvas-texture factory). Env handling is solid: `.env.example` documents every variable, all secrets server-side, fail-safe defaults, and no client-bundled secrets exist.

### 2) Performance — 6.5/10
**Good (measured now):** fresh `npm run build` — shared First Load JS **103 kB**, home **231 kB**, routes 174–221 kB, all pages static except the two API functions. three/drei/postprocessing live in an async chunk behind a two-stage dynamic import (`Providers → GlobalCanvas → SceneContents`), so WebGL costs nothing before hydration. Card videos use `preload="none"` + poster (`ProjectCard.tsx:79`), hero video `preload="metadata"` with a tiny SVG poster for LCP. Fonts via `next/font` with `display: swap`. DPR capped `[1, 1.5]` with tier control. GSAP hygiene verified: every scroll effect runs inside `useGSAP` scopes; `SceneDirector` reverts its context on route change; cursor/rAF/interval cleanups all present — **no leak found in static review**.
**Wrong:** P-1 (broken adaptive quality), P-2 (always-on WebGL invalidate loop — demand in name only), P-3 (hero video never pauses off-screen), P-4 (no modern codecs/streaming). `will-change` usage is minimal and appropriate (`Hero.tsx` media layer only). Lighthouse/field metrics: **NEEDS MANUAL CHECK** (§7).

### 3) Security — 6/10
**Good:** one zod schema is the single source of truth shared by client pre-validation and server truth (`lib/validation.ts`); server re-validates and returns field-level errors only (no stack traces); inquiry honeypot is silently accepted (correct anti-enumeration behavior); per-IP sliding-window rate limit with `Retry-After`; email HTML is escaped (`escape()` helper); JSON-LD is built from server constants (the two `dangerouslySetInnerHTML` uses are safe); no SQL/NoSQL injection surface (zod enums + mongoose casting; no user input reaches operators); `.gitignore` covers `.env*` and only `.env.example` is committed; no hardcoded secrets (grep clean).
**Wrong:** S-1 (headers), S-2 (image policy), S-3 (8 audit vulns — real output quoted in table), S-4 (no origin check), S-5 (no body cap), S-6 (newsletter spam surface), S-7 (PII in logs). CSP note: if a strict CSP is added, the two inline JSON-LD scripts will need hashes.

### 4) Backend & Database — 7/10
**Good:** fail-safe email (DB/SMTP outages never produce a 500 for the visitor — verified live earlier with `persisted: "logged", notified: false`); global mongoose connection cache (serverless-safe); indexed emails + unique subscriber; idempotent newsletter upsert via `$setOnInsert`; consistent `{ ok }` envelope with 201/400/429; rate limiting on both endpoints.
**Wrong:** B-1 (in-memory limiter), B-2 (connection options sloppiness/timeouts), B-3 (internal flags in the success payload). Also add a boot-time warning when `MONGODB_URI` is absent in a production build — currently the dev-friendly "log instead of persist" path is silent.

### 5) SEO — 8/10
**Good:** `metadataBase` + title template + OG/Twitter (layout.tsx:20-44); per-page titles/descriptions/canonicals (e.g. `work/page.tsx:10`); `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.svg`, dynamic `opengraph-image.tsx`; Organization + WebSite JSON-LD in the root layout and VideoObject on the home page; semantic single-h1 pages; alt text on all meaningful imagery; marquee duplicates are `aria-hidden`.
**Wrong:** SEO-1 (VideoObject points at placeholder MP4 + SVG thumbnail — invalid for video rich results until replaced), SEO-2 (no hreflang), SEO-3 (placeholder socials).

### 6) Accessibility — 6/10
**Good:** unusually thorough reduced-motion coverage (global CSS kill-switch in `globals.css`, Lenis skipped, preloader skipped via sessionStorage+matchMedia, WebGL never mounted, transitions reduced to instant, marquees frozen by the CSS override); skip-to-content link; `aria-current` navigation; `aria-pressed` filter chips; `role="dialog" aria-modal` + Escape on the player; labeled form fields with server-mirrored error text; `role="status"` success panels; visible `:focus-visible` rings.
**Wrong:** A11Y-1 (no focus trap — background content stays tabbable), A11Y-2 (no captions — the films are the product), A11Y-3 (autoplay under reduced motion), A11Y-4/5 (cursor policy, target sizes). Contrast of the key pairs (`#8f8e88` fog on `#0a0a0a` ≈ 5.6:1; `#f2f0ea` ≈ 18:1) passes AA on paper — **NEEDS MANUAL CHECK** with a contrast tool over the video-scrim areas.

### 7) UX, Design & Motion — 8.5/10
**Good:** one continuous film language (grain, slates, letterbox, timecode, REC dots) across every section and page; preloader plays once per session; the route wipe is ~1.2 s and reads as an intentional cut; magnetic buttons, cursor labels, and hover previews all have consistent behavior; forms have human success/error states ("Scene received."); the conversion ladder (watch reel → featured work → services → CTA → contact/booking) is coherent; hover-only features degrade to tap = full modal.
**Wrong:** nothing structural. Pre-launch polish is content, not design: replace placeholder MP4s/socials; optional touch preview gesture (UX-1); custom cursor remains a taste item (A11Y-4).

### 8) Responsive & Cross-browser — 7.5/10
**Good:** `min-h-[100svh]` avoids the iOS vh jump; `overflow-x: clip` guards against marquee/horizontal bleed; WebGL is gated to fine-pointer, non-low-power devices (mobile never mounts the canvas); `color-scheme: dark`; `themeColor` set; modern unprefixed `backdrop-filter` only.
**NEEDS MANUAL CHECK:** iOS Safari autoplay/data-saver behavior on the hero video; Firefox WebGL2 with the postprocessing chain; the canvas-texture `fillRect`-based sprocket rendering (no `roundRect` dependency — safe); notch/safe-area (R-1); Samsung Internet.

### 9) i18n & Content Accessibility — 6.5/10
Typed dictionaries for en/de/fr/es with automatic EN fallback; locale persisted and applied to `document.documentElement.lang`; switcher in the footer; `Intl` used for the compact counter; office clocks use fixed `en-GB` formatting deliberately. Content files, JSON-LD, and transactional emails are EN-only — this is documented as the upgrade path (move copy into dictionaries, add locale routing). No RTL requirement for the shipped locales. See SEO-2 for the hreflang gap.

### 10) DevOps & Deployment — 6.5/10
**Good:** build green on the current code (15/15 routes); `.env.example` complete; DEPLOYMENT.md covers Vercel + Atlas + Resend/SMTP + Render/Railway split with a post-deploy checklist; README documents content swapping and quality tuning; no large assets in git.
**Wrong:** D-1 (no CI/monitoring/engines). Also note for launch: the API intentionally succeeds without Mongo/SMTP (graceful dev fallback) — add a production boot warning so a misconfigured deploy can't silently run without persistence.

### 11) Testing & Maintainability — 2/10
No test files exist (verified by find) and no test script exists. Dependency health: caret ranges (reproducible via `package-lock.json` ✓) but several majors behind (next 16, zod 4, mongoose 9, framer-motion 14, eslint 10) and 8 audit findings. Highest-value first tests: `lib/validation.ts` (pure functions), both API routes (zod/honeypot/rate-limit/persistence mock), one Playwright smoke (home → work → filter → modal → contact → submit), one reduced-motion smoke.

---

## 4. Performance Budget

| Metric | Current (measured) | Recommended budget | Status |
|---|---|---|---|
| Shared First Load JS | **103 kB** | ≤ 120 kB | ✅ |
| Home First Load JS | **231 kB** | ≤ 250 kB (cinematic), ≤ 170 kB (standard) | ✅ cinematic / ⚠️ standard |
| 3D chunk | async, excluded from First Load | ≤ 1 MB async | ✅ architecture — exact size NEEDS MANUAL CHECK (@next/bundle-analyzer) |
| Hero LCP | SVG poster `<img>` (≈3–6 KB) + video cross-fade | LCP < 2.5 s mobile | NEEDS MANUAL CHECK (Lighthouse mobile ×3) |
| Video payload/session | 1 autoplay remote MP4 + hover MP4s on demand | hero ≤ 3 MB; hover ≤ 2 MB; paused off-screen | ❌ P-3/P-4 (sample-bucket sizes uncontrolled — NEEDS MANUAL CHECK) |
| WebGL | 1 canvas, DPR ≤ 1.5, ≤ ~1.4k particles, FX = bloom+CA+noise | 60 fps on mid-tier laptop GPU | NEEDS MANUAL CHECK (fix P-1 first, then profile) |
| CLS | posters inside fixed `aspect-video` frames; `display: swap` fonts | < 0.1 | Likely ✅ — NEEDS MANUAL CHECK |
| Repo asset weight | posters 44 KB; no videos committed | ≤ 10 MB | ✅ |

---

## 5. Prioritized Action Plan

### P0 — fix before launch
| # | Action | Effort |
|---|--------|--------|
| 1 | P-1: subscribe `SceneContents` to the quality tier (one-line + pass-down) | S |
| 2 | S-1 + S-2: security headers; delete/enumerate `remotePatterns` | S |
| 3 | S-3: `npm audit fix` (non-breaking); plan nodemailer@10 + next@16 with tests | M |
| 4 | A11Y-1: focus trap + background `inert` for video modal and mobile menu | M |
| 5 | A11Y-2: captions/transcript fields in project data + `<track>` rendering (content dependency) | M |
| 6 | S-4/S-5/S-6: origin check + 20 KB body cap + newsletter honeypot | S |
| 7 | A11Y-3 + P-3: no autoplay under reduced motion; pause hero video off-screen | S |
| 8 | Content swap: real MP4s/posters/socials + raster video thumbnail (P-4/SEO-1/SEO-3/UX-2) | M |
| 9 | A-1/A-2/A-3: `error.tsx` + `loading.tsx`; fix lint error + warnings; remove `ignoreDuringBuilds` | S |

### P1 — first week
1. Vitest suites for `lib/validation`, both API routes, rate limiter (T-1) — **M**
2. Playwright smoke: nav, filters, modal, form submit, reduced-motion (T-1) — **M**
3. Upstash rate limiter + Mongo `serverSelectionTimeoutMS` (B-1/B-2) — **S**
4. CI pipeline: typecheck + lint + build on every PR (D-1) — **S**
5. Sentry + privacy-friendly analytics (D-1) — **S**
6. `engines` field + production boot warning for missing Mongo/SMTP (D-1/B) — **S**
7. Real video pipeline decision (Mux vs Bunny vs self-host) incl. captions (P-4) — **L**

### P2 — nice to have
1. WebGL idle cutoff + pause during modal (P-2) — **M**
2. Bundle analysis + trim framer-motion footprint on home (P-9) — **M**
3. Migrate posters to `next/image` when bitmap assets land (P-5) — **S**
4. Safe-area padding for notched devices (R-1) — **S**
5. Locale routing via next-intl — or drop the public switcher (SEO-2) — **M**
6. Consolidate the duplicated glow-texture factory + drop dead `Shot` re-export (A-4) — **S**

---

## 6. Pre-Launch Checklist

| Item | Status |
|---|---|
| `tsc --noEmit` strict | ✅ PASS (clean) |
| `next build` production | ✅ PASS (15/15 routes) |
| ESLint | ❌ FAIL — 1 error (`next-env.d.ts:3`), 4 warnings (see A-3) |
| `npm audit` | ❌ FAIL — 8 vulns (7 high / 1 moderate) |
| Security headers (CSP/HSTS/XFO/XCTO/RP) | ❌ MISSING |
| Image optimizer policy | ❌ OPEN (`hostname: "**"`) |
| Body-size cap + origin check on POSTs | ❌ MISSING |
| Error/loading boundaries | ❌ MISSING |
| Focus traps (modal, mobile menu) | ❌ MISSING |
| Video captions/transcripts | ❌ MISSING (needs content) |
| Reduced motion (3D / preloader / Lenis / marquee / transitions) | ✅ PASS — ❌ hero video autoplay |
| Rate limiting + honeypot (inquiry) | ✅ PASS (in-memory caveat B-1) — ⚠️ newsletter honeypot missing |
| Metadata / canonicals / OG image | ✅ PASS |
| sitemap / robots / manifest / icon | ✅ PASS |
| JSON-LD validity | ⚠️ NEEDS MANUAL CHECK (Rich Results Test; placeholder video URLs) |
| Real video + poster + social assets | ❌ PLACEHOLDERS (documented swap path) |
| Lighthouse ≥ 90 (P/A11Y/BP/SEO) | ⚠️ NEEDS MANUAL CHECK |
| Real-device Safari/iOS/Android pass | ⚠️ NEEDS MANUAL CHECK |
| Screen-reader pass (VoiceOver/NVDA) | ⚠️ NEEDS MANUAL CHECK |
| E2E with live MongoDB + SMTP | ⚠️ NEEDS MANUAL CHECK (fallback path verified live; persistence path not) |

---

## 7. Manual Test Plan

1. **Lighthouse:** Chrome incognito → DevTools → Lighthouse → all four categories, mobile preset, 3 runs, median. Confirm LCP < 2.5 s (hero poster), TBT acceptable during 3D hydration, a11y ≥ 90 after A11Y fixes.
2. **WebPageTest:** Virginia + EU runners, Moto G4 "4G": confirm the 3D async chunk never blocks LCP; measure hero video bytes; check first-view vs repeat-view (preloader sessionStorage skip).
3. **Real devices:** iPhone Safari — hero video autoplay muted, footer safe-area, Lenis feel, modal controls; low-end Android — verify WebGL **never** mounts (poster + parallax only) and no canvas element exists in the DOM.
4. **Screen readers:** VoiceOver (macOS/iOS) + NVDA (Windows/Chrome): tab order into/out of the modal (fails until A11Y-1 lands), form error announcements via `role="alert"`, marquee `aria-hidden` duplicates silent, preloader "Loading…" announcement.
5. **Cross-browser:** Safari 17+ (svh, backdrop-filter, autoplay), Firefox (WebGL + postprocessing FX + canvas textures), Edge/Chromium; test with WebGL disabled via chrome://flags to confirm the poster fallback.
6. **Backend E2E (Atlas + Resend live):** valid inquiry → Mongo row + notification + confirmation emails; duplicate newsletter → idempotent 201; honeypot POST → silent 200, no row; 6 rapid POSTs → 429 + Retry-After; 5 MB body → rejected after S-5 lands.
7. **Reduced motion:** enable OS setting → reload: no preloader, no `<canvas>` in DOM, navigation swaps instantly, hero shows poster only (after A11Y-3 lands), marquees static.
8. **SEO:** Google Rich Results Test on `/` (VideoObject), view-source canonicals per page, `/sitemap.xml` + `/robots.txt` + `/opengraph-image` return 200 on the production domain.

---

*End of report. No code was modified during this audit. Awaiting approval before applying fixes.*

---

## 8. Remediation Log — 2026-10-05 (post-approval fix pass)

All P0 items plus the actionable P1/P2 items were implemented and verified (`tsc` clean, `eslint` 0 problems, `vitest` 18/18, `next build` 15/15, headers + guards confirmed live via curl, modal focus trap confirmed in-browser).

| ID | Status | What was done |
|----|--------|---------------|
| P-1 | ✅ FIXED | `SceneContents` now subscribes via `useSceneStore((s) => s.quality)`; particle budget + EffectComposer swap with the tier |
| P-2 | ✅ FIXED | `InvalidateOnActivity` now pauses on tab-hidden, while a modal is open (`paused` flag in the scene store), and after 6 s of no user activity; any input/scroll resumes |
| P-3 | ✅ FIXED | Hero video pauses via IntersectionObserver off-screen; `autoPlay` gated on `prefers-reduced-motion` (poster-only for those users) |
| P-4 | ⚠️ DEFERRED | Real video pipeline is a content/ops task (Mux vs Bunny vs self-host) — mechanism ready (`src/content/projects.ts` per-project `video`) |
| S-1 | ✅ FIXED | `next.config.ts` `headers()`: X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS, pragmatic CSP (verified live via curl) |
| S-2 | ✅ FIXED | `images.remotePatterns` removed entirely (app uses plain `<img>`; enumerate hosts if `next/image` is adopted) |
| S-3 | ✅ PARTIAL | `npm audit fix` applied; nodemailer upgraded to **10.0.14** (its 4 advisories cleared); remaining 7 (6 high / 1 moderate) are the postcss-chain via next@16 (deferred — major framework bump needs the new test suite to mature) + transitive `braces` (no patched release exists) |
| S-4/S-5 | ✅ FIXED | `src/lib/api-guard.ts`: origin allowlist (403 on mismatch — verified live) + 20 KB body cap (413) with measured-length fallback |
| S-6 | ✅ FIXED | Newsletter honeypot (form + schema + route silent-drop) |
| S-7 | ✅ FIXED | Server logs redacted to reference ids / non-identifying fields |
| A-1 | ✅ FIXED | `src/app/error.tsx` (branded "Cut short." + retry) and `src/app/loading.tsx` |
| A-2/A-3 | ✅ FIXED | `ignoreDuringBuilds` removed; `next-env.d.ts` eslint-ignored; all warnings fixed — `npm run lint` is now **0 problems** and runs during `next build` |
| A-4 | ✅ FIXED | Dead `Shot` re-export removed; radial-glow texture consolidated into `src/components/three/textures.ts` |
| A11Y-1 | ✅ FIXED | Video modal: focus trap + background `inert` (main/header/footer) + Escape + focus restore — verified in-browser (`mainInert: true`, `focusInsideDialog: true`); mobile menu: same treatment |
| A11Y-2 | ✅ MECHANISM | `captions`/`transcriptUrl` fields on projects + `<track kind="captions">` + Transcript link in the player; sample WebVTT ships at `public/captions/sample-en.vtt` — real transcripts are a content task |
| A11Y-3 | ✅ FIXED | Hero autoplay gated on reduced motion |
| A11Y-4 | ✅ FIXED | `cursor: none` no longer applies to `input/textarea/select` |
| A11Y-5 | ✅ FIXED | Header nav links + menu toggle got expanded hit areas |
| B-1 | ⚠️ DEFERRED | In-memory limiter kept (single-instance caveat documented); swap to Upstash when multi-instance |
| B-2 | ✅ FIXED | `db.ts`: explicit `serverSelectionTimeoutMS`/`connectTimeoutMS`; no-op `dbName` removed; `var` global pattern replaced (also clears the lint directives) |
| B-3 | ✅ FIXED | API success payloads trimmed to `{ ok, id }` |
| SEO-1/SEO-3 | ⚠️ DEFERRED | Placeholder assets are a content task (documented swap path in README) |
| SEO-2 | ⚠️ DEFERRED | Locale routing (next-intl) — or drop the public switcher; decision needed |
| R-1 | ✅ FIXED | `viewportFit: "cover"` + `env(safe-area-inset-bottom)` on the footer |
| D-1 | ✅ PARTIAL | `.github/workflows/ci.yml` (typecheck+lint+test+build), `engines: node >=20.9`, boot warnings via `src/instrumentation.ts`; Sentry/analytics still to wire (needs accounts/DSN) |
| T-1 | ✅ PARTIAL | Vitest suite added (`npm test`): 18 tests across validation, rate limiter, and both API routes (validation errors, honeypot silent-drop, 413 body cap, 429 rate limit, origin/413 paths). Playwright smoke still to add |

**Deferred (with reasons):** next@16 + postcss patch (breaking framework upgrade — rerun the new test suite against it first), `braces` transitive (no patched release), real media/caption content (content team), next-intl routing (product decision), Sentry/analytics (account/DSN needed), Upstash limiter (multi-instance only), Playwright E2E (follow-up).

**Post-fix verification (all re-run):** `tsc --noEmit` clean · `eslint .` 0 problems · `vitest` 18/18 · `next build` 15/15 (home route 10.9 kB, First Load 231 kB) · live curl: all six security headers present, cross-origin POST → 403, same-origin POST → `{"ok":true}` · browser: modal focus trap + inert + captions track confirmed.

---

## 9. Re-audit — 2026-10-05 (v2, post-remediation)

Full verification suite re-run after the remediation pass, plus a fresh visual/code sweep. Two new findings were discovered and fixed within this pass; scores updated.

### Verification (re-run this pass)
| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ clean |
| `eslint .` | ✅ 0 problems (was 1 error, 4 warnings) |
| `vitest run` | ✅ 18/18 across 4 files |
| `next build` | ✅ 15/15 routes, lint runs inside build now |
| `npm audit` | 7 remaining (1 moderate / 6 high) — all in the postcss-chain (needs next@16, deferred) + transitive `braces` (no patch exists). nodemailer advisories cleared by the v10 upgrade |
| Live headers (curl) | ✅ all six present incl. CSP (`connect-src` now also allows `ws:` so `next dev` HMR keeps working — found and fixed in this pass) |
| Live API guards | ✅ cross-origin POST → 403; same-origin POST → `{"ok":true}` |
| Browser (desktop + mobile 390 px) | ✅ modal focus trap + `inert` + captions `<track>` + footer layout |

### New findings found & fixed in this pass
| ID | Sev | Issue | Fix |
|----|-----|-------|-----|
| UX-3 | 🔵 | Mobile footer stacked 4 columns vertically (Sitemap/Social/Studios/Language) — very tall on phones | Footer grid now `grid-cols-2` at the base: Sitemap + Social sit side by side on mobile; Studios/Language full-width below (verified 390 px + desktop 12-col unchanged) |
| S-14 | 🔵 | CSP `connect-src 'self'` would block the `next dev` HMR websocket | `connect-src 'self' ws: wss:` added |

### Updated scores
| Area | v1 | v2 | Notes |
|---|---:|---:|---|
| Architecture & Code Quality | 7.5 | **8.5** | error/loading boundaries in, lint at zero and enforced in build |
| Performance | 6.5 | **7.5** | adaptive quality works, WebGL pauses (hidden/modal/idle), hero video pauses off-screen; field metrics still NEEDS MANUAL CHECK |
| Security | 6.0 | **8.0** | headers + CSP live, origin/size guards, nodemailer@10; postcss-chain vulns remain behind next@16 (deferred) |
| Backend & Database | 7.0 | **7.5** | timeouts, trimmed payloads, redacted logs; in-memory limiter caveat remains |
| SEO | 8.0 | **8.0** | unchanged — placeholder media still a content task |
| Accessibility | 6.0 | **8.0** | focus traps + inert, captions mechanism, reduced-motion video, cursor scoping, target sizes; SR/device pass still manual |
| UX & Motion | 8.5 | **8.5** | mobile footer fixed (UX-3) |
| Responsive & Cross-browser | 7.5 | **8.0** | safe-area support in; device matrix still manual |
| i18n | 6.5 | 6.5 | unchanged (documented upgrade path) |
| DevOps & Deployment | 6.5 | **7.5** | CI, engines, boot warnings; Sentry/analytics still to wire |
| Testing & Maintainability | 2.0 | **6.0** | 18 vitest tests + CI; no browser E2E yet |
| **Overall** | **6.8** | **7.9** | launch-ready pending the deferred content/ops items |

### Remaining before launch (unchanged from P0/P1 deferred list)
1. Real media: hero/project MP4s (MP4+WebM), posters, client logos, socials (content task).
2. Real caption transcripts per film (mechanism shipped).
3. next@16 + postcss patch upgrade once the test suite has a few more miles on it.
4. next-intl locale routing — or a decision to drop the public language switcher.
5. Sentry + analytics wiring; Upstash limiter when going multi-instance.
6. Lighthouse / device / screen-reader manual passes (§7 plan stands).
