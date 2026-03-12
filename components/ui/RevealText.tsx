"use client";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function RevealText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: i * 0.06,
            type: "spring",
            stiffness: 150,
            damping: 25,
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
