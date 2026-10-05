# AUDIT REPORT — VIDEO AGENCY WEBSITE

## 1. Executive Summary

### Overall verdict

এই প্রকল্পটি লঞ্চের জন্য এখনও প্রস্তুত নয়। রিয়েল কোডবেসে অডিট করার সময় দেখা গেছে:
- `next build` সফলভাবে কম্পাইল হলেও শেষের দিকে ব্যর্থ হয়েছে: `Invariant: no direct app page entry found for /icon.svg`
- `npm run lint`-এ ১টি error ও ৪টি warning আছে
- `npm audit --omit=dev`-এ ৩টি ভায়োলেশন পাওয়া গেছে, যার মধ্যে ২টি High severity
- কোন real test suite/coverage নেই
- অতি-উচ্চ প্যারালাক্স, 3D, GSAP, video-heavy ল্যান্ডিং পেজের জন্য performance risk যথেষ্ট

### Area-wise score (out of 10)

| Area | Score | Verdict |
|---|---:|---|
| 1. Architecture & Code Quality | 6/10 | Needs improvement |
| 2. Performance | 5/10 | Risky before launch |
| 3. Security | 4/10 | Weak for production |
| 4. Backend & Database | 6/10 | Acceptable with hardening |
| 5. SEO | 8/10 | Good baseline |
| 6. Accessibility | 6/10 | Mostly decent, needs QA |
| 7. UX, Design & Motion | 7/10 | Strong creative direction |
| 8. Responsive & Cross-Browser | 5/10 | Manual validation required |
| 9. Content Accessibility & i18n | 6/10 | Partial readiness |
| 10. DevOps & Deployment Readiness | 4/10 | Not launch-ready |
| 11. Testing & Maintainability | 3/10 | Very weak |

### Top 5 critical risks

1. Production build fails due to app icon route invariant.
2. Security vulnerabilities in `nodemailer` and `next/postcss` remain unresolved.
3. Security headers and hardening defaults are absent (`next.config.ts` only sets React Strict Mode and image remote patterns; no headers/CSP/HSTS).
4. There is no automated test coverage or CI validation for critical flows (inquiry form, newsletter, DB/email fallback).
5. Hero video + 3D canvas + GSAP animation stack likely damages LCP/INP/TBT on mid-tier mobile devices, with no quantified benchmark or fallback proof.

### Top 5 quick wins

1. Fix the `/icon.svg` route/build issue first.
2. Upgrade `nodemailer` and update Next/PostCSS to patched versions.
3. Add security headers and response hardening in `next.config.ts` or reverse proxy config.
4. Add at least one smoke test for inquiry submission and one API validation test.
5. Run Lighthouse/WebPageTest on mobile and reduce hero motion/asset weight before launch.

---

## 2. Findings Table

