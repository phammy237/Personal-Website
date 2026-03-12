"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

/* Social icon SVGs */
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
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function SpotifyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col px-[5vw] pt-32 pb-12 overflow-hidden"
    >
      {/* Background — drop public/hero-bg.jpg to use a photo */}
      <div className="absolute inset-0">
        {/* Try loading a background photo */}
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          className="object-cover opacity-20"
          onError={() => {/* silently fail, gradient shows */}}
          priority
        />
        {/* Base dark gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #050818 0%, #0D1030 40%, #130820 70%, #080D24 100%)" }} />
        {/* Radial color blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,_#8B5CF640,_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_85%,_#3B82F630,_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,_#EC489920,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_80%,_#06B6D420,_transparent_45%)]" />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center gap-6">
        <div>
          {"MY PHAM".split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block font-display text-white"
              style={{ fontSize: "clamp(56px, 12vw, 140px)", lineHeight: 1 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, type: "spring", stiffness: 150, damping: 20 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        <motion.p
          className="font-body text-xl md:text-2xl text-white/80 max-w-2xl leading-snug"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 100, damping: 20 }}
        >
          I turn ambiguous problems into product, strategy, and data-driven solutions.
        </motion.p>

        <motion.p
          className="font-mono text-sm text-white/40 max-w-xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Data Science student at UF from Vietnam — interested in product management,
          consulting, and building thoughtful solutions that create real impact.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <Link href="/projects" className="font-mono text-sm px-6 py-3 bg-accent text-white hover:bg-accent/90 transition-colors duration-200">
            View Work →
          </Link>
          <Link href="/cv" className="font-mono text-sm px-6 py-3 border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-colors duration-200">
            View CV
          </Link>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div className="relative flex items-center gap-4 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <div className="scroll-indicator flex flex-col items-center gap-2 text-white/20">
          <span className="font-mono text-xs tracking-widest">scroll</span>
          <div className="w-px h-10 bg-white/20" />
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <a href="https://github.com/phammy237" target="_blank" rel="noopener noreferrer"
            className="text-white/30 hover:text-white/70 transition-colors duration-200" title="GitHub">
            <GithubIcon />
          </a>
          <a href="https://linkedin.com/in/mypham237" target="_blank" rel="noopener noreferrer"
            className="text-white/30 hover:text-white/70 transition-colors duration-200" title="LinkedIn">
            <LinkedInIcon />
          </a>
          <a href="mailto:phamlehamy2307@gmail.com"
            className="text-white/30 hover:text-white/70 transition-colors duration-200" title="Email">
            <EmailIcon />
          </a>
          <a href="https://www.instagram.com/whyy.pmyy_/" target="_blank" rel="noopener noreferrer"
            className="text-white/30 hover:text-white/70 transition-colors duration-200" title="Instagram">
            <InstagramIcon />
          </a>
          <a href="https://www.facebook.com/pmyy237/" target="_blank" rel="noopener noreferrer"
            className="text-white/30 hover:text-white/70 transition-colors duration-200" title="Facebook">
            <FacebookIcon />
          </a>
          <a href="https://open.spotify.com/user/31jm26ge673vkzdu4iflmlqgj5vq?si=AiLbuWlxSqyukyyAxBPwLg" target="_blank" rel="noopener noreferrer"
            className="text-white/30 hover:text-white/70 transition-colors duration-200" title="Spotify">
            <SpotifyIcon />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
