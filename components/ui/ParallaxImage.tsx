"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function ParallaxImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [-60, 60]
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }} className="absolute inset-[-60px]">
        <Image src={src} alt={alt} fill className="object-cover" />
      </motion.div>
    </div>
  );
}