| ID | Area | Severity | File:Line | Issue | Why it matters | Recommended fix |
|---|---|---|---|---|---|---|
| F-01 | 10. DevOps / Build | Critical | `next build` output; `src/app/manifest.ts:8-15` | Production build fails with `Invariant: no direct app page entry found for /icon.svg` | Build is broken; the app cannot ship as-is | Fix app icon route generation and verify with a clean production build |
| F-02 | 3. Security | High | `package.json:6-40`; npm audit output | `nodemailer` and `next/postcss` vulnerabilities remain | Exploitable issues in mail handling and framework dependencies increase production risk | Upgrade patched dependencies; run `npm audit fix --force` only after test validation |
| F-03 | 3. Security | High | `next.config.ts:3-10` | No security headers/CSP/HSTS/X-Frame-Options configured | Missing hardening leaves the app exposed to common web attacks | Add `headers()` with CSP, X-Frame-Options, Referrer-Policy, and HSTS |
| F-04 | 11. Testing | High | `package.json:6-11` | No actual test suite or CI smoke coverage | Critical flows are unchecked; regressions likely to slip into production | Add unit/integration tests for API, rate limit, validation, and form submission |
| F-05 | 1. Architecture | Medium | `src/lib/rate-limit.ts:10-31` | In-memory Map limiter is single-instance only | It will not enforce limits correctly in multi-instance or serverless scaling | Use Redis/Upstash or equivalent shared rate limiter for prod |
| F-06 | 4. Backend | Medium | `src/lib/mailer.ts:56-102` | Untrusted user input goes directly into email headers (`replyTo`, subject) | Header injection and malformed values become possible if input is not sanitized enough | Validate and sanitize header values; use explicit email-safe fields and server-side tests |
| F-07 | 2. Performance | High | `src/components/home/Hero.tsx:17-18, 48-77, 96-118`; `src/components/three/HeroScene.tsx:1-150` | Heavy hero video + 3D canvas + GSAP scroll animations above the fold | Likely to hurt LCP/INP/TBT on mid/low-end devices | Reduce hero media weight, lazy-load 3D, lower animation cost, use mobile fallback |
| F-08 | 6. Accessibility | Medium | `src/components/layout/Preloader.tsx:29-47`; `src/components/video/VideoModalProvider.tsx:58-72` | Reduced motion and modal logic exist, but no automated a11y validation suite was run | Real users may hit focus, motion, or screen-reader issues despite good intent | Run axe/Lighthouse/a11y checks and test keyboard navigation on modal and mobile menu |
| F-09 | 9. i18n/Content | Low | `src/i18n/index.tsx:24-39` | Locale is stored in localStorage only; no route-based language segments or SSR locale sync | Client-only locale state can cause mismatches and SEO problems | Add locale-aware routing and SSR-generated language metadata |
| F-10 | 1. Code Quality | Medium | `next-env.d.ts:3` | ESLint error: triple slash reference in `next-env.d.ts` | Anticipates lint drift and blocked CI | Replace or fix the triple-slash pattern according to Next lint rules |

---

## 3. Detailed Findings by Area

### 1) Architecture and Code Quality

#### What is good
- Project structure is reasonably organized by route, component, content, lib, model, and hook categories.
- `tsconfig.json` sets `strict: true` and `moduleResolution: bundler`, which is a strong base for TypeScript safety.
- Server/client responsibilities are mostly separated. Client-only code uses `"use client"` appropriately, e.g., [src/components/home/Hero.tsx](src/components/home/Hero.tsx), [src/components/layout/SmoothScroll.tsx](src/components/layout/SmoothScroll.tsx), [src/i18n/index.tsx](src/i18n/index.tsx).
- Use of Zod validation centralizes request validation in [src/lib/validation.ts](src/lib/validation.ts).

#### What is wrong
- The project has a production build failure: `next build` stops with `Invariant: no direct app page entry found for /icon.svg`.
- The project intentionally disables lint during build in [next.config.ts](next.config.ts:3-10): `eslint: { ignoreDuringBuilds: true }`. This means code quality issues can reach production without breaking the build.
- There is an ESLint error in [next-env.d.ts](next-env.d.ts:3): the repo violates the current `@typescript-eslint/triple-slash-reference` rule.
- Several modules are elaborate and creative, but not yet modularized into a clearer performance-safe architecture (e.g., all motion logic and 3D logic are embedded in single components without clear separation of concerns).

#### Evidence

`next.config.ts`:
```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
```

Build output:
```text
> Build error occurred
[Error: Invariant: no direct app page entry found for /icon.svg]
```

`next-env.d.ts`:
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

This is exactly the lint rule violation reported by ESLint.

### 2) Performance

#### What is good
- `next.config.ts` allows remote images via `images.remotePatterns`, which is acceptable for a media-heavy brand site.
- The project supports reduced-motion logic in [src/hooks/use-media.ts](src/hooks/use-media.ts) and [src/components/layout/Preloader.tsx](src/components/layout/Preloader.tsx).
- The hero loads a poster image and is capable of switching to a video layer when available ([src/components/home/Hero.tsx](src/components/home/Hero.tsx:96-118)).

