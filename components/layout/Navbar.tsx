"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeProvider";

const navLinks = [
  ["About", "/#about"],
  ["Work", "/projects"],
  ["Involvements", "/involvements"],
  ["Biography", "/biography"],
  ["CV", "/cv"],
] as [string, string][];

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { theme, toggle } = useTheme();

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

  const isDark = (isHome && !scrolled) || pathname === "/projects" || pathname === "/involvements" || pathname === "/case-studies" || pathname === "/biography";

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 px-[5vw] py-4 flex items-center justify-between transition-all duration-300 ${
        scrolled && isHome
          ? "bg-white/90 dark:bg-navy/90 backdrop-blur-sm border-b border-border dark:border-white/10 shadow-sm"
          : isDark
          ? "bg-transparent"
          : "bg-white/90 dark:bg-[#0A0C1E]/90 backdrop-blur-sm border-b border-border dark:border-white/10 shadow-sm"
      }`}
      animate={{ y: visible ? 0 : -80 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
      <Link href="/" className={`font-mono text-sm font-medium tracking-wider transition-colors duration-300 ${isDark && !scrolled ? "text-white" : "text-surface dark:text-white"}`}>
        MY PHAM
      </Link>
      <nav className="flex items-center gap-6">
        {navLinks.map(([label, href]) => {
          const isActive = pathname === href || (href !== "/" && href !== "/#about" && pathname.startsWith(href));
          const dark = isDark && !scrolled;
          return (
            <Link key={label} href={href}
              className={`font-mono text-xs tracking-wider uppercase transition-colors duration-200 hidden md:block ${
                isActive ? "text-accent" : dark ? "text-white/70 hover:text-white" : "text-muted dark:text-white/50 hover:text-surface dark:hover:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 ${
            isDark && !scrolled ? "text-white/50 hover:text-white" : "text-muted hover:text-surface"
          }`}
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          )}
        </button>
        <Link href="/connect"
          className={`font-mono text-xs border px-3 py-1.5 transition-colors duration-200 ${
            isDark && !scrolled
              ? "border-white/30 text-white hover:bg-white hover:text-navy"
              : "border-accent/40 text-accent hover:bg-accent hover:text-white"
          }`}
        >
          Connect
        </Link>
      </nav>
    </motion.header>
  );
}
