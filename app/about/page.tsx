import { Header } from "@/components/layout/header";
import { AboutSection } from "@/components/sections/about/about-section";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <AboutSection />
      </main>
    </>
  );
}