#### What is wrong
- The hero section is both video-heavy and 3D-heavy. Above-the-fold loading includes a remote video (`showreel.src`), a poster image, a 3D canvas, scroll-triggered GSAP animations, and a preloader. See [src/components/home/Hero.tsx](src/components/home/Hero.tsx:17-18, 48-77, 96-118).
- 3D scene is using full procedural geometry with no low-end fallback beyond heuristics. Evidence: [src/components/three/HeroScene.tsx](src/components/three/HeroScene.tsx:15-40, 53-150); `Canvas` configured with `gl={{ antialias: true, powerPreference: "high-performance" }}` and `dpr={[1, 1.75]}` on the hero.
- The smooth-scroll layer uses Lenis and GSAP ticker together, which can produce expensive scroll computation on mobile if not tuned carefully. See [src/components/layout/SmoothScroll.tsx](src/components/layout/SmoothScroll.tsx:16-36).
- There is no measured performance budget or bundle analysis in the repo; because of that, speed regressions are not prevented.

#### Evidence

```tsx
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
```

```tsx
<video
  className={...}
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  poster={showreel.poster}
  src={showreel.src}
  onCanPlay={() => setVideoReady(true)}
/>
```

```tsx
<Canvas
  dpr={[1, 1.75]}
  camera={{ position: [0, 0, 6.4], fov: 40 }}
  gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
  style={{ background: "transparent" }}
>
```

This is a strong creative choice, but not a low-risk production performance choice without profiling.

### 3) Security

#### What is good
- Inquiry and newsletter endpoints validate with Zod on both client and server side. See [src/lib/validation.ts](src/lib/validation.ts:4-33) and [src/app/api/inquiries/route.ts](src/app/api/inquiries/route.ts:17-32).
- Rate limiting is present in [src/lib/rate-limit.ts](src/lib/rate-limit.ts:10-31).
- Honeypot field is implemented in the validation schema and inquiry submission flow: [src/lib/validation.ts](src/lib/validation.ts:13-20); [src/app/api/inquiries/route.ts](src/app/api/inquiries/route.ts:35-40).

#### What is wrong
- The project still has known high vulnerabilities in production dependencies. `npm audit --omit=dev` reported:
  - `nodemailer` — multiple high-severity issues
  - `next`/`postcss` — high-severity issue chain
  - Total: 3 vulnerabilities (1 moderate, 2 high)
- No CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy` config is present in [next.config.ts](next.config.ts:3-10).
- The email pipeline uses untrusted values directly inside mail headers ([src/lib/mailer.ts](src/lib/mailer.ts:52-75)), which is not ideal for any public inbound form.
- There is no evidence of a reverse-proxy or web server header hardening layer in repo.

#### Evidence

`npm audit` summary:
```text
# npm audit report
3 vulnerabilities (1 moderate, 2 high)

