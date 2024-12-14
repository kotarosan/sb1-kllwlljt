import { Header } from "@/components/layout/header";
import { ServicesSection } from "@/components/sections/services/services-section";

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <ServicesSection />
      </main>
    </>
  );
}