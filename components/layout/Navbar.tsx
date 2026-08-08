"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeProvider";

const navLinks = [
  ["About", "/#about"],
  ["Biography", "/biography"],
  ["Work", "/projects"],
  ["Involvements", "/involvements"],
  ["CV", "/cv"],
] as [string, string][];

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const isDark = isHome && !scrolled;
  const solidBg = scrolled && isHome;
  const lightText = isDark && !solidBg;

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
          solidBg
            ? "bg-white/90 dark:bg-navy/90 backdrop-blur-sm border-b border-border dark:border-white/10 shadow-sm"
            : isDark
            ? "bg-transparent"
            : "bg-white/90 dark:bg-navy/90 backdrop-blur-sm border-b border-border dark:border-white/10 shadow-sm"
        }`}
        animate={{ y: visible ? 0 : -80 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
      <Link href="/" className="absolute left-4 top-1/2 hidden -translate-y-1/2 md:block" aria-label="My Pham home">
        <span
          className={`block h-10 w-10 bg-current transition-colors duration-300 ${lightText ? "text-white" : "text-surface dark:text-white"}`}
          style={{
            WebkitMaskImage: "url(/logo.png)",
            maskImage: "url(/logo.png)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </Link>
      <div className="mx-auto flex max-w-[1680px] items-center justify-between px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 md:hidden ${
              lightText ? "text-white/70 hover:text-white" : "text-muted hover:text-surface"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
          <Link href="/" className={`font-mono text-sm font-medium tracking-wider transition-colors duration-300 ${lightText ? "text-white" : "text-surface dark:text-white"}`}>
            MY PHAM
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          {navLinks.map(([label, href]) => {
            const isActive = pathname === href || (href !== "/" && href !== "/#about" && pathname.startsWith(href));
            return (
              <Link key={label} href={href}
                className={`font-mono text-xs tracking-wider uppercase transition-colors duration-200 hidden md:block ${
                  isActive ? "text-accent" : lightText ? "text-white/70 hover:text-white" : "text-surface/80 dark:text-white/50 hover:text-surface dark:hover:text-white"
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
              lightText ? "text-white/50 hover:text-white" : "text-muted hover:text-surface"
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
              lightText
                ? "border-white/30 text-white hover:bg-white hover:text-navy"
                : "border-accent/40 text-accent hover:bg-accent hover:text-white"
            }`}
          >
            Connect
          </Link>
        </nav>
      </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-navy border-b border-border dark:border-white/10 shadow-xl md:hidden"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <nav className="flex flex-col px-[5vw] py-4">
                {navLinks.map(([label, href]) => {
                  const isActive = pathname === href || (href !== "/" && href !== "/#about" && pathname.startsWith(href));
                  return (
                    <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                      className={`font-mono text-sm tracking-wider uppercase py-3 border-b border-border dark:border-white/10 last:border-b-0 transition-colors duration-200 ${
                        isActive ? "text-accent" : "text-surface/80 dark:text-white/60 hover:text-surface dark:hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
                <Link href="/connect" onClick={() => setMobileOpen(false)}
                  className="font-mono text-sm tracking-wider uppercase py-3 text-accent"
                >
                  Connect
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