nodemailer  <=10.0.5
Severity: high
...
postcss  <=8.5.22
Severity: high
...
```

`next.config.ts`:
```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
```

`src/lib/mailer.ts`:
```ts
await t.sendMail({
  from: MAIL_FROM ?? "VIDEO AGENCY <no-reply@localhost>",
  replyTo: `${data.name} <${data.email}>`,
  to: CONTACT_TO.split(",").map((s) => s.trim()),
  subject: `New inquiry — ${data.projectType} · ${data.budget} · ${data.name}`,
});
```

### 4) Backend and Database

#### What is good
- MongoDB connection handling is wrapped in a shared cache and a graceful fallback when `MONGODB_URI` is unset. See [src/lib/db.ts](src/lib/db.ts:11-41).
- The inquiry route returns success even when DB/email are unavailable, reducing production breakage risk. See [src/app/api/inquiries/route.ts](src/app/api/inquiries/route.ts:46-80).
- Newsletter route does a safe `updateOne({ email }, { $setOnInsert: ... }, { upsert: true })` pattern. See [src/app/api/newsletter/route.ts](src/app/api/newsletter/route.ts:30-52).

#### What is wrong
- The database connection is still created with `mongoose.connect(MONGODB_URI, { dbName: undefined })`. This is workable but not a production-safe pooling strategy for all deployment patterns; it depends on hosting environment, DNS, and serverless footprint.
- In-memory rate limits are not shared across instances; this is acceptable for a single-node dev setup but not for autoscaled production.
- There is no evidence of database migrations, indexes auditing, or schema versioning beyond the model definitions.

#### Evidence

```ts
const MONGODB_URI = process.env.MONGODB_URI;
...
cache.promise = mongoose.connect(MONGODB_URI, { dbName: undefined }).then((m) => m);
```

```ts
const limit = rateLimit(`inquiry:${clientIp(req)}`, 5, 60_000);
```

### 5) SEO

#### What is good
- Metadata is present at app level: [src/app/layout.tsx](src/app/layout.tsx:18-94).
- Open Graph and Twitter metadata are configured.
- `robots.ts` and `sitemap.ts` exist: [src/app/robots.ts](src/app/robots.ts), [src/app/sitemap.ts](src/app/sitemap.ts).
- `manifest.ts` exists for PWA metadata: [src/app/manifest.ts](src/app/manifest.ts).
- Structured data for Organization and WebSite is present in the layout: [src/app/layout.tsx](src/app/layout.tsx:55-94).

#### What is wrong
- The site does not appear to have dedicated, crawlable case study pages or a clear content taxonomy beyond a few routes. This is more a content strategy issue than a technical bug.
- There is no obvious `hreflang`/locale-specific SEO strategy despite multilingual dictionary support.
- There is no clear canonical/cross-domain strategy beyond a single `site.url`, which may work for a single domain but not for multilingual deployments.

#### Evidence

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Cinematic Video Production Agency`,
    template: `%s — ${site.name}`,
  },
  ...
};
```

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
/>
```

### 6) Accessibility (WCAG 2.2 AA)

#### What is good
- There is a skip-link for main content in [src/app/layout.tsx](src/app/layout.tsx:42-54).
- Modal is keyboard-driven via Escape and focus is targeted to close button: [src/components/video/VideoModalProvider.tsx](src/components/video/VideoModalProvider.tsx:58-72).
- Reduced motion support is present in [src/hooks/use-media.ts](src/hooks/use-media.ts) and [src/components/layout/Preloader.tsx](src/components/layout/Preloader.tsx:29-47).

#### What is wrong
- There is no evidence of an automated a11y test suite (axe/Lighthouse/Pa11y) in the repo. This is a significant gap for a motion-heavy design system.
- The custom cursor, blur overlays, and video-heavy hero may create visual readability issues on some contrast-constrained displays or with reduced-motion settings.
- The use of `dangerouslySetInnerHTML` for JSON-LD does not itself create a11y risk, but it increases the need to verify structured data correctness and semantics with validator tooling.

#### Evidence

```tsx
<a
  href="#main"
  className="sr-only focus:not-sr-only ..."
>
  Skip to content
</a>
```

```tsx
const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") close();
};
window.addEventListener("keydown", onKey);
```

### 7) UX, Design and Motion Quality

#### What is good
- The aesthetic ambition is clear and consistent: dark cinematic palette, strong typography, brand-specific motion language, premium brand feel.
- The site has a coherent visual system and strong art direction.
- CTA density and funnels are reasonable: watch reel, contact CTA, etc.

#### What is wrong
- The current “wow” factor is high, but the motion system is risky: 3D hero + video + smooth scrolling + preloader + parallax can become visually overwhelming or laggy, especially on low-end mobile devices.
- Heavy custom motion can reduce conversion clarity if the content hierarchy is not explicitly optimized for user scanning.
- Without a benchmark or user testing, this is a visual “premium” approach that might feel template-like rather than uniquely branded in execution.

#### Evidence

- [src/components/home/Hero.tsx](src/components/home/Hero.tsx:96-118)
- [src/components/three/HeroScene.tsx](src/components/three/HeroScene.tsx:100-150)
- [src/components/layout/SmoothScroll.tsx](src/components/layout/SmoothScroll.tsx:16-36)

