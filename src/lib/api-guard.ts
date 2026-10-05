import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 20_000;

/**
 * Shared helpers for mutating API routes:
 * 1. rejects cross-browser origins (CSRF surface — the API has no cookies,
 *    so this is defense-in-depth, not the primary mechanism),
 * 2. rejects oversized payloads (DoS) via the content-length header when the
 *    platform provides it, and always via the measured raw length,
 * 3. parses JSON with a clean 400 on garbage.
 */

function checkOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid origin" }, { status: 403 });
  }
  const allowed = new Set<string>();
  const hostHeader = req.headers.get("host");
  if (hostHeader) allowed.add(hostHeader);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      allowed.add(new URL(site).host);
    } catch {
      // misconfigured env — the host-header check still applies
    }
  }
  if (!allowed.has(originHost)) {
    return NextResponse.json(
      { ok: false, error: "Cross-origin request rejected" },
      { status: 403 }
    );
  }
  return null;
}

export type ReadBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; res: NextResponse };

export async function readJsonBody(req: Request): Promise<ReadBodyResult> {
  const originRes = checkOrigin(req);
  if (originRes) return { ok: false, res: originRes };

  const headerLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(headerLength) && headerLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      res: NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 }),
    };
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      res: NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 }),
    };
  }

  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false, res: NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }) };
  }
}
