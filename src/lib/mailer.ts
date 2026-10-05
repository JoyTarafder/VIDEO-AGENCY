import nodemailer, { type Transporter } from "nodemailer";
import type { InquiryInput } from "@/lib/validation";

/**
 * Nodemailer over SMTP. Works with any provider; for Resend simply use
 * host smtp.resend.com, port 465, user "resend", pass <API key>.
 *
 * Every function is fail-safe: when SMTP is not configured (or sending
 * fails) the API route still succeeds — the submission is persisted/logged
 * and the failure is recorded server-side.
 */

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  CONTACT_TO,
} = process.env;

let cachedTransport: Transporter | null | undefined;

function transport(): Transporter | null {
  if (cachedTransport !== undefined) return cachedTransport;
  if (!SMTP_HOST) {
    cachedTransport = null;
    return cachedTransport;
  }
  cachedTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return cachedTransport;
}

export function isMailConfigured() {
  return Boolean(SMTP_HOST);
}

const shell = (title: string, rows: [string, string][], outro?: string) => `
  <div style="background:#0a0a0a;padding:40px 16px;font-family:Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#131312;border:1px solid #262624;border-radius:14px;overflow:hidden">
      <tr><td style="padding:28px 32px 0">
        <div style="font:700 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.28em;color:#c8ff2e">VIDEO<span style="color:#ff3b30">●</span>AGENCY</div>
        <h1 style="font:700 26px/1.25 Helvetica,Arial,sans-serif;color:#f2f0ea;margin:18px 0 6px">${title}</h1>
      </td></tr>
      <tr><td style="padding:8px 32px 32px">
        ${rows
          .map(
            ([k, v]) =>
              `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr>
                 <td style="font:600 11px/1.5 Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8f8e88;padding-right:16px;white-space:nowrap;vertical-align:top">${k}</td>
                 <td style="font:400 15px/1.5 Helvetica,Arial,sans-serif;color:#f2f0ea">${v}</td>
               </tr></table>`
          )
          .join("")}
        ${outro ? `<p style="font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#b9b7b0;margin:26px 0 0">${outro}</p>` : ""}
      </td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid #262624">
        <span style="font:400 11px/1.6 Helvetica,Arial,sans-serif;color:#6f6e69">Sent from videoagency.studio — worldwide film & video production.</span>
      </td></tr>
    </table>
  </div>`;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendInquiryNotification(data: InquiryInput, id: string) {
  const t = transport();
  if (!t || !CONTACT_TO) {
    // No PII in logs — reference id only.
    console.log(`[mail:skipped] inquiry ${id} — SMTP not configured.`);
    return false;
  }
  await t.sendMail({
    from: MAIL_FROM ?? "VIDEO AGENCY <no-reply@localhost>",
    replyTo: `${data.name} <${data.email}>`,
    to: CONTACT_TO.split(",").map((s) => s.trim()),
    subject: `New inquiry — ${data.projectType} · ${data.budget} · ${data.name}`,
    html: shell(
      "New project inquiry",
      [
        ["From", `${escape(data.name)}${data.company ? ` · ${escape(data.company)}` : ""}`],
        ["Email", escape(data.email)],
        ["Project", escape(data.projectType)],
        ["Budget", escape(data.budget)],
        ["Message", escape(data.message).replace(/\n/g, "<br/>")],
        ["Ref", id],
      ],
      "Reply directly to this email — the sender's address is on Reply-To."
    ),
  });
  return true;
}

export async function sendInquiryConfirmation(data: InquiryInput) {
  const t = transport();
  if (!t) return false;
  await t.sendMail({
    from: MAIL_FROM ?? "VIDEO AGENCY <no-reply@localhost>",
    to: data.email,
    subject: "We got it — your brief is on the timeline",
    html: shell(
      `Thanks, ${escape(data.name.split(" ")[0])}.`,
      [
        ["Next step", "A producer replies within one business day."],
        ["In a hurry", "Book a 20-min intro call from our contact page."],
      ],
      "Meanwhile, our latest reel is one click away on the homepage. — The VIDEO AGENCY crew"
    ),
  });
  return true;
}

export async function sendNewsletterWelcome(email: string) {
  const t = transport();
  if (!t) return false;
  await t.sendMail({
    from: MAIL_FROM ?? "VIDEO AGENCY <no-reply@localhost>",
    to: email,
    subject: "Transmission received — welcome aboard",
    html: shell(
      "You're on the list.",
      [["What's next", "New work, behind-the-scenes and reel drops. A few per year — never noise."]],
      "Cut! — The VIDEO AGENCY crew"
    ),
  });
  return true;
}
