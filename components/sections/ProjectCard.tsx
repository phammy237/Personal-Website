"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import type { Project } from "@/data/projects";

const gradients: Record<string, string> = {
  flow: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  meridian: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  luna: "linear-gradient(135deg, #1a0533 0%, #2d0b5a 50%, #11001c 100%)",
};

export function ProjectCard({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    <motion.div
      className="project-section"
      style={{ background: gradients[project.slug] ?? "#1a1a2e" }}
      initial={{ opacity: 0.6 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Progress dots */}
      <div className="absolute right-[3vw] top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "bg-accent scale-150" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="absolute bottom-12 left-[5vw] right-[5vw] z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 25 }}
        >
          <span className="font-mono text-sm text-white/50">
            {String(index + 1).padStart(2, "0")} / {project.category} ·{" "}
            {project.year}
          </span>
          <h2 className="font-display text-5xl md:text-7xl text-white mt-2 leading-none">
            {project.title}
          </h2>
          <p className="mt-3 text-white/60 max-w-lg font-body text-lg">
            {project.logline}
          </p>
          <Link href={`/projects/${project.slug}`}>
            <MagneticButton className="mt-6">View Project →</MagneticButton>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}