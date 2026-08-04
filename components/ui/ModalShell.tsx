"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";

export function ModalShell({
  onClose,
  maxWidth = "max-w-3xl",
  panelClassName = "bg-[#0D0F1A] border border-white/10",
  closeButtonClassName = "bg-black/50 text-white/70 hover:text-white hover:bg-black/70",
  children,
}: {
  onClose: () => void;
  maxWidth?: string;
  panelClassName?: string;
  closeButtonClassName?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl ${panelClassName}`}
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
      >
        <button onClick={onClose} aria-label="Close" className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-20 ${closeButtonClassName}`}>✕</button>
        {children}
      </motion.div>
    </motion.div>
  );
}
