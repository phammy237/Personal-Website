"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";

const FEATURED_SLUGS = ["cartcoach", "kite", "wnba-simulator"];
const featured = FEATURED_SLUGS.map((s) => projects.find((p) => p.slug === s)).filter(Boolean) as typeof projects;

export function FeaturedProjects() {
  return (
    <section id="featured-projects" className="bg-base px-[5vw] py-24">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <motion.h2
            className="font-mono text-sm text-surface/40 tracking-widest uppercase"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Featured Work
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/projects"
              className="font-mono text-xs text-accent hover:text-accent/70 transition-colors duration-200 tracking-widest uppercase"
            >
              See All Work →
            </Link>
          </motion.div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible snap-x snap-mandatory">
          {featured.map((project, i) => (
            <motion.div
              key={project.slug}
              className="flex-shrink-0 w-[82vw] sm:w-80 md:w-auto snap-start rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{ background: project.gradient }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <Link href="/projects" className="block p-6 pt-32 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">
                    {project.category}
                  </span>
                  {project.award && (
                    <span className="font-mono text-[10px] bg-accent/20 text-accent border border-accent/30 rounded-full px-2 py-0.5">
                      {project.award}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl text-white mb-2 group-hover:text-accent transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="font-body text-sm text-white/60 leading-snug line-clamp-2">
                  {project.logline}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tools.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] text-white/40 border border-white/10 rounded px-1.5 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
