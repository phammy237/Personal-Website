"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STROKES: { d: string; dur: number; delay: number }[] = [
  // 1 — long underline sweeping left
  { d: "M 5,188 L 185,188", dur: 0.18, delay: 0 },
  // 2 — tall opening upstroke + arch loop
  { d: "M 185,188 C 182,160 180,118 184,84 C 186,62 196,46 210,44 C 226,42 238,58 234,82 C 230,100 216,114 210,128 C 203,144 202,162 208,172 C 214,180 228,178 238,168 C 248,158 248,140 240,128", dur: 0.55, delay: 0.16 },
  // 3 — first cursive loop
  { d: "M 240,128 C 248,136 258,148 264,162 C 270,176 267,188 276,190 C 286,192 296,180 295,163 C 294,146 284,132 274,124", dur: 0.28, delay: 0.69 },
  // 4 — second cursive loop
  { d: "M 274,124 C 284,132 298,145 306,160 C 314,175 311,190 322,192 C 333,193 344,180 342,162 C 340,144 329,130 318,122", dur: 0.28, delay: 0.95 },
  // 5 — third cursive loop
  { d: "M 318,122 C 330,130 346,146 354,164 C 362,182 358,196 370,196 C 382,196 392,180 389,160 C 386,140 374,126 362,118", dur: 0.28, delay: 1.21 },
  // 6 — fourth loop
  { d: "M 362,118 C 374,128 392,148 398,168 C 404,186 400,196 410,196 C 420,196 428,182 426,164 C 424,146 414,134 404,126", dur: 0.24, delay: 1.47 },
  // 7 — fifth loop into diagonal
  { d: "M 404,126 C 416,136 434,154 440,172 C 446,188 442,198 452,198 C 462,198 468,184 466,166 C 464,150 454,138 445,132", dur: 0.22, delay: 1.69 },
  // 8 — final ascending tick
  { d: "M 445,132 C 464,148 492,162 518,148 L 572,90", dur: 0.28, delay: 1.89 },
];

const TOTAL_MS = (1.89 + 0.28 + 0.8) * 1000;

export function SignatureIntro() {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    try { sessionStorage.setItem("intro-seen", "1"); } catch {}
    setVisible(false);
  }, []);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("intro-seen");
      if (!seen) setVisible(true);
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(dismiss, TOTAL_MS);
    return () => clearTimeout(t);
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "#050818" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 590 210"
            width="500"
            className="w-[min(500px,82vw)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            overflow="visible"
          >
            <defs>
              <filter id="sig-glow" x="-30%" y="-60%" width="160%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {STROKES.map((s, i) => (
              <g key={i}>
                {/* glow */}
                <motion.path
                  d={s.d}
                  stroke="#a78bfa"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.18}
                  filter="url(#sig-glow)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: s.dur, delay: s.delay, ease: "easeOut" }}
                />
                {/* stroke */}
                <motion.path
                  d={s.d}
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: s.dur, delay: s.delay, ease: "easeOut" }}
                />
              </g>
            ))}
          </svg>

          <motion.button
            onClick={dismiss}
            className="absolute bottom-10 font-mono text-xs text-white/25 hover:text-white/60 transition-colors tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
