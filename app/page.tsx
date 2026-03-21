import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Backstory } from "@/components/sections/Backstory";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Backstory />
      <Footer />
    </main>
  );
}
