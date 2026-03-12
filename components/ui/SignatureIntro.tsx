"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "#050818" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          {/* Drop your signature.mp4 into /public */}
          <video
            src="/signature.mp4"
            autoPlay
            muted
            playsInline
            onEnded={dismiss}
            className="w-[min(420px,80vw)]"
          />
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
