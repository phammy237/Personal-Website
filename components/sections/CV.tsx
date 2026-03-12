"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export function CV() {
  return (
    <section id="cv" className="bg-base px-[5vw] py-24">
      <div className="max-w-[720px] mx-auto text-center">
        <motion.h2
          className="font-display text-4xl text-surface mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Curriculum Vitae
        </motion.h2>
        <motion.p
          className="font-body text-muted mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          View my full work history, education, and skills.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/cv"
            className="font-mono text-sm text-accent border border-accent/30 px-6 py-3 hover:bg-accent hover:text-white transition-colors duration-200 inline-block"
          >
            View Full CV →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
