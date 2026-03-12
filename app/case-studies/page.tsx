"use client";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { caseStudies } from "@/data/projects";

const awardColors: Record<string, string> = {
  Winner: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Outstanding Award": "bg-purple-100 text-purple-800 border-purple-300",
  "3rd Place Overall": "bg-orange-100 text-orange-800 border-orange-300",
  "Best Finance Project": "bg-green-100 text-green-800 border-green-300",
  "Top 20": "bg-blue-100 text-blue-800 border-blue-300",
  Participant: "bg-gray-100 text-gray-600 border-gray-300",
};

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen bg-base">
      <Navbar />

      {/* Page header */}
      <div className="px-[5vw] pt-28 pb-10 max-w-[1400px] mx-auto">
        <motion.p
          className="font-mono text-xs text-muted tracking-widest uppercase mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Competitions & Strategy
        </motion.p>
        <motion.h1
          className="font-display text-5xl md:text-7xl text-surface mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Case Studies
        </motion.h1>
        <motion.p
          className="font-body text-lg text-muted max-w-xl mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Competition entries, case analyses, and strategic presentations.
          Slide decks coming soon.
        </motion.p>
        <motion.div
          className="inline-flex items-center gap-2 font-mono text-xs text-accent bg-accent-light px-3 py-1.5 rounded-full border border-accent/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Slide decks uploading soon — check back shortly
        </motion.div>
      </div>

      {/* Case studies grid */}
      <div className="px-[5vw] pb-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {caseStudies.map((cs, i) => (
            <motion.div
              key={cs.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 3) * 0.07, type: "spring", stiffness: 120, damping: 20 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Gradient header */}
              <div
                className="h-28 relative flex items-end p-4"
                style={{ background: cs.gradient }}
              >
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10">
                  <p className="font-mono text-xs text-white/60 mb-1">{cs.competition}</p>
                  <h3 className="font-display text-2xl text-white">{cs.title}</h3>
                </div>
                {/* Upload placeholder overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="font-mono text-xs text-white/80 border border-white/30 px-3 py-1.5 rounded">
                    Slides Coming Soon
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Award badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded-full border ${awardColors[cs.award] ?? awardColors["Participant"]}`}
                  >
                    {cs.award}
                  </span>
                  <span className="font-mono text-xs text-muted">{cs.year}</span>
                </div>

                {/* Description */}
                <p className="font-body text-sm text-muted leading-relaxed mb-4">
                  {cs.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {cs.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-muted border border-border px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
