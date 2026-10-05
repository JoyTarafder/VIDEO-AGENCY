import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  isDbConfigured: vi.fn(() => true),
  connectToDatabase: vi.fn(async () => ({})),
}));
vi.mock("@/models/Inquiry", () => ({
  Inquiry: { create: vi.fn(async () => ({})) },
}));
vi.mock("@/lib/mailer", () => ({
  sendInquiryNotification: vi.fn(async () => true),
  sendInquiryConfirmation: vi.fn(async () => true),
}));

import { POST } from "@/app/api/inquiries/route";
import { Inquiry } from "@/models/Inquiry";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "",
  projectType: "Brand Film",
  budget: "$25k – $50k",
  message: "We need a launch film for our Series A announcement.",
  website: "",
};

function post(body: unknown, ip = Math.random().toString()) {
  return POST(
    new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/inquiries", () => {
  beforeEach(() => {
    vi.mocked(Inquiry.create).mockClear();
  });

  it("creates an inquiry and returns a reference id", async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);
    const json = (await res.json()) as { ok: boolean; id: string };
    expect(json.ok).toBe(true);
    expect(typeof json.id).toBe("string");
    expect(Inquiry.create).toHaveBeenCalledTimes(1);
  });

  it("returns field errors and never touches the DB on invalid payloads", async () => {
    const res = await post({ ...valid, email: "not-an-email" });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { errors: Record<string, string[]> };
    expect(json.errors.email).toBeDefined();
    expect(Inquiry.create).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot spam without persisting", async () => {
    const res = await post({ ...valid, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(Inquiry.create).not.toHaveBeenCalled();
  });

  it("rejects oversized payloads with 413", async () => {
    const res = await post({ ...valid, message: "x".repeat(25_000) });
    expect(res.status).toBe(413);
  });

  it("429s after the per-IP rate limit", async () => {
    const ip = "9.9.9.9";
    for (let i = 0; i < 5; i++) {
      const res = await post({ ...valid, name: `Take ${i}` }, ip);
      expect(res.status).toBe(201);
    }
    const res = await post(valid, ip);
    expect(res.status).toBe(429);
  });
});
