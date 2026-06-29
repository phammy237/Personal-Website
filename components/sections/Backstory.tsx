"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SocialLinks } from "@/components/ui/SocialLinks";

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


const photos = [
  { src: "/headshot.jpg",    caption: "UF Data Science · Class of 2028" },
  { src: "/IMG_3794.JPG",   caption: "" },
  { src: "/IMG_4610.JPG",   caption: "" },
  { src: "/IMG_7605.JPG",   caption: "" },
  { src: "/IMG_7729.JPG",   caption: "" },
  { src: "/IMG_9501.JPG",   caption: "" },
];

function PhotoSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const [errorSet, setErrorSet] = useState<Set<number>>(new Set());

  const visible = photos.filter((_, i) => !errorSet.has(i));
  const current = visible[index] ?? visible[0];
  const currentOrigIdx = current ? photos.indexOf(current) : 0;

  function go(delta: number) {
    setDirection(delta);
    setIndex((prev) => (prev + delta + visible.length) % visible.length);
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="w-full max-w-[380px] mx-auto md:mx-0">
      {/* Slide frame */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-xl shadow-accent/5">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentOrigIdx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {!errorSet.has(currentOrigIdx) ? (
              <Image
                src={current?.src ?? "/headshot.JPG"}
                alt="My Pham"
                fill
                className={`object-cover transition-opacity duration-500 ${loadedSet.has(currentOrigIdx) ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setLoadedSet((s) => new Set(s).add(currentOrigIdx))}
                onError={() => setErrorSet((s) => new Set(s).add(currentOrigIdx))}
                priority={currentOrigIdx === 0}
              />
            ) : null}

            {/* Gradient + caption */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/80 to-transparent pointer-events-none" />
            {current?.caption && (
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-white text-lg">My Pham</p>
                <p className="font-mono text-xs text-white/50">{current.caption}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Arrows — only show when more than 1 visible photo */}
        {visible.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-accent/70"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-accent/70"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {visible.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-accent" : "w-1.5 bg-muted/40 dark:bg-white/20"}`}
            />
          ))}
        </div>
      )}
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
              <span className={`text-sm transition-colors duration-200 ${active === i ? "text-accent" : "text-surface/30 dark:text-white/30"}`}>
                {p.icon}
              </span>
              <span className="font-mono text-xs tracking-wide whitespace-nowrap">{p.label}</span>
              <span className={`ml-1 text-xs transition-transform duration-200 ${active === i ? "rotate-180 text-accent" : "text-surface/20 dark:text-white/20"}`}>
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
    <section id="about" className="bg-white dark:bg-navy px-[5vw] py-28 md:py-40">
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
            className="w-full md:w-[380px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          >
            <PhotoSlider />
            <div className="mt-4">
              <SocialLinks iconClass="text-muted dark:text-white/45 hover:text-accent transition" />
            </div>
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
              I&apos;m My Pham, a Data Science student at the University of Florida interested in
              product, data, and operations.
            </p>
            <p className="font-body text-xl text-muted dark:text-white/60 leading-relaxed">
              I like turning messy, ambiguous problems into workflows, tools, and product systems
              that people can actually use. I&apos;m currently a Product Management Intern at
              Lattera, an F&amp;B startup, and previously worked in Risk Advisory at Deloitte. My
              work spans product strategy, analytics, sustainability, ESG, and decision modeling.
            </p>
            <p className="font-body text-xl text-muted dark:text-white/60 leading-relaxed">
              At UF, I&apos;ve served as External Vice President of Data Science &amp; Informatics
              for two years, previously served as Treasurer for the Vietnamese International Student
              Association, and will be Head of Operations for WingHacks. Outside of work, I&apos;m
              usually planning a trip, exploring a city, taking photos, drinking matcha, or making
              food.
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
              <Link href="/biography" className="font-mono text-sm text-muted dark:text-white/50 hover:text-surface dark:hover:text-white transition-colors duration-200">
                wanna learn more → biography
              </Link>
              <Link href="/connect" className="font-mono text-sm text-muted dark:text-white/50 hover:text-surface dark:hover:text-white transition-colors duration-200">
                wanna hang out → contact
              </Link>
            </div>

          </motion.div>
        </div>

        {/* Cards row */}
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
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
