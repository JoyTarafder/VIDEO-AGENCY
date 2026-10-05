/**
 * Minimal in-memory sliding-window rate limiter.
 * Sufficient for a single API instance; swap for Upstash/Redis when you
 * scale beyond one serverless region.
 */
type Bucket = number[];

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (bucket.length >= limit) {
    buckets.set(key, bucket);
    return { ok: false as const, retryAfter: Math.ceil((windowMs - (now - bucket[0])) / 1000) };
  }
  bucket.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 5000) {
    // Opportunistic sweep so the map can't grow unbounded.
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return { ok: true as const, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
