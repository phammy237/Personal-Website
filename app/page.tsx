import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Backstory } from "@/components/sections/Backstory";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { News } from "@/components/sections/News";
import { Gallery } from "@/components/sections/Gallery";
import SignatureIntro from "@/components/ui/SignatureIntro";

export default function Home() {
  return (
    <main>
      <SignatureIntro />
      <Navbar />
      <Hero />
      <Backstory />
      <FeaturedProjects />
      <News />
      <Gallery />
      <Footer />
    </main>
  );
}
