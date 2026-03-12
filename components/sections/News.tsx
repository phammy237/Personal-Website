"use client";
import { motion } from "framer-motion";

const newsItems = [
  {
    source: "UX Collective",
    title:
      "Why the best product designers think like systems architects",
    date: "Feb 2024",
    href: "#",
  },
  {
    source: "Sidebar.io",
    title:
      "Design token architecture at scale: lessons from a year at Linear",
    date: "Nov 2023",
    href: "#",
  },
  {
    source: "The Diff",
    title:
      "Interview: Building Meridian — data visualization for humans",
    date: "Aug 2023",
    href: "#",
  },
  {
    source: "Dribbble",
    title: "Luna Mobile App — Featured Shot of the Week",
    date: "Jun 2023",
    href: "#",
  },
];

export function News() {
  return (
    <section id="news" className="bg-base px-[5vw] py-24">
      <div className="max-w-[1200px] mx-auto">
        <motion.h2
          className="font-mono text-sm text-surface/40 mb-12 tracking-widest uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          News &amp; Writing
        </motion.h2>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible snap-x snap-mandatory">
          {newsItems.map((item, i) => (
            <motion.a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-72 md:w-auto snap-start group border-t-2 border-accent/40 pt-4 hover:border-accent transition-colors duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="font-mono text-xs text-surface/40 block mb-2">
                {item.source}
              </span>
              <p className="font-body text-surface/80 group-hover:text-surface transition-colors duration-200 leading-snug">
                {item.title}
              </p>
              <span className="font-mono text-xs text-surface/30 mt-3 block">
                {item.date}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
