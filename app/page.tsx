import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Backstory } from "@/components/sections/Backstory";
import SignatureIntro from "@/components/ui/SignatureIntro";

export default function Home() {
  return (
    <main>
      <SignatureIntro />
      <Navbar />
      <Hero />
      <Backstory />
      <Footer />
    </main>
  );
}
