import { z } from "zod";

/** Shared between the inquiry form (client pre-validation) and the API (source of truth). */
export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(120),
  email: z.string().trim().email("That email doesn't look right").max(200),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  projectType: z.enum([
    "Commercial / TVC",
    "Brand Film",
    "Social Video",
    "Motion Graphics",
    "3D / CGI / Animation",
    "Not sure yet",
  ]),
  budget: z.enum(["< $10k", "$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+", "Let's discuss"]),
  message: z
    .string()
    .trim()
    .min(20, "Give us at least a sentence or two (20+ characters)")
    .max(4000),
  // Honeypot — real users never see or fill this. Bots do. Accepted at the
  // schema level so the ROUTE can respond with a fake success (silent drop);
  // any non-empty value trips it.
  website: z.string().max(500).optional().or(z.literal("")),
  locale: z.string().max(10).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("That email doesn't look right").max(200),
  // Honeypot — same pattern as the inquiry form (accepted here, dropped in the route).
  website: z.string().max(500).optional().or(z.literal("")),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
