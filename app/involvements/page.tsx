"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ModalShell } from "@/components/ui/ModalShell";
import { HeroNavDots } from "@/components/ui/HeroNavDots";
import { useRotatingIndex } from "@/lib/hooks/useRotatingIndex";

type InvType = "Leadership" | "Professional" | "Mentorship";

type Involvement = {
  role: string;
  org: string;
  period: string;
  type: InvType;
  color: string;
  gradient: string;
  description: string;
  bullets: string[];
  awards: string[];
  image?: string;  // drop in public/involvements/<slug>.jpg
};

const involvements: Involvement[] = [
  {
    role: "External Vice President",
    org: "UF Data Science & Informatics Club",
    period: "Apr 2025 — Present",
    type: "Leadership",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)",
    description: "Led the largest data science organization at UF — 350+ members, 8+ winning hackathon teams.",
    bullets: [
      "Drove outreach with AIIRI, Google, Microsoft, Deloitte, and startups; negotiated funding and launched student projects.",
      "Hosted 5+ research and industry tours, connecting 350+ members with labs, startups, and industry professionals, leading to 8+ winning hackathon teams.",
      "Directed marketing and outreach growing internal engagement by 300% and boosting student–employer engagement by 600%.",
      "Earned Student Org of the Year and Career Influencer Award.",
      "Initiated partnership with UF Career Connections Center to host career-readiness workshops.",
    ],
    awards: ["Student Org of the Year", "Career Influencer Award"],
  },
  {
    role: "Vice President",
    org: "AI Security & Risk Association",
    period: "2025 — Present",
    type: "Leadership",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    description: "Leading AI security and risk discussions at UF.",
    bullets: [
      "Leading organization focused on AI safety, security, and ethical risk management.",
      "Organizing events and workshops on responsible AI development.",
    ],
    awards: [],
  },
  {
    role: "Fellow",
    org: "Product Space",
    period: "2026 — Present",
    type: "Professional",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
    description: "Selected fellow working on real product strategy challenges for live clients.",
    bullets: [
      "Working as a product strategy fellow on live client projects (Lattéra, Gator Creek LLC).",
      "Designing MVP pilot measurement systems and go-to-market strategies.",
    ],
    awards: [],
  },
  {
    role: "Treasurer",
    org: "Vietnam International Student Association",
    period: "Aug 2024 — Present",
    type: "Leadership",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    description: "Managing finances and cultural programming for VISA.",
    bullets: [
      "Manage $10,000+ annual budget and secure $5,000+ in sponsorships.",
      "Lead planning and execution of large-scale Tết Festivals (300+ attendees).",
      "Oversee logistics and resource allocation for cross-functional initiatives.",
    ],
    awards: [],
  },
  {
    role: "Mentor",
    org: "Society of Asian Scientists and Engineers (SASE)",
    period: "2025 — Present",
    type: "Mentorship",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    description: "Mentoring underclassmen in career and academic development.",
    bullets: [
      "Providing career guidance and mentorship to underclassmen.",
      "Supporting students with internship applications, interview prep, and networking.",
    ],
    awards: [],
  },
  {
    role: "Member",
    org: "Gator Student Consulting Organization",
    period: "2025 — Present",
    type: "Professional",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    description: "Consulting on real business problems for local organizations.",
    bullets: [
      "Engaging in consulting case work and professional development.",
      "Working with local businesses and nonprofits on strategic challenges.",
    ],
    awards: [],
  },
  {
    role: "Fundraising Committee Intern",
    org: "Student Organization",
    period: "2025",
    type: "Professional",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    description: "Supporting fundraising efforts and sponsor outreach.",
    bullets: [
      "Assisted with fundraising strategy and sponsor outreach.",
      "Contributed to event planning and execution.",
    ],
    awards: [],
  },
];

const CATEGORIES: InvType[] = ["Leadership", "Professional", "Mentorship"];
const ROTATE_MS = 6000;

const featured = involvements.slice(0, 5);

