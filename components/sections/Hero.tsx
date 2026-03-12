"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col px-[5vw] pt-32 pb-12 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #080D24 0%, #0D1030 50%, #130820 100%)" }}
    >
      {/* Background radials */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_#8B5CF620,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,_#3B82F615,_transparent_60%)]" />

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center gap-6">
        {/* Name */}
        <div>
          {"MY PHAM".split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block font-display text-white"
              style={{ fontSize: "clamp(56px, 12vw, 140px)", lineHeight: 1 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.05 + i * 0.05,
                type: "spring",
                stiffness: 150,
                damping: 20,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Hero line */}
        <motion.p
          className="font-body text-xl md:text-2xl text-white/80 max-w-2xl leading-snug"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 100, damping: 20 }}
        >
          I turn ambiguous problems into product, strategy, and data-driven solutions.
        </motion.p>

        {/* Sub line */}
        <motion.p
          className="font-mono text-sm text-white/40 max-w-xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Data Science student at UF from Vietnam — interested in product management,
          consulting, and building thoughtful solutions that create real impact.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-wrap gap-4 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <Link
            href="/projects"
            className="font-mono text-sm px-6 py-3 bg-accent text-white hover:bg-accent/90 transition-colors duration-200"
          >
            View Projects →
          </Link>
          <Link
            href="/cv"
            className="font-mono text-sm px-6 py-3 border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-colors duration-200"
          >
            View CV
          </Link>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div
        className="relative flex items-center gap-4 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="scroll-indicator flex flex-col items-center gap-2 text-white/20">
          <span className="font-mono text-xs tracking-widest">scroll</span>
          <div className="w-px h-10 bg-white/20" />
        </div>
        <div className="flex gap-3 ml-auto">
          <a
            href="https://github.com/mypham237"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            GitHub
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://linkedin.com/in/mypham237"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-white/20">·</span>
          <a
            href="mailto:phamlehamy2307@gmail.com"
            className="font-mono text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Email
          </a>
        </div>
      </motion.div>
    </section>
  );
}
