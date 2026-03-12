"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  ["About", "/#about"],
  ["Projects", "/projects"],
  ["Case Studies", "/case-studies"],
  ["Involvements", "/involvements"],
  ["CV", "/cv"],
] as [string, string][];

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastY || y < 50);
      setScrolled(y > 50);
      setLastY(y);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  const isDark = isHome && !scrolled;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 px-[5vw] py-4 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-sm border-b border-border shadow-sm"
          : isHome
          ? "bg-transparent"
          : "bg-white/90 backdrop-blur-sm border-b border-border shadow-sm"
      }`}
      animate={{ y: visible ? 0 : -80 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
      <Link
        href="/"
        className={`font-mono text-sm font-medium tracking-wider transition-colors duration-300 ${
          isDark ? "text-white" : "text-surface"
        }`}
      >
        MY PHAM
      </Link>
      <nav className="flex items-center gap-6">
        {navLinks.map(([label, href]) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              className={`font-mono text-xs tracking-wider uppercase transition-colors duration-200 hidden md:block ${
                isActive
                  ? "text-accent"
                  : isDark
                  ? "text-white/70 hover:text-white"
                  : "text-muted hover:text-surface"
              }`}
            >
              {label}
            </Link>
          );
        })}
        <a
          href="mailto:phamlehamy2307@gmail.com"
          className={`font-mono text-xs border px-3 py-1.5 transition-colors duration-200 ${
            isDark
              ? "border-white/30 text-white hover:bg-white hover:text-navy"
              : "border-accent/40 text-accent hover:bg-accent hover:text-white"
          }`}
        >
          Contact
        </a>
      </nav>
    </motion.header>
  );
}
