/**
 * Next.js instrumentation — runs once when the server boots.
 * Productions boot with loud warnings when persistence/email are unconfigured,
 * so a misconfigured deploy can't silently drop inquiries.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV === "production") {
    if (!process.env.MONGODB_URI) {
      console.warn(
        "[boot] MONGODB_URI is not set — inquiries and subscribers will NOT be persisted."
      );
    }
    if (!process.env.SMTP_HOST) {
      console.warn("[boot] SMTP_HOST is not set — email notifications are disabled.");
    }
  }
}
