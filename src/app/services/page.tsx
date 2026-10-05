import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ServiceBlock } from "@/components/services/ServiceBlock";
import { CTABanner } from "@/components/home/CTABanner";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Commercials & TVC, brand films, social video systems, motion graphics and 3D/CGI — full-stack film production by VIDEO AGENCY.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        index="S."
        eyebrow="What we do — end to end"
        title={
          <>
            One team,
            <br />
            <span className="text-outline">every frame</span>
          </>
        }
        sub="Strategy, direction, production, post and CGI under one roof — so nothing gets lost between vendors."
      />
      <section className="z-content relative px-6 pb-24 md:px-10" aria-label="Service details">
        {services.map((s, i) => (
          <ServiceBlock key={s.id} service={s} flip={i % 2 === 1} />
        ))}
      </section>
      <CTABanner />
    </>
  );
}
