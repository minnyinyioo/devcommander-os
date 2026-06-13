import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Modules } from "@/components/sections/Modules";
import { Workflow } from "@/components/sections/Workflow";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBar />
      <Problem />
      <Solution />
      <Modules />
      <Workflow />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
