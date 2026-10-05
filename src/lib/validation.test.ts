import { describe, expect, it } from "vitest";
import { inquirySchema, newsletterSchema } from "@/lib/validation";

const validInquiry = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "",
  projectType: "Brand Film",
  budget: "$25k – $50k",
  message: "We need a launch film for our Series A announcement.",
  website: "",
};

describe("inquirySchema", () => {
  it("accepts a complete inquiry", () => {
    const result = inquirySchema.safeParse(validInquiry);
    expect(result.success).toBe(true);
  });

  it("rejects short messages", () => {
    const result = inquirySchema.safeParse({ ...validInquiry, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid enum values", () => {
    const result = inquirySchema.safeParse({ ...validInquiry, budget: "whatever" });
    expect(result.success).toBe(false);
  });

  it("accepts a filled honeypot at schema level — the route drops it silently", () => {
    const result = inquirySchema.safeParse({ ...validInquiry, website: "http://spam" });
    expect(result.success).toBe(true);
  });
});

describe("newsletterSchema", () => {
  it("accepts an email with an empty honeypot", () => {
    const result = newsletterSchema.safeParse({ email: "ada@example.com", website: "" });
    expect(result.success).toBe(true);
  });

  it("accepts a filled honeypot at schema level — the route drops it silently", () => {
    const result = newsletterSchema.safeParse({ email: "ada@example.com", website: "x" });
    expect(result.success).toBe(true);
  });

  it("rejects malformed emails", () => {
    const result = newsletterSchema.safeParse({ email: "not-an-email", website: "" });
    expect(result.success).toBe(false);
  });
});