This is impressive but should be treated as a performance-risk design pattern, not a safe default.

### 8) Responsive and Cross-Browser

#### What is good
- The app uses `min-h-[100svh]` and mobile-aware logic in [src/components/home/Hero.tsx](src/components/home/Hero.tsx:96-127), which is a modern approach.
- Safari/Apple-specific issues are partially anticipated with `playsInline` and reduced-motion checks.

#### What is wrong
- There is no explicit browser/device matrix validation in repo; no evidence of Firefox/Safari/WebKit QA.
- `Lenis` smooth scrolling plus WebGL hero on iOS Safari can be unreliable depending on memory and GPU constraints.
- `HeroScene` uses `powerPreference: "high-performance"`, which is not always desirable on mobile and low-power devices.

#### Evidence

```tsx
<Canvas
  dpr={[1, 1.75]}
  gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
/>
```

`NEEDS MANUAL CHECK`: run on real iPhone Safari, Android Chrome, Firefox desktop, and low-end laptop WebGL devices.

### 9) Accessibility of Content and i18n

#### What is good
- There is a dictionary-based locale system in [src/i18n/index.tsx](src/i18n/index.tsx:1-39), which is a strong foundation for multilingual UI.
- `document.documentElement.lang = locale` is set on locale changes, which helps screen readers.

#### What is wrong
- Locale is purely client-side via `localStorage`; there is no route-based localization or SSR locale. That can produce inconsistent SEO and hydration behavior.
- The app likely has a lot of hardcoded marketing strings in components, though the dictionaries are present. Need a full audit of translation parity before release.
- There is no `hreflang`, locale-specific sitemap, or alternate route metadata in the route config.

#### Evidence

```tsx
const STORAGE_KEY = "va-locale";
const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
...
window.localStorage.setItem(STORAGE_KEY, l);
```

### 10) DevOps and Deployment Readiness

#### What is good
- There is a clear project setup with Next.js, TypeScript, and env templates: [package.json](package.json), [.env.example](.env.example), [.gitignore](.gitignore).
- The project includes `next.config.ts`, which is the right place to tune deployment behavior.

#### What is wrong
- The production build is failing, which is a blocking deployment issue.
- `eslint: { ignoreDuringBuilds: true }` is a deployment anti-pattern if the team expects quality gates.
- No CI/CD configuration, monitoring, or analytics instrumentation is evident in the repo.
- No Sentry / error-monitoring setup is visible from the checked files.
- No README or deployment guide was inspected in the repo root; no evidence of production operating instructions was found.

#### Evidence

`package.json` scripts:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit"
}
```

And the build failed with:
```text
[Error: Invariant: no direct app page entry found for /icon.svg]
```

### 11) Testing and Maintainability

#### What is good
- TypeScript passes (`npx tsc --noEmit --pretty false` returned `TypeScript check passed`).
- The codebase is structurally readable and not chaotic.

#### What is wrong
- There is no real test suite. A `package.json` script for `test` is absent.
- There is no coverage for API validation, honeypot, rate limit, DB fallback, or form submission.
- Linting discovered one real error and several warnings; the production build intentionally ignores lint errors, so regressions will go undetected.
- No smoke-test or end-to-end tests exist for the 3D hero and modal flow.

#### Evidence

`package.json`:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit"
}
```

ESLint output:
```text
✖ 5 problems (1 error, 4 warnings)
  0 errors and 2 warnings potentially fixable with the `--fix` option.
```

---

## 4. Performance Budget

