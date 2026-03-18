"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STROKES: { d: string; dur: number; delay: number }[] = [
  // 1 — P: long entry line right → curve back up into tall slightly-rounded arch → down → exits mid-height into h
  { d: "M 52,162 C 92,160 140,160 164,162 C 162,130 160,76 166,46 C 170,22 182,12 196,12 C 211,12 220,30 215,56 C 211,78 200,96 196,115 C 192,129 194,148 202,160 C 209,170 223,171 233,159 C 243,147 241,123 232,108", dur: 0.58, delay: 0 },
  // 2 — h: upstroke (~y=70), arch over, down, foot connecting to m
  { d: "M 232,108 C 230,96 228,82 232,70 C 236,58 246,52 256,56 C 266,60 270,74 266,88 C 262,100 254,112 250,124 C 246,134 247,150 254,160 C 261,168 272,168 278,156 C 284,144 282,124 274,110", dur: 0.22, delay: 0.56 },
  // 3 — m: two humps same height as h
  { d: "M 274,110 C 272,98 270,84 274,72 C 278,60 288,54 298,58 C 308,62 312,76 308,90 C 304,102 296,112 292,124 C 288,134 289,150 296,160 C 303,170 314,170 320,158 C 326,146 324,126 316,112 C 314,100 312,86 316,74 C 320,62 330,56 340,60 C 350,64 353,78 349,92 C 345,104 337,114 333,126", dur: 0.40, delay: 0.76 },
  // 4 — L: tall single arch (cursive L inspired, peaks ~y=22)
  { d: "M 333,126 C 331,102 330,70 334,48 C 338,26 350,14 364,14 C 378,14 386,32 382,56 C 378,76 368,94 364,112 C 360,126 362,146 370,158 C 378,168 392,168 400,156", dur: 0.34, delay: 1.14 },
  // 5 — e: small loop
  { d: "M 400,156 C 404,144 412,134 418,147 C 424,160 419,170 428,170 C 437,169 441,156 439,142 C 437,129 429,118 420,112", dur: 0.14, delay: 1.46 },
  // 6 — H: two tall arches, no crossbar (peaks ~y=22, same height as L)
  { d: "M 420,112 C 418,88 416,60 420,42 C 424,24 436,14 449,14 C 462,14 470,32 466,56 C 462,76 451,94 447,112 C 443,126 445,146 453,158 C 461,168 473,168 481,156 C 490,143 488,120 479,108 C 477,86 475,58 479,40 C 483,22 495,12 508,12 C 521,12 529,30 525,54 C 521,74 510,92 506,110 C 502,124 504,144 512,156 C 520,166 532,166 540,154", dur: 0.44, delay: 1.58 },
  // 7 — a: small oval, M: two tall humps (~y=42, clearly taller than h/m)
  { d: "M 540,154 C 544,143 552,130 556,144 C 560,157 555,167 564,168 C 573,167 577,153 575,139 C 573,126 565,116 558,110 C 566,118 576,136 580,152 C 584,166 580,175 588,175 C 597,174 602,160 600,146 C 598,133 590,122 582,116 C 590,123 600,141 604,156 C 608,169 604,178 613,178 C 623,177 627,163 625,149 C 623,136 615,125 607,119", dur: 0.42, delay: 2.00 },
  // 8 — y: small loop, slight dip below baseline, clean upward line
  { d: "M 607,119 C 615,131 623,148 627,162 C 631,175 626,183 635,183 C 645,181 648,167 645,153 C 642,141 634,131 626,126 C 634,131 643,134 649,124 L 668,84", dur: 0.26, delay: 2.40 },
];

const TOTAL_MS = (2.40 + 0.26 + 0.8) * 1000;

export function SignatureIntro() {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(dismiss, TOTAL_MS);
    return () => clearTimeout(t);
  }, [dismiss]);

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
            viewBox="0 0 690 200"
            width="580"
            className="w-[min(580px,90vw)]"
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
