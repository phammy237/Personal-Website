"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const principles = [
  {
    label: "Problem First",
    icon: "◎",
    short: "Start with the problem, not the feature",
    detail:
      "Before thinking about solutions, I ask what the actual problem is — who has it, how often, and why it matters. The feature comes after.",
  },
  {
    label: "User Behavior",
    icon: "◈",
    short: "Understand friction and decision points",
    detail:
      "I map how people actually move through a system, where they get stuck, and what drives their choices. Behavior reveals what requirements documents miss.",
  },
  {
    label: "Tradeoffs",
    icon: "⌥",
    short: "Balance user needs, business goals, and constraints",
    detail:
      "Good decisions require holding multiple competing pressures at once. I try to make those tensions explicit rather than pretending they don't exist.",
  },
  {
    label: "Clarity First",
    icon: "⊡",
    short: "Clarity, prioritization, and execution",
    detail:
      "Most problems are solvable if you're ruthlessly clear about what matters and what doesn't. Vagueness is usually where projects go wrong.",
  },
  {
    label: "Signal → Action",
    icon: "→",
    short: "Turn messy information into actionable direction",
    detail:
      "I enjoy synthesizing noisy, incomplete information into a clear next step. That translation — from data to decision — is where I think I add the most value.",
  },
];

const highlights = [
  { label: "Internships", value: "3" },
  { label: "Projects", value: "12+" },
  { label: "Awards", value: "6+" },
  { label: "Members Led", value: "350+" },
];

function Headshot() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full aspect-[3/4] max-w-[340px] mx-auto md:mx-0 rounded-2xl overflow-hidden border border-border shadow-xl shadow-accent/5">
      {!error ? (
        <Image
          src="/headshot.JPG"
          alt="My Pham"
          fill
          className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority
        />
      ) : null}

      {/* Placeholder shown until photo loads or if no photo */}
      {(!loaded || error) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #080D24 100%)" }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center font-display text-4xl text-white"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #3B82F6)" }}
          >
            M
          </div>
          <p className="font-mono text-xs text-white/30 text-center px-4">
            {error ? "Drop headshot.jpg in /public" : "Loading…"}
          </p>
        </div>
      )}

      {/* Decorative gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/60 to-transparent pointer-events-none" />

      {/* Name tag */}
      <div className="absolute bottom-4 left-4 right-4">
        <p className="font-display text-white text-lg">My Pham</p>
        <p className="font-mono text-xs text-white/50">UF Data Science · Class of 2028</p>
      </div>
    </div>
  );
}

