"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  Place your signature image at: public/signature.jpg
  Dark strokes on white paper → CSS invert() → white strokes on dark bg.
  clip-path reveal sweeps left-to-right like a pen writing.
*/

const DRAW_DURATION = 2.2;
const HOLD_MS = 800;

export function SignatureIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("intro-seen");
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("intro-seen", "1");
    setShow(false);
  };

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(dismiss, (DRAW_DURATION + HOLD_MS / 1000) * 1000);
    return () => clearTimeout(t);
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "#050818" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeInOut" }}
        >
          <div className="relative w-[min(480px,80vw)]">

            {/* Signature image — revealed left-to-right */}
            <motion.div
              style={{ clipPath: "inset(0 100% 0 0 round 2px)" }}
              animate={{ clipPath: "inset(0 0% 0 0 round 2px)" }}
              transition={{ duration: DRAW_DURATION, ease: [0.2, 0.6, 0.35, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/signature.jpg"
                alt="My Pham"
                className="w-full h-auto"
                style={{ filter: "invert(1) brightness(1.15)" }}
              />
            </motion.div>

            {/* Pen-tip glow that tracks the reveal edge */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(167,139,250,0.9) 0%, transparent 70%)",
                boxShadow: "0 0 12px 4px rgba(139,92,246,0.5)",
                left: "0%",
              }}
              animate={{ left: "100%" }}
              transition={{ duration: DRAW_DURATION, ease: [0.2, 0.6, 0.35, 1] }}
            />
          </div>

          <button
            onClick={dismiss}
            className="absolute bottom-10 font-mono text-xs text-white/25 hover:text-white/60 transition-colors duration-200 tracking-widest uppercase"
          >
            skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
