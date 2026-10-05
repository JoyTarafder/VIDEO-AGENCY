import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  isDbConfigured: vi.fn(() => true),
  connectToDatabase: vi.fn(async () => ({})),
}));
vi.mock("@/models/Subscriber", () => ({
  Subscriber: { updateOne: vi.fn(async () => ({})) },
}));
vi.mock("@/lib/mailer", () => ({
  sendNewsletterWelcome: vi.fn(async () => true),
}));

import { POST } from "@/app/api/newsletter/route";
import { Subscriber } from "@/models/Subscriber";

function post(body: unknown, ip = Math.random().toString()) {
  return POST(
    new Request("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    vi.mocked(Subscriber.updateOne).mockClear();
  });

  it("upserts a subscriber idempotently", async () => {
    const res = await post({ email: "ada@example.com", website: "" });
    expect(res.status).toBe(201);
    expect(Subscriber.updateOne).toHaveBeenCalledTimes(1);
  });

  it("silently accepts honeypot spam without persisting", async () => {
    const res = await post({ email: "ada@example.com", website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(Subscriber.updateOne).not.toHaveBeenCalled();
  });

  it("400s on malformed emails", async () => {
    const res = await post({ email: "nope", website: "" });
    expect(res.status).toBe(400);
    expect(Subscriber.updateOne).not.toHaveBeenCalled();
  });

  it("429s after the per-IP rate limit", async () => {
    const ip = "8.8.8.8";
    for (let i = 0; i < 5; i++) {
      const res = await post({ email: `take${i}@example.com`, website: "" }, ip);
      expect(res.status).toBe(201);
    }
    const res = await post({ email: "last@example.com", website: "" }, ip);
    expect(res.status).toBe(429);
  });
});
