"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/* ─── Social icons ────────────────────────────────────────────── */
function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

/* ─── Flip board ──────────────────────────────────────────────── */
const PHRASES = [
  "PRODUCT THINKER ",
  "DATA SCIENTIST  ",
  "PROBLEM SOLVER  ",
  "SUSTAINABILITY  ",
  "DECISION MAKER  ",
  "BUILDER         ",
];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ·—0123456789";

function FlipBoard() {
  const [text, setText] = useState(PHRASES[0]);
  const idxRef = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % PHRASES.length;
      const target = PHRASES[idxRef.current];
      let frame = 0;
      const frames = 16;
      const scramble = setInterval(() => {
        frame++;
        setText(
          target
            .split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (frame / frames > i / target.length + 0.25) return ch;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
        if (frame >= frames) clearInterval(scramble);
      }, 40);
    }, 3200);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] text-white/25 tracking-[0.25em] uppercase">
        Boarding Text
      </span>
      <div className="inline-flex bg-white/5 border border-white/10 rounded px-4 py-2.5 gap-[2px]">
        {text.split("").map((ch, i) =>
          ch === " " ? (
            <span key={i} className="w-2 inline-block" />
          ) : (
            <span
              key={i}
              className="font-mono text-sm text-accent tracking-widest"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {ch}
            </span>
          )
        )}
      </div>
    </div>
  );
}

/* ─── Boarding pass card ──────────────────────────────────────── */
function BoardingPass() {
  return (
    <motion.div
      className="relative bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, x: 50, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 70, damping: 18 }}
      whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(139, 92, 246, 0.15)" }}
    >
      {/* Header row */}
      <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-white/[0.08]">
        <span className="font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase">
          Boarding Pass
        </span>
        <span className="font-mono text-[10px] text-white/20 tracking-widest">
          No. MY-2028
        </span>
      </div>

      {/* Route: HAN → GNV */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-5xl text-white leading-none">HAN</p>
            <p className="font-mono text-[10px] text-white/30 mt-1.5 tracking-wider">HANOI</p>
          </div>
          <div className="flex-1 flex items-center gap-1.5 justify-center pb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-base">✈</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="text-right">
            <p className="font-display text-5xl text-white leading-none">GNV</p>
            <p className="font-mono text-[10px] text-white/30 mt-1.5 tracking-wider">GAINESVILLE</p>
          </div>
        </div>
      </div>

      {/* Dashed tear line */}
      <div className="mx-6 border-t border-dashed border-white/[0.08] mb-5" />

      {/* Details grid */}
      <div className="px-6 pb-5 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider mb-1">Major</p>
            <p className="font-mono text-xs text-white/60">Data Sci.</p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider mb-1">Status</p>
            <p className="font-mono text-xs text-accent">In Progress</p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider mb-1">GPA</p>
            <p className="font-mono text-xs text-white/60">3.83</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Builder", "Problem Solver", "PM Intern", "ESG Research"].map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-accent/60 border border-accent/20 bg-accent/5 rounded px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Barcode strip */}
      <div className="flex gap-[2px] items-end h-7 mx-6 mb-5 opacity-20">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-white rounded-[1px]"
            style={{ height: `${50 + Math.abs(Math.sin(i * 2.1 + 0.5) * 50)}%` }}
          />
        ))}
      </div>

      {/* Decorative stamp */}
      <div className="absolute bottom-12 right-5 w-14 h-14 rounded-full border border-accent/20 flex items-center justify-center pointer-events-none">
        <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center">
          <span className="font-mono text-[7px] text-accent/50 text-center leading-tight">
            UF<br />2028
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Destination cards ───────────────────────────────────────── */
const DESTINATIONS = [
  {
    num: "01",
    title: "Work Library",
    desc: "Projects in data, product, and operations — tools, models, and interfaces built to solve real problems.",
    href: "/projects",
  },
  {
    num: "02",
    title: "Biography",
    desc: "My story — where I began, what shaped my path, and what drives me forward.",
    href: "/biography",
  },
  {
    num: "03",
    title: "Involvements",
    desc: "Leadership, competitions, research, and the places where I show up and contribute.",
    href: "/involvements",
  },
];

