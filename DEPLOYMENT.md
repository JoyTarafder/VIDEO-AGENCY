# Deployment guide

Two supported paths:

- **Path A (recommended):** everything on **Vercel** — the site, the API routes,
  and scheduled/static assets. One deploy, zero CORS, edge CDN.
- **Path B:** frontend on **Vercel**, backend extracted to **Render/Railway** —
  useful if your ops team wants the API and database traffic isolated from the
  static frontend.

---

## 0. Prerequisites (both paths)

1. **MongoDB Atlas** (free M0 tier is enough to start)
   - Create a cluster → Database Access → add a user.
   - Network Access → allow your deployment IPs (`0.0.0.0/0` for serverless).
   - Copy the connection string:
     `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/video-agency`
   - Collections (`inquiries`, `subscribers`) are created automatically on first write.

2. **Email — pick one:**
   - **Any SMTP provider** (Fastmail, Gmail with app password, Postmark, SES…):
     host / port / user / pass as provided by them.
   - **Resend** (recommended for deliverability + free tier):
     ```
     SMTP_HOST=smtp.resend.com
     SMTP_PORT=465
     SMTP_SECURE=true
     SMTP_USER=resend
     SMTP_PASS=<your Resend API key>
     MAIL_FROM="VIDEO AGENCY <no-reply@yourdomain.com>"
     CONTACT_TO=producer@yourdomain.com
     ```
     (`MAIL_FROM` must be a domain you verified in Resend.)

---

## Path A — Vercel (frontend + API together)

1. Push the repo to GitHub/GitLab.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework auto-detected as Next.js; no build overrides needed).
3. Add **Environment Variables** (Project → Settings → Environment Variables):

   ```
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_BOOKING_URL=https://cal.com/your-handle/intro-call
   MONGODB_URI=mongodb+srv://…
   SMTP_HOST=…
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=…
   SMTP_PASS=…
   MAIL_FROM="VIDEO AGENCY <no-reply@yourdomain.com>"
   CONTACT_TO=producer@yourdomain.com
   ```

4. Deploy. Verify after first deploy:
   - `https://yourdomain.com/api/inquiries` with a POST (curl below) returns `{"ok":true,…}`
   - `/sitemap.xml`, `/robots.txt`, `/opengraph-image` respond.
   - OG/metadata use the production URL (set `NEXT_PUBLIC_SITE_URL` **before** deploy).

   ```bash
   curl -X POST https://yourdomain.com/api/inquiries \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","projectType":"Brand Film","budget":"$25k – $50k","message":"We need a launch film for our Series A announcement."}'
   ```

5. Domain → add and point DNS at Vercel. HTTPS is automatic.

**Note on the serverless API:** `/api/inquiries` and `/api/newsletter` run as
Node.js functions — no extra service needed. The in-memory rate limiter is
per-instance; if you need cross-region global rate limiting, add Upstash Redis
later (swap `lib/rate-limit.ts`).

---

## Path B — Vercel frontend + Render/Railway backend

The API layer is plain Node.js (Express-compatible surface: two POST handlers,
Mongoose models, Nodemailer). To run it as a standalone service:

1. **Extract the API** into a small Express app (≈40 lines) in a `server/` workspace:

   ```js
   // server/index.js — standalone Node service
   import express from "express";
   import cors from "cors";
   import { connectToDatabase } from "./src/lib/db.js";
   import { inquirySchema } from "./src/lib/validation.js";
   import { Inquiry } from "./src/models/Inquiry.js";
   import { sendInquiryNotification, sendInquiryConfirmation } from "./src/lib/mailer.js";

   const app = express();
   app.use(cors({ origin: process.env.FRONTEND_URL }));
   app.use(express.json());

   app.post("/api/inquiries", async (req, res) => {
     const parsed = inquirySchema.safeParse(req.body);
     if (!parsed.success) return res.status(400).json({ ok: false, errors: parsed.error.flatten().fieldErrors });
     const id = `VA-${Date.now().toString(36).toUpperCase()}`;
     await Inquiry.create(parsed.data);
     await sendInquiryNotification(parsed.data, id);
     await sendInquiryConfirmation(parsed.data);
     res.status(201).json({ ok: true, id });
   });

   await connectToDatabase();
   app.listen(process.env.PORT ?? 4000);
   ```

2. **Render:** New → Web Service → repo root `server/`
   - Build: `npm install` · Start: `node index.js` · Health check: `/api/health`.
   - Same env vars as above (no `NEXT_PUBLIC_*` needed).
   - **Railway** is identical: New Project → Deploy from repo → set start command + env.

3. **Frontend on Vercel:** set `NEXT_PUBLIC_API_URL=https://your-service.onrender.com`
   and point the two `fetch()` calls (`InquiryForm.tsx`, `NewsletterForm.tsx`) at
   `${process.env.NEXT_PUBLIC_API_URL}/api/...` instead of the relative path.

---

## Post-deploy checklist

- [ ] `NEXT_PUBLIC_SITE_URL` matches the live domain (metadata, OG image, sitemap, JSON-LD all derive from it)
- [ ] Test inquiry form end-to-end: DB row + studio email + confirmation email
- [ ] Test newsletter signup (duplicate email = idempotent success)
- [ ] Submit a validation error and a spam honeypot — expect 400 / silent 200
- [ ] Lighthouse run on mobile + desktop (target: 90+ across the board)
- [ ] `prefers-reduced-motion` pass: no preloader, no pinning, no custom cursor
- [ ] Replace sample videos/posters/logos with real assets (see README)
- [ ] Add analytics if desired (Vercel Analytics / Plausible) — `app/layout.tsx`

## Scaling notes

- Rate limiting is in-memory — move to Upstash/Redis when you run multiple instances.
- Inquiry attachments: add an S3/R2 presigned upload route; keep the API stateless.
- If videos outgrow direct MP4, move to Mux (with signed playback URLs) and point
  the `video` fields at `*.m3u8` — add `hls.js` for Chrome/Firefox HLS support.
