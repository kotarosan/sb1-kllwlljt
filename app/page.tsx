import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero";
import { FeaturesSection } from "@/components/sections/features";
import { PricingSection } from "@/components/sections/pricing/pricing-section";
import { ServicesSection } from "@/components/sections/services/services-section";
import { GallerySection } from "@/components/sections/gallery/gallery-section";
import { BlogSection } from "@/components/sections/blog/blog-section";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
      <HeroSection />
      <FeaturesSection />
        <ServicesSection />
        <GallerySection />
        <BlogSection />
        <PricingSection />
      </main>
    </>
  );
}