function DestinationCards() {
  return (
    <div className="relative -mx-[5vw] border-t border-white/[0.07]">
      <div className="px-[5vw] pt-3 pb-1">
        <span className="font-mono text-[9px] text-white/20 tracking-[0.3em] uppercase">
          Destinations
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.07]">
        {DESTINATIONS.map((dest, i) => (
          <motion.div
            key={dest.num}
            className="group px-[5vw] md:px-6 first:pl-[5vw] last:pr-[5vw] py-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] text-white/20 tracking-widest block mb-2">
                  {dest.num}
                </span>
                <h3 className="font-display text-xl text-white mb-2 group-hover:text-accent transition-colors duration-200">
                  {dest.title}
                </h3>
                <p className="font-mono text-[11px] text-white/35 leading-relaxed">
                  {dest.desc}
                </p>
              </div>
              <Link
                href={dest.href}
                className="flex-shrink-0 w-8 h-8 border border-white/15 rounded-full flex items-center justify-center text-white/35 hover:border-accent hover:text-accent transition-all duration-200 mt-1 hover:scale-110"
              >
                →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────────── */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col px-[5vw] pt-28 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #050818 0%, #0D1030 40%, #0A0520 70%, #080D24 100%)" }}
    >
      {/* Ambient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #8B5CF628 0%, transparent 70%)", top: "-8%", left: "-8%" }}
        animate={{ x: [0, 30, -15, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #3B82F620 0%, transparent 70%)", bottom: "10%", right: "-5%" }}
        animate={{ x: [0, -35, 20, 0], y: [0, 30, -15, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Departure board top bar */}
      <motion.div
        className="relative flex justify-between items-center mb-10 font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span>Departure Track</span>
        <span>FLT No. MY-2028</span>
      </motion.div>

      {/* Main grid */}
      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 xl:gap-16 items-start">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">
          {/* Name */}
          <div className="leading-none">
            {"MY PHAM".split("").map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block font-display text-white"
                style={{ fontSize: "clamp(52px, 10vw, 120px)", lineHeight: 1 }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.045, type: "spring", stiffness: 160, damping: 22 }}
              >
                {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </div>

          {/* Now boarding subtitle */}
          <motion.p
            className="font-mono text-sm text-white/40 tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            Now Boarding:{" "}
            <span className="text-accent">My Pham</span>
          </motion.p>

          {/* Flip board */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <FlipBoard />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="font-body text-lg text-white/55 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            Data Science student building product, operations, sustainability,
            and decision systems.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <Link
              href="/projects"
              className="font-mono text-xs px-5 py-2.5 bg-accent text-white hover:bg-accent/85 transition-colors duration-200 rounded-full tracking-wider"
            >
              Explore My Work
            </Link>
            <Link
              href="/cv"
              className="font-mono text-xs px-5 py-2.5 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors duration-200 rounded-full tracking-wider"
            >
              Glance at My CV
            </Link>
            <Link
              href="/connect"
              className="font-mono text-xs px-5 py-2.5 border border-white/10 text-white/40 hover:text-white/70 hover:border-white/30 transition-colors duration-200 rounded-full tracking-wider"
            >
              Come Say Hi
            </Link>
          </motion.div>

          {/* Social row */}
          <motion.div
            className="flex items-center gap-4 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <a href="https://github.com/phammy237" target="_blank" rel="noopener noreferrer"
              className="text-white/25 hover:text-white/60 transition-colors duration-200">
              <GithubIcon />
            </a>
            <a href="https://linkedin.com/in/mypham237" target="_blank" rel="noopener noreferrer"
              className="text-white/25 hover:text-white/60 transition-colors duration-200">
              <LinkedInIcon />
            </a>
            <a href="mailto:phamlehamy2307@gmail.com"
              className="text-white/25 hover:text-white/60 transition-colors duration-200">
              <EmailIcon />
            </a>
            <a href="https://www.instagram.com/whyy.pmyy_/" target="_blank" rel="noopener noreferrer"
              className="text-white/25 hover:text-white/60 transition-colors duration-200">
              <InstagramIcon />
            </a>
          </motion.div>
        </div>

        {/* ── Right column: Boarding Pass ── */}
        <BoardingPass />
      </div>

      {/* Destination cards pinned at bottom */}
      <div className="relative mt-10">
        <DestinationCards />
      </div>
    </section>
  );
}