function HowIThink() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <motion.div
      className="mt-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
    >
      <p className="font-mono text-xs text-muted dark:text-white/40 tracking-widest uppercase mb-2">
        How I Think
      </p>
      <p className="font-body text-sm text-muted dark:text-white/40 mb-8">
        Click any principle to expand it.
      </p>

      <div className="flex flex-wrap gap-3">
        {principles.map((p, i) => (
          <div key={i} className="w-full sm:w-auto">
            <motion.button
              onClick={() => setActive(active === i ? null : i)}
              className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-200 text-left ${
                active === i
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border dark:border-white/10 text-muted dark:text-white/50 hover:border-accent/50 hover:text-accent/70"
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className={`text-sm transition-colors duration-200 ${active === i ? "text-accent" : "text-white/30"}`}>
                {p.icon}
              </span>
              <span className="font-mono text-xs tracking-wide whitespace-nowrap">{p.label}</span>
              <span className={`ml-1 text-xs transition-transform duration-200 ${active === i ? "rotate-180 text-accent" : "text-white/20"}`}>
                ▾
              </span>
            </motion.button>

            <AnimatePresence>
              {active === i && (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border border-accent/20 bg-accent/5 rounded-2xl px-5 py-4 max-w-sm">
                    <p className="font-body text-sm text-surface/80 dark:text-white/70 leading-relaxed mb-1">
                      {p.short}
                    </p>
                    <p className="font-body text-xs text-muted dark:text-white/40 leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function Backstory() {
  return (
    <section id="about" className="bg-base dark:bg-[#0A0C1E] px-[5vw] py-28 md:py-40">
      <div className="max-w-[1200px] mx-auto">
        {/* Section label */}
        <motion.p
          className="font-mono text-xs text-muted dark:text-white/40 tracking-widest uppercase mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.p>

        <div className="grid md:grid-cols-[auto_1fr] gap-12 md:gap-16 items-start mb-16">
          {/* Headshot */}
          <motion.div
            className="w-full md:w-[280px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          >
            <Headshot />
          </motion.div>

          {/* Bio */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
          >
            <h2 className="font-display text-7xl md:text-8xl text-surface dark:text-white leading-tight">
              Hi, I&apos;m My.
            </h2>

            <p className="font-body text-xl text-muted dark:text-white/60 leading-relaxed">
              I&apos;m a Data Science student at the University of Florida. My work sits at the
              intersection of data, product, and operations. I am interested in using analytical
              thinking to clarify complex problems, improve workflows, and build systems that are
              practical for the people using them. Most recently, I have been designing product
              workflows for Lattera, an F&amp;B startup where I work as a Product Management Intern.
              I have also worked in Risk Advisory at Deloitte and built projects across fairness
              analytics, campus support tools, and decision modeling.
            </p>
            <p className="font-body text-xl text-muted dark:text-white/60 leading-relaxed">
              My research interests include sustainability, ESG, and data-driven decision-making.
              At UF, I have worked on research related to end-of-life cycles for batteries, and
              during my time at Deloitte, I explored sustainable finance and its role in shaping
              ESG strategy.
            </p>
            <p className="font-body text-xl text-muted dark:text-white/60 leading-relaxed">
              Outside of my academic and professional work, I have served as External Vice President
              of UF&apos;s Data Science &amp; Informatics club for two years, previously served as
              Treasurer for the Vietnamese International Student Association, and will serve as Head
              of Operations for WingHacks this upcoming year.
            </p>
            <p className="font-body text-xl text-muted dark:text-white/60 leading-relaxed">
              I am currently exploring opportunities in data analytics, product management, tech
              consulting, and AI-driven business solutions.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-1">
              {["Product Strategy", "Data Science", "Consulting", "AI/ML", "Research", "Builder"].map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs text-accent border border-accent/30 bg-accent-light px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Arrow links */}
            <div className="flex flex-wrap gap-6 mt-3">
              <Link href="/biography" className="font-mono text-sm text-white/50 hover:text-white transition-colors duration-200">
                wanna learn more → biography
              </Link>
              <Link href="/connect" className="font-mono text-sm text-white/50 hover:text-white transition-colors duration-200">
                wanna hang out → contact
              </Link>
            </div>

          </motion.div>
        </div>

        {/* Stats + Cards row */}
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="bg-card dark:bg-white/5 border border-border dark:border-white/10 rounded-xl p-6 text-center"
              >
                <p className="font-display text-4xl text-accent mb-1">{h.value}</p>
                <p className="font-mono text-xs text-muted dark:text-white/40 uppercase tracking-widest">{h.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Education card */}
            <div className="bg-card dark:bg-white/5 border border-border dark:border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-body font-semibold text-surface dark:text-white">University of Florida</p>
                  <p className="font-mono text-xs text-muted dark:text-white/40 mt-1">Gainesville, FL</p>
                </div>
                <span className="font-mono text-xs text-accent bg-accent-light px-2 py-1 rounded">
                  Expected May 2028
                </span>
              </div>
              <p className="font-body text-sm text-surface/80 dark:text-white/70 mb-2">B.S. Data Science · GPA 3.83</p>
              <p className="font-mono text-xs text-muted dark:text-white/40">
                Certificate in AI Fundamentals and Applications
              </p>
            </div>

            {/* Early career programs */}
            <div className="bg-card dark:bg-white/5 border border-border dark:border-white/10 rounded-xl p-6">
              <p className="font-mono text-xs text-muted dark:text-white/40 uppercase tracking-widest mb-3">
                Selected Early Career Programs
              </p>
              <div className="flex flex-wrap gap-2">
                {["BCG Launch", "McKinsey Forward", "Forte Career Ready", "JPMorgan Spring Insights", "Morgan Stanley Early Insights"].map((p) => (
                  <span key={p} className="font-mono text-xs text-surface/70 dark:text-white/50 border border-border dark:border-white/10 px-2 py-1 rounded">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* How I Think */}
        <HowIThink />
      </div>
    </section>
  );
}
