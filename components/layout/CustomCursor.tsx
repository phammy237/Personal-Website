"use client";
import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef<number>();

  useEffect(() => {
    // Only on fine pointer devices (mouse/trackpad)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);

    const animate = () => {
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      // Ring lags behind with lerp
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        const size = hovered ? 44 : 28;
        ringRef.current.style.transform = `translate(${ring.current.x - size / 2}px, ${ring.current.y - size / 2}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(animate);

    const addHoverListeners = () => {
      document.querySelectorAll("a, button, [data-cursor-hover]").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      observer.disconnect();
    };
  }, [hovered, visible]);

  if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none w-2 h-2 rounded-full bg-accent"
        style={{ opacity: visible ? (hovered ? 0 : 1) : 0, willChange: "transform" }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border-2 border-accent transition-[width,height] duration-150 ${hovered ? "w-11 h-11 opacity-70" : "w-7 h-7 opacity-40"}`}
        style={{ opacity: visible ? (hovered ? 0.7 : 0.4) : 0, willChange: "transform" }}
      />
    </>
  );
}
