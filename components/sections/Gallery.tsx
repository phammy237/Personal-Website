"use client";
import { motion } from "framer-motion";
import Image from "next/image";

// Add your photos to public/gallery/ and list them here
const photos: { src: string; caption: string }[] = [
  // { src: "/gallery/hackathon-1.jpg", caption: "SASE Hacks 2026" },
  // { src: "/gallery/campus-1.jpg", caption: "Campus life at UF" },
  // { src: "/gallery/conference-1.jpg", caption: "Product Space summit" },
];

export function Gallery() {
  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="bg-base py-24">
      <div className="px-[5vw] max-w-[1200px] mx-auto mb-12">
        <motion.h2
          className="font-mono text-sm text-surface/40 tracking-widest uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Moments
        </motion.h2>
      </div>

      <div className="flex gap-4 overflow-x-auto px-[5vw] pb-4 snap-x snap-mandatory">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            className="flex-shrink-0 w-72 h-80 rounded-2xl overflow-hidden relative snap-start group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <Image
              src={photo.src}
              alt={photo.caption}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-4 left-4 font-mono text-xs text-white/70">
              {photo.caption}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
