import { Header } from "@/components/layout/header";
import { PricingSection } from "@/components/sections/pricing/pricing-section";

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <PricingSection />
      </main>
    </>
  );
}