"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ModalShell } from "@/components/ui/ModalShell";
import { HeroNavDots } from "@/components/ui/HeroNavDots";
import { useRotatingIndex } from "@/lib/hooks/useRotatingIndex";
import { caseStudies } from "@/data/projects";
import type { CaseStudy } from "@/data/projects";

const HERO_NAV_BUTTON_CLASS = "w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors text-xs";

const ROTATE_MS = 6000;
const CATEGORIES = ["All", "Hackathon", "Case Competition", "Math & Modeling", "Data Science", "Finance"] as const;

const AWARD_BADGE: Record<string, string> = {
  Winner: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  "Outstanding Award": "bg-purple-500/20 text-purple-300 border-purple-500/40",
  "3rd Place Overall": "bg-orange-500/20 text-orange-300 border-orange-500/40",
  "Best Finance Project": "bg-green-500/20 text-green-300 border-green-500/40",
  "Top 20": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Participant: "bg-white/5 text-white/40 border-white/15",
};
const AWARD_ICON: Record<string, string> = {
  Winner: "🏆",
  "Outstanding Award": "⭐",
  "3rd Place Overall": "🥉",
  "Best Finance Project": "💰",
  "Top 20": "🎯",
  Participant: "🎓",
};

const featured = caseStudies.filter((cs) => cs.award !== "Participant");