/* ─── Modal ─────────────────────────────────────────── */
function InvModal({ inv, onClose }: { inv: Involvement; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
      {/* Header */}
      <div className="relative h-44 flex items-end p-6 overflow-hidden" style={{ background: inv.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F1A] via-black/20 to-transparent" />
        <div className="relative z-10">
          <span className="font-mono text-xs text-white/50 block mb-1">{inv.type} · {inv.period}</span>
          <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">{inv.role}</h2>
          <p className="font-mono text-sm text-white/60 mt-1">{inv.org}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <p className="font-body text-white/70 leading-relaxed italic">{inv.description}</p>

        <ul className="space-y-3">
          {inv.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-accent mt-1.5 flex-shrink-0 text-xs">▸</span>
              <span className="font-body text-sm text-white/65 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        {inv.awards.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {inv.awards.map((a) => (
              <span key={a} className="font-mono text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
                🏆 {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

/* ─── Card ──────────────────────────────────────────── */
function InvCard({ inv, onSelect }: { inv: Involvement; onSelect: (inv: Involvement) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 w-[220px] md:w-[260px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={() => onSelect(inv)}
      >
        <div className="absolute inset-0" style={{ background: inv.gradient }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="font-mono text-[10px] text-white/70 bg-black/30 border border-white/20 px-2 py-0.5 rounded-full">
            {inv.type}
          </span>
        </div>

        {/* Org initial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: hovered ? 1.1 : 1, opacity: hovered ? 1 : 0.75 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-12 h-12 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center font-display text-white text-xl backdrop-blur-sm"
          >
            {inv.org.charAt(0)}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="font-body text-white text-sm font-medium leading-tight">{inv.role}</p>
          <p className="font-mono text-[10px] text-white/50 mt-0.5 truncate">{inv.org}</p>
        </div>
      </motion.div>

      {/* Hover strip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute left-0 right-0 top-full z-30 bg-white dark:bg-[#161828] border border-gray-200 dark:border-white/10 rounded-b-xl px-3 py-2.5 shadow-xl"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <p className="font-body text-xs text-surface/60 dark:text-white/60 line-clamp-2 leading-relaxed mb-1.5">{inv.description}</p>
            <p className="font-mono text-[10px] text-surface/30 dark:text-white/30">{inv.period}</p>
            {inv.awards.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {inv.awards.map((a) => <span key={a} className="font-mono text-[10px] text-yellow-300/80">🏆 {a}</span>)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Rotating Hero ─────────────────────────────────── */
function InvHero({ onSelect }: { onSelect: (inv: Involvement) => void }) {
  const { idx, setIdx, paused, setPaused, advance, retreat } = useRotatingIndex(featured.length, ROTATE_MS);
  const inv = featured[idx];

  return (
    <div
      className="relative w-full h-[48vh] md:h-[62vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div key={inv.org} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <div className="absolute inset-0" style={{ background: inv.gradient }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--page-bg) 0%, transparent 60%)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end px-[5vw] pb-12">
        <AnimatePresence mode="wait">
          <motion.div key={inv.org + "-c"} className="max-w-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
            <span className="font-mono text-xs text-white/40 block mb-2">{inv.type} · {inv.period}</span>
            <h2 className="font-display text-5xl md:text-7xl text-white leading-none mb-1">{inv.role}</h2>
            <p className="font-mono text-sm text-white/40 mb-3">{inv.org}</p>
            <p className="font-body text-white/60 max-w-md mb-5 leading-relaxed text-sm">{inv.description}</p>
            {inv.awards.length > 0 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {inv.awards.map((a) => (
                  <span key={a} className="font-mono text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">🏆 {a}</span>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => onSelect(inv)} className="flex items-center gap-2 font-mono text-sm px-6 py-2.5 bg-white text-navy hover:bg-white/90 transition-colors rounded-full">
                ⓘ View Details
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <HeroNavDots
          count={featured.length}
          idx={idx}
          paused={paused}
          durationMs={ROTATE_MS}
          onPrev={() => { retreat(); setPaused(true); }}
          onNext={() => { advance(); setPaused(true); }}
          onGoTo={(i) => { setIdx(i); setPaused(true); }}
        />
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────── */
export default function InvolvementsPage() {
  const [selected, setSelected] = useState<Involvement | null>(null);

  return (
    <main className="min-h-screen bg-base dark:bg-navy">
      <Navbar />

      <div className="pt-16">
        <InvHero onSelect={setSelected} />
      </div>

      <div className="pb-24 pt-4">
        {CATEGORIES.map((cat) => {
          const items = involvements.filter((inv) => inv.type === cat);
          if (!items.length) return null;
          return (
            <motion.div key={cat} className="mb-10" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
              <p className="font-mono text-sm text-surface/60 dark:text-white/60 uppercase tracking-widest mb-3 px-[5vw]">{cat}</p>
              <div className="flex gap-4 px-[5vw] overflow-x-auto pb-14 scrollbar-hide">
                {items.map((inv) => <InvCard key={`${inv.role}-${inv.org}`} inv={inv} onSelect={setSelected} />)}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && <InvModal inv={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
