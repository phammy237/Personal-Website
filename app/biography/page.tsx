"use client";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function BiographyPage() {
  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #080D24 0%, #0A0C1E 100%)" }}>
      <Navbar />

      <div className="px-[5vw] pt-32 pb-32 max-w-[800px] mx-auto">
        <motion.p
          className="font-mono text-xs text-white/30 tracking-widest uppercase mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Story
        </motion.p>
        <motion.h1
          className="font-display text-6xl md:text-8xl text-white leading-none mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Biography
        </motion.h1>

        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Placeholder content */}
          <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p className="font-mono text-xs text-white/40">In progress — check back soon</p>
            </div>
            <p className="font-body text-2xl text-white/60 leading-relaxed italic">
              &ldquo;A kid from Hanoi who grew up curious about everything, ended up in Florida, and somehow turned that into a career in data and product.&rdquo;
            </p>
          </div>

          {/* Timeline placeholder */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
            {[
              { year: "2005", place: "Hanoi, Vietnam", note: "Born" },
              { year: "2017", place: "Cầu Giấy Secondary School", note: "Where it all started" },
              { year: "2021", place: "Nguyễn Huệ High School for the Gifted", note: "Things got serious" },
              { year: "2023", place: "Rivermont Collegiate, Iowa", note: "First time in the US" },
              { year: "2024", place: "University of Florida", note: "Now" },
            ].map((item, i) => (
              <motion.div
                key={item.year}
                className="pl-10 pb-8 relative"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                <div className="absolute left-3.5 top-1.5 w-2 h-2 rounded-full bg-accent -translate-x-1/2" />
                <span className="font-mono text-xs text-accent block mb-1">{item.year}</span>
                <p className="font-body text-white/80 font-medium">{item.place}</p>
                <p className="font-mono text-xs text-white/30 mt-0.5">{item.note}</p>
              </motion.div>
            ))}
          </div>

          <div className="border border-white/10 rounded-xl px-6 py-5 text-center">
            <p className="font-mono text-sm text-white/30">Full biography coming soon.</p>
            <p className="font-mono text-xs text-white/20 mt-1">Stories from childhood, Hanoi, and the journey to UF.</p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
