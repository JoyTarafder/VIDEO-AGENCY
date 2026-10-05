import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/api-guard";
import { connectToDatabase, isDbConfigured } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { sendInquiryConfirmation, sendInquiryNotification } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/inquiries — project inquiry intake.
 * Order of operations: guard (origin/size) → rate limit → validate →
 * honeypot → persist → notify. Persistence and email are fail-safe
 * (logged if unconfigured) so a missing Mongo/SMTP never blocks the visitor.
 */
export async function POST(req: Request) {
  const bodyResult = await readJsonBody(req);
  if (!bodyResult.ok) return bodyResult.res;

  const limit = rateLimit(`inquiry:${clientIp(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions — try again in a minute." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const parsed = inquirySchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Honeypot tripped → pretend success, store nothing.
  if (data.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const id = `VA-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1e4)
    .toString(36)
    .toUpperCase()}`;

  // 1. Persist
  let persisted: "db" | "logged" = "logged";
  if (isDbConfigured()) {
    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Inquiry.create({
          name: data.name,
          email: data.email,
          company: data.company || undefined,
          projectType: data.projectType,
          budget: data.budget,
          message: data.message,
          locale: data.locale,
        });
        persisted = "db";
      } catch (err) {
        console.error(`[inquiry:${id}] DB save failed:`, err);
      }
    }
  }
  if (persisted === "logged") {
    // No PII in logs — reference id + non-identifying fields only.
    console.log(
      `[inquiry:${id}] persisted=logged (no DB configured) type=${data.projectType} budget=${data.budget}`
    );
  }

  // 2. Notify + auto-reply (both fail-safe)
  await sendInquiryNotification(data, id).catch((err) => {
    console.error(`[inquiry:${id}] notification failed:`, err);
    return false;
  });
  await sendInquiryConfirmation(data).catch(() => false);

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
