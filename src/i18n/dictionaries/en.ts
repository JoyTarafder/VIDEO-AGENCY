/**
 * UI-chrome strings. Content (projects, services, team…) lives in /src/content —
 * move it per-locale here when you need fully localized pages.
 * Missing keys in non-EN dictionaries fall back to English automatically.
 */
const en = {
  "nav.work": "Work",
  "nav.services": "Services",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.menu": "Menu",
  "nav.close": "Close",
  "cta.startProject": "Start a project",
  "cta.watchReel": "Watch the reel",
  "cta.bookCall": "Book a 20-min call",
  "cta.viewAllWork": "All work",
  "cta.backHome": "Back to the set",
  "preloader.loading": "LOADING REEL",
  "hero.available": "Booking productions for Q2 2026",
  "hero.scroll": "Scroll",
  "form.title": "Tell us about the project",
  "form.subtitle": "A producer replies within one business day.",
  "form.name": "Your name",
  "form.email": "Email",
  "form.company": "Company (optional)",
  "form.projectType": "Project type",
  "form.budget": "Budget range",
  "form.message": "The project",
  "form.messagePlaceholder": "What are we making? Goals, timing, references — anything helps.",
  "form.send": "Send inquiry",
  "form.sending": "Rolling…",
  "form.successTitle": "Scene received.",
  "form.successBody": "Thanks — your brief just landed on our timeline. Expect a reply within one business day.",
  "form.errorBody": "Something cut out mid-take. Please try again — or email us directly.",
  "form.validation": "A few fields need attention before we can roll.",
  "newsletter.title": "New work, behind the scenes, reel drops.",
  "newsletter.placeholder": "your@email.com",
  "newsletter.subscribe": "Subscribe",
  "newsletter.sending": "Subscribing…",
  "newsletter.success": "You're on the list — first transmission soon.",
  "newsletter.error": "That didn't send. Try again?",
  "footer.language": "Language",
  "footer.rights": "All frames reserved.",
  "modal.play": "Play",
  "modal.close": "Close player",
  "work.filterAll": "All",
  "work.empty": "Nothing on this reel yet — try another category.",
  "contact.offices": "Studios",
  "contact.newBusiness": "New business",
  "contact.careers": "Join the crew",
  "notFound.title": "Scene missing.",
  "notFound.body": "This frame never made the final cut. Let's get you back to the set.",
} as const;

/** Key-safe, value-loose: translations supply their own strings per key. */
export type Dictionary = Record<keyof typeof en, string>;
export type DictionaryKey = keyof Dictionary;

export default en;
