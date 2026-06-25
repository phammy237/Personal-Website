import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Backstory } from "@/components/sections/Backstory";
import { StatsBar } from "@/components/sections/StatsBar";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { ExperiencePreview } from "@/components/sections/ExperiencePreview";
import { Gallery } from "@/components/sections/Gallery";
import { ReadyToDepart } from "@/components/sections/ReadyToDepart";
import SignatureIntro from "@/components/ui/SignatureIntro";

export default function Home() {
  return (
    <main>
      <SignatureIntro />
      <Navbar />
      <Hero />
      <Backstory />
      <StatsBar />
      <FeaturedProjects />
      <ExperiencePreview />
      <Gallery />
      <ReadyToDepart />
      <Footer />
    </main>
  );
}
