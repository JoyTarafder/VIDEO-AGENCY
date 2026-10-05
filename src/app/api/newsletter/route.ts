import { NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/api-guard";
import { connectToDatabase, isDbConfigured } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";
import { sendNewsletterWelcome } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** POST /api/newsletter — footer signup. Idempotent (duplicate emails are fine). */
export async function POST(req: Request) {
  const bodyResult = await readJsonBody(req);
  if (!bodyResult.ok) return bodyResult.res;

  const limit = rateLimit(`newsletter:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts — try again in a minute." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const parsed = newsletterSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Honeypot tripped → pretend success, store nothing.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let persisted: "db" | "logged" = "logged";
  if (isDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Subscriber.updateOne(
          { email: parsed.data.email },
          { $setOnInsert: { email: parsed.data.email, source: "footer" } },
          { upsert: true }
        );
        persisted = "db";
      } catch (err) {
        console.error("[newsletter] DB save failed:", err);
      }
    }
  }
  if (persisted === "logged") {
    // No PII in logs.
    console.log("[newsletter] persisted=logged (no DB configured)");
  }

  await sendNewsletterWelcome(parsed.data.email).catch(() => false);

  return NextResponse.json({ ok: true }, { status: 201 });
}
