"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { experience } from "@/data/cv";

const TAGS: string[][] = [
  ["Product Strategy", "GTM", "KPI Design"],
  ["ESG", "Data Governance", "Dashboards"],
  ["Digital Transformation", "ROI Modeling"],
  ["Sustainability", "Battery Lifecycle", "Python"],
  ["Qualitative Coding", "Research Design"],
];

const experiences = experience.map((exp, i) => ({
  role: exp.role,
  company: exp.company.split(" (")[0],
  period: exp.period,
  tags: TAGS[i] ?? [],
  accent: i === 0,
}));

export function ExperiencePreview() {
  return (
    <section id="experience" className="bg-base px-[5vw] py-24">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] text-white/30 tracking-[0.25em] uppercase mb-2">
              Experience
            </p>
            <h2 className="font-display text-4xl text-white">Where I&apos;ve Worked</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/cv"
              className="font-mono text-xs text-accent hover:text-accent/70 transition-colors duration-200 tracking-widest uppercase"
            >
              Full CV →
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-col divide-y divide-white/[0.07]">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              className="group py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <span className="font-mono text-[10px] text-white/20 tracking-widest flex-shrink-0 w-6">
                0{i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <p className={`font-body font-medium text-base ${exp.accent ? "text-white" : "text-white/75"} group-hover:text-white transition-colors duration-200`}>
                  {exp.role}
                </p>
                <p className="font-mono text-xs text-white/35 mt-0.5">{exp.company}</p>
              </div>

              <div className="hidden md:flex flex-wrap gap-1.5 flex-shrink-0 max-w-xs">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] text-white/30 border border-white/10 rounded px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="font-mono text-[10px] text-white/25 flex-shrink-0 text-right min-w-[140px]">
                {exp.period}
              </p>

              {exp.accent && (
                <div className="flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
