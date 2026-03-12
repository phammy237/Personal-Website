"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { projects } from "@/data/projects";
import type { Project } from "@/data/projects";

const categories = ["All", "AI/ML", "Data & Analytics", "Product/UX", "Engineering"] as const;

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120, damping: 20 }}
      className="masonry-item group"
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300">
          {/* Gradient header bar */}
          <div className="h-2 w-full" style={{ background: project.gradient }} />

          <div className="p-5">
            {/* Category + Year */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="font-mono text-xs px-2.5 py-1 rounded-full text-white"
                style={{ background: project.gradient }}
              >
                {project.category}
              </span>
              <span className="font-mono text-xs text-muted">{project.month}</span>
            </div>

            {/* Title */}
            <h3 className="font-display text-xl text-surface mb-2 group-hover:text-accent transition-colors duration-200">
              {project.title}
            </h3>

            {/* Logline */}
            <p className="font-body text-sm text-muted leading-relaxed mb-4">
              {project.logline}
            </p>

            {/* Bullets */}
            <ul className="space-y-1.5 mb-4">
              {project.bullets.slice(0, 2).map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent mt-1 flex-shrink-0 text-xs">▸</span>
                  <span className="font-body text-xs text-muted leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Tools */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tools.slice(0, 4).map((tool) => (
                <span
                  key={tool}
                  className="font-mono text-xs text-muted border border-border px-2 py-0.5 rounded"
                >
                  {tool}
                </span>
              ))}
              {project.tools.length > 4 && (
                <span className="font-mono text-xs text-muted/50">+{project.tools.length - 4}</span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 pt-3 border-t border-border" onClick={(e) => e.preventDefault()}>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  GitHub ↗
                </a>
              )}
              {project.devpost && (
                <a
                  href={project.devpost}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#003E54] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Devpost ↗
                </a>
              )}
              {project.slides && (
                <a
                  href={project.slides}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#3B82F6] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Slides ↗
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#3B82F6] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live ↗
                </a>
              )}
              {project.outcome && (
                <span className="font-mono text-xs text-accent/70 ml-auto">
                  🏆 {project.outcome}
                </span>
              )}
              <span className="ml-auto font-mono text-xs text-muted group-hover:text-accent transition-colors">
                Details →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

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
          Portfolio
        </motion.p>
        <motion.h1
          className="font-display text-5xl md:text-7xl text-surface mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Projects
        </motion.h1>
        <motion.p
          className="font-body text-lg text-muted max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {projects.length} projects across AI/ML, data analytics, product design, and engineering.
        </motion.p>
      </div>

      {/* Category filters */}
      <div className="px-[5vw] pb-8 max-w-[1400px] mx-auto">
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-accent text-white border-accent"
                  : "bg-card text-muted border-border hover:border-accent/50 hover:text-surface"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 opacity-60">
                  ({projects.filter((p) => p.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Masonry grid */}
      <div className="px-[5vw] pb-24 max-w-[1400px] mx-auto">
        <div className="masonry-grid">
          {filtered.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="font-mono text-sm text-muted text-center py-20">
            No projects in this category.
          </p>
        )}
      </div>

      <Footer />
    </main>
  );
}