| Metric / Area | Current state | Recommended target | Status |
|---|---|---|---|
| JS bundle size | Not measured; no bundle analyzer configured | <= 250KB gzipped initial JS for landing page on mobile, or clearly justified by premium design | NEEDS MANUAL CHECK |
| Hero video weight | Remote sample MP4; file size unknown | Prefer <= 2–4 MB for hero, or use a highly optimized MP4/WebM with CDN | NEEDS MANUAL CHECK |
| LCP target | Not benchmarked | < 2.5s on mobile fast 4G | NEEDS MANUAL CHECK |
| INP target | Not measured | < 200ms | NEEDS MANUAL CHECK |
| CLS target | Not measured | < 0.1 | NEEDS MANUAL CHECK |
| 3D/WebGL payload | Hero canvas is always present when fine pointer + low power passes | Use device detection + graceful fallback; cap pixel ratio and animation cost | FAIL (needs reduction) |
| Fonts | `next/font/google` used for brand fonts | Keep to a small set and ensure swap + preload | PASS (baseline) |
| Images | SVG posters are lightweight | Keep posters optimized and use `next/image` where practical | PASS |
| Security headers | Not configured | Add CSP, HSTS, X-Frame-Options, Referrer-Policy | FAIL |
| Dependency health | `npm audit` shows 3 vulnerabilities | 0 critical/high before launch | FAIL |

Note: several performance metrics are not verifiable without Lighthouse/WebPageTest and actual device testing. They have been flagged as `NEEDS MANUAL CHECK`.

---

## 5. Prioritized Action Plan

### P0 (Fix before launch)

| Priority | Action | Estimated effort | Owner |
|---|---|---:|---|
| P0 | Fix `/icon.svg` build failure and validate clean production build | S | Engineer |
| P0 | Upgrade `nodemailer` and patched `next/postcss` dependencies; rerun `npm audit` | S | Engineer |
| P0 | Add security headers and harden API responses | S | Engineer / Security |
| P0 | Add at least one smoke test for inquiry API and one for validation/rate limit | M | Engineer |
| P0 | Remove or reduce hero 3D/video weight on low-end mobile; test with Lighthouse | M | Frontend performance |

### P1 (First week)

| Priority | Action | Estimated effort | Owner |
|---|---|---:|---|
| P1 | Add lint + build gating to CI and prevent ignoring lint during production builds | S | DevOps |
| P1 | Run axe/Lighthouse/Pa11y checks and fix all critical issues | M | UX / QA |
| P1 | Audit all API inputs and sanitize mail headers properly | M | Security / Backend |
| P1 | Validate browser/device matrix for Safari, Chrome, Firefox, and mobile | M | QA |
| P1 | Add proper document and deployment readme | S | PM / DevOps |

### P2 (Nice to have)

| Priority | Action | Estimated effort | Owner |
|---|---|---:|---|
| P2 | Add route-based locale + hreflang strategy for multilingual SEO | M | Engineering |
| P2 | Improve content taxonomy and dedicated case study landing pages | M | Marketing / Content |
| P2 | Add Sentry/monitoring and deployment logs | S | DevOps |
| P2 | Review and tune scroll animation thresholds for low-power devices | M | Frontend |

---

## 6. Pre-Launch Checklist

| Check | Result | Notes |
|---|---|---|
| Production build passes | FAIL | `next build` fails with icon route invariant |
| Lint passes | FAIL | 1 error, 4 warnings |
| TypeScript passes | PASS | `npx tsc --noEmit --pretty false` returned success |
| Dependency vulnerabilities addressed | FAIL | `npm audit --omit=dev` shows 3 vulnerabilities |
| Security headers configured | FAIL | No CSP/HSTS/X-Frame-Options found |
| API validation + rate limiting works | PASS (baseline) | Present in code but not tested |
| Form submission flow tested | NEEDS MANUAL CHECK | No automated tests/test suite |
| Mobile performance benchmarked | NEEDS MANUAL CHECK | Must run Lighthouse and WebPageTest |
| Accessibility audit passed | NEEDS MANUAL CHECK | Must run axe and keyboard testing |
| Cross-browser validation complete | NEEDS MANUAL CHECK | Must test Safari + Chrome + Firefox |
| SEO / structured data validation | PASS (baseline) | Metadata is present, but full SEO QA still needed |
| Deployment instructions written | NEEDS MANUAL CHECK | Not evident in repo |

---

## 7. Manual Test Plan

