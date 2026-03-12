"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

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
          src="/headshot.jpg"
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

export function Backstory() {
  return (
    <section id="about" className="bg-base px-[5vw] py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto">
        {/* Section label */}
        <motion.p
          className="font-mono text-xs text-muted tracking-widest uppercase mb-12"
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
            <h2 className="font-display text-5xl md:text-6xl text-surface leading-tight">
              Hi, I&apos;m My.
            </h2>

            <p className="font-body text-lg text-muted leading-relaxed">
              I&apos;m a Data Science student at the University of Florida originally from Vietnam,
              and I am most energized by turning ambiguity into direction. I love working at the
              intersection of product, strategy, and execution — where the challenge is not just
              building something, but figuring out what is actually worth building, why it matters,
              and how to make it work in the real world.
            </p>
            <p className="font-body text-lg text-muted leading-relaxed">
              What draws me to both product management and consulting is the same core mindset:
              understanding people, breaking down messy problems, asking better questions, and
              turning insights into action. I enjoy thinking structurally, finding patterns in
              complexity, and connecting the dots between user needs, business goals, and technical
              possibilities.
            </p>
            <p className="font-body text-lg text-muted leading-relaxed">
              Across my projects I&apos;ve worked on dashboards, data pipelines, backend systems,
              and end-to-end product ideas — which has taught me how to move between the big picture
              and the details. I like being both analytical and creative: someone who can zoom out to
              frame the problem, then zoom in to make sure the solution is thoughtful, practical, and
              well executed.
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

            <div className="flex gap-4 mt-1">
              <a
                href="mailto:phamlehamy2307@gmail.com"
                className="font-mono text-sm text-accent hover:underline"
              >
                phamlehamy2307@gmail.com
              </a>
              <span className="text-border">·</span>
              <a
                href="https://linkedin.com/in/mypham237"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-accent hover:underline"
              >
                LinkedIn ↗
              </a>
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
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <p className="font-display text-4xl text-accent mb-1">{h.value}</p>
                <p className="font-mono text-xs text-muted uppercase tracking-widest">{h.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Education card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-body font-semibold text-surface">University of Florida</p>
                  <p className="font-mono text-xs text-muted mt-1">Gainesville, FL</p>
                </div>
                <span className="font-mono text-xs text-accent bg-accent-light px-2 py-1 rounded">
                  Expected May 2028
                </span>
              </div>
              <p className="font-body text-sm text-surface/80 mb-2">B.S. Data Science · GPA 3.83</p>
              <p className="font-mono text-xs text-muted">
                Certificate in AI Fundamentals and Applications
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {["Emerging Gator Award", "Dean's List", "Top 20 McKinsey"].map((h) => (
                  <span key={h} className="font-mono text-xs text-accent/80 border border-accent/20 bg-accent-light px-2 py-0.5 rounded-full">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Early career programs */}
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">
                Selected Early Career Programs
              </p>
              <div className="flex flex-wrap gap-2">
                {["BCG Launch", "McKinsey Forward", "Forte Career Ready", "JPMorgan Spring Insights", "Morgan Stanley Early Insights"].map((p) => (
                  <span key={p} className="font-mono text-xs text-surface/70 border border-border px-2 py-1 rounded">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