/* ─── Modal ─────────────────────────────────────────── */
function CaseModal({ cs, onClose }: { cs: CaseStudy; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose}>
      <div className="relative h-48 md:h-60 flex items-end p-6 overflow-hidden" style={{ background: cs.gradient }}>
        {cs.image && <Image src={cs.image} alt={cs.title} fill className="object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#18233F] via-black/30 to-transparent" />
        <div className="relative z-10">
          <p className="font-mono text-xs text-white/50 mb-1">{cs.competition} · {cs.year}</p>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-none mb-3">{cs.title}</h2>
          <span className={`font-mono text-xs px-3 py-1 rounded-full border ${AWARD_BADGE[cs.award] ?? AWARD_BADGE["Participant"]}`}>
            {AWARD_ICON[cs.award]} {cs.award}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/40 border border-white/10 px-2 py-0.5 rounded">{cs.category}</span>
          <span className="font-mono text-xs text-white/30">{cs.year}</span>
        </div>
        <p className="font-body text-white/70 leading-relaxed">{cs.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {cs.tags.map((t) => <span key={t} className="font-mono text-xs text-white/50 border border-white/10 px-2 py-0.5 rounded">{t}</span>)}
        </div>
        {cs.slides ? (
          <div>
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-3">Slides</p>
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black">
              <iframe src={cs.slides} className="absolute inset-0 w-full h-full" title={`${cs.title} slides`} allowFullScreen />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
            <p className="font-mono text-xs text-white/40">Slide deck uploading soon</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

/* ─── Competition Card (grid tile) ──────────────────── */
function CompCard({ cs, onSelect, index }: { cs: CaseStudy; onSelect: (cs: CaseStudy) => void; index: number }) {
  const isWinner = cs.award !== "Participant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120, damping: 20 }}
      className="group cursor-pointer"
      onClick={() => onSelect(cs)}
    >
      <div className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 bg-[#18233F]">
        {/* Gradient header */}
        <div className="relative h-24 overflow-hidden" style={{ background: cs.gradient }}>
          {cs.image && <Image src={cs.image} alt={cs.title} fill className="object-cover opacity-40" />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#18233F]/80" />

          {/* Award badge */}
          <div className="absolute top-3 left-3">
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${AWARD_BADGE[cs.award] ?? AWARD_BADGE["Participant"]}`}>
              {AWARD_ICON[cs.award]} {cs.award}
            </span>
          </div>

          {/* Category top-right */}
          <div className="absolute top-3 right-3">
            <span className="font-mono text-[10px] text-white/50 bg-black/30 px-2 py-0.5 rounded">
              {cs.category}
            </span>
          </div>

          {/* Winner glow */}
          {isWinner && (
            <div className="absolute inset-0 ring-2 ring-inset ring-white/20" />
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display text-lg text-white leading-tight group-hover:text-accent transition-colors duration-200">
              {cs.title}
            </h3>
            <span className="font-mono text-[10px] text-white/30 whitespace-nowrap mt-1">{cs.year}</span>
          </div>
          <p className="font-mono text-[10px] text-white/40 mb-2">{cs.competition}</p>
          <p className="font-body text-xs text-white/55 leading-relaxed mb-3">{cs.description}</p>

          <div className="flex flex-wrap gap-1">
            {cs.tags.map((t) => (
              <span key={t} className="font-mono text-[10px] text-white/35 border border-white/10 px-1.5 py-0.5 rounded">{t}</span>
            ))}
          </div>

          {/* Slides indicator */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="font-mono text-[10px] text-white/30">
              {cs.slides ? "📊 Slides available" : "⏳ Slides coming soon"}
            </span>
            <span className="font-mono text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Rotating Hero ─────────────────────────────────── */
function CompHero({ onSelect }: { onSelect: (cs: CaseStudy) => void }) {
  const { idx, setIdx, paused, setPaused, advance, retreat } = useRotatingIndex(featured.length, ROTATE_MS);
  const cs = featured[idx];

  return (
    <div className="relative w-full h-[44vh] md:h-[58vh] overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="sync">
        <motion.div key={cs.slug} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <div className="absolute inset-0" style={{ background: cs.gradient }} />
          {cs.image && <Image src={cs.image} alt={cs.title} fill className="object-cover opacity-35" priority />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#18233F] via-[#18233F]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#18233F]/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end px-[5vw] pb-10">
        <AnimatePresence mode="wait">
          <motion.div key={cs.slug + "-c"} className="max-w-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
            <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border mb-3 ${AWARD_BADGE[cs.award] ?? AWARD_BADGE["Participant"]}`}>
              {AWARD_ICON[cs.award]} {cs.award}
            </span>
            <h2 className="font-display text-5xl md:text-7xl text-white leading-none mb-1">{cs.title}</h2>
            <p className="font-mono text-xs text-white/40 mb-3">{cs.competition} · {cs.year}</p>
            <p className="font-body text-white/60 max-w-md mb-5 leading-relaxed text-sm">{cs.description}</p>
            <div className="flex gap-3">
              <button onClick={() => onSelect(cs)} className="flex items-center gap-2 font-mono text-sm px-6 py-2.5 bg-white text-navy hover:bg-white/90 transition-colors rounded-full">
                {cs.slides ? "📊 View Slides" : "ⓘ View Details"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <HeroNavDots
          count={featured.length}
          idx={idx}
          paused={paused}
          durationMs={ROTATE_MS}
          navButtonClass={HERO_NAV_BUTTON_CLASS}
          onPrev={() => { retreat(); setPaused(true); }}
          onNext={() => { advance(); setPaused(true); }}
          onGoTo={(i) => { setIdx(i); setPaused(true); }}
        />
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────── */
export default function CompetitionsPage() {
  const [selected, setSelected] = useState<CaseStudy | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = activeCategory === "All"
    ? caseStudies
    : caseStudies.filter((cs) => cs.category === activeCategory);

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #18233F 0%, #12192E 100%)" }}>
      <Navbar />

      <div className="pt-16">
        <CompHero onSelect={setSelected} />
      </div>

      {/* Category filters */}
      <div className="px-[5vw] pt-8 pb-4 max-w-[1400px] mx-auto">
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-accent text-white border-accent"
                  : "bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white/80"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 opacity-60">({caseStudies.filter((cs) => cs.category === cat).length})</span>
              )}
            </button>
          ))}
        </motion.div>
      </div>

      {/* All competitions grid */}
      <div className="px-[5vw] pb-24 pt-4 max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.map((cs, i) => (
              <CompCard key={cs.slug} cs={cs} onSelect={setSelected} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && <CaseModal cs={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