### A. Lighthouse / WebPageTest

1. Open a local production build: `npm run build` then `npm run start`.
2. Open Chrome DevTools → Lighthouse.
3. Run mobile performance audit with throttling.
4. Review:
   - LCP
   - INP
   - CLS
   - total blocking time
   - best-practices and accessibility
5. Record results and compare against the recommended budget in Section 4.

#### WebPageTest steps
1. Go to https://www.webpagetest.org/
2. Enter production URL.
3. Test on mobile emulation with 4G throttling.
4. Inspect hero render time, video load delay, layout shifts, and JS blocking.
5. Save screenshots and waterfall for the hero section.

### B. Real mobile device testing

1. Test on actual iPhone Safari and Android Chrome.
2. Validate:
   - hero autoplay and poster fallback
   - smooth-scroll quality
   - 3D canvas fallback behavior on low-power device
   - CTA tap targets and form fields
   - modal open/close and Escape behavior
3. Confirm reduced motion mode (`prefers-reduced-motion`) disables or softens heavy animation.

### C. Screen reader / keyboard testing

1. Use NVDA/VoiceOver + keyboard only.
2. Test:
   - skip link
   - mobile nav and modal focus management
   - form labels and error states
   - contrast over video backgrounds
   - landmark navigation
3. Ensure no keyboard trap or hidden control issue occurs in the modal.

### D. Cross-browser checks

1. Test in latest Chrome, Firefox, Safari, and Edge.
2. Check:
   - hero video playback/autoplay rules
   - WebGL fallback on unsupported GPUs
   - smooth scrolling behavior and scroll locking
   - CSS backdrop blur and performance differences

### E. Security checks

1. Run `npm audit --omit=dev` and ensure 0 high/critical vulnerabilities.
2. Confirm HTTP security headers on production via browser dev tools or curl.
3. Verify `MAIL_FROM`, SMTP, and Mongo env vars are not exposed in client code or logs.

---

## Final assessment

এই অডিটের ভিত্তিতে, বর্তমান প্রকল্পের 상태 “Launch-ready নয়”।

ক্রিয়েটিভ/ব্র্যান্ড দিক থেকে এটি শক্তিশালী; কিন্তু production launch readiness, dependency hardening, build reliability, accessibility QA, and performance safety checks এখনো যথেষ্ট নয়।

যদি এই প্রকল্পটি ozbilমভাবে লঞ্চ করতে হয়, তাহলে আগে P0 ফিক্সগুলো সম্পন্ন করতে হবে, তারপর Lighthouse, real-device QA, security hardening, এবং CI smoke checks চালু করতে হবে।

---

## Evidence Summary (references)

- Build failure output: actual `next build` command result from this environment
- `npm audit` output: actual command result from this environment
- `npx tsc --noEmit --pretty false`: passed in this environment
- ESLint result: actual output from `npm run lint`
- Source files reviewed: [next.config.ts](next.config.ts), [package.json](package.json), [src/app/layout.tsx](src/app/layout.tsx), [src/app/manifest.ts](src/app/manifest.ts), [src/components/home/Hero.tsx](src/components/home/Hero.tsx), [src/components/three/HeroScene.tsx](src/components/three/HeroScene.tsx), [src/components/layout/SmoothScroll.tsx](src/components/layout/SmoothScroll.tsx), [src/components/layout/Preloader.tsx](src/components/layout/Preloader.tsx), [src/components/video/VideoModalProvider.tsx](src/components/video/VideoModalProvider.tsx), [src/lib/validation.ts](src/lib/validation.ts), [src/app/api/inquiries/route.ts](src/app/api/inquiries/route.ts), [src/lib/mailer.ts](src/lib/mailer.ts), [src/lib/db.ts](src/lib/db.ts), [src/lib/rate-limit.ts](src/lib/rate-limit.ts), [src/i18n/index.tsx](src/i18n/index.tsx), [src/app/sitemap.ts](src/app/sitemap.ts), [src/app/robots.ts](src/app/robots.ts)
