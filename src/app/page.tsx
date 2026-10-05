import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Stats } from "@/components/home/Stats";
import { ProcessSection } from "@/components/home/ProcessSection";
import { ClientsMarquee } from "@/components/home/ClientsMarquee";
import { Testimonials } from "@/components/home/Testimonials";
import { CTABanner } from "@/components/home/CTABanner";
import { showreel, site } from "@/content/site";

/** The showreel as a VideoObject — eligible for rich results / video key moments. */
const videoJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: `${showreel.title} — ${site.name}`,
  description: site.description,
  thumbnailUrl: `${site.url}${showreel.poster}`,
  uploadDate: `${showreel.year}-01-15`,
  contentUrl: showreel.src,
  embedUrl: site.url,
  publisher: { "@type": "Organization", name: site.legalName, url: site.url },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <Hero />
      <Intro />
      <ServicesPreview />
      <FeaturedWork />
      <Stats />
      <ProcessSection />
      <ClientsMarquee />
      <Testimonials />
      <CTABanner />
    </>
  );
}
