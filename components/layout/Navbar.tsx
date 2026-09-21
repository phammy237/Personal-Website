"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeProvider";

const navLinks = [
  ["About", "/#about"],
  ["Biography", "/biography/journey"],
  ["Work", "/projects"],
  ["Involvements", "/involvements"],
  ["CV", "/cv"],
] as [string, string][];

// Single shared focus ring for every clickable nav element (links, toggle, Connect) — one canonical
// treatment site-wide instead of a page-scoped CSS rule that only existed on the journey page.
const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-[#b79ce9]";

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

  // The journey page's scroll-driven camera stays legible only if the nav never slides away
  // mid-scroll — a behavior call, not a style one, so it's kept as the one exemption here.
  const isJourneyPage = pathname === "/biography/journey";

  // One canonical navbar surface everywhere. The single remaining exception is the homepage's own
  // hero: while unscrolled it sits transparent over the full-bleed hero image with forced light
  // text, then becomes the same solid surface as every other page the moment you scroll past it.
  const solidBg = !isHome || scrolled;
  const lightText = isHome && !scrolled;

  const navTextClass = (isActive: boolean) =>
    isActive
      ? lightText
        ? "text-white"
        : "text-[#7C6AF2] dark:text-[#A58AFF]"
      : lightText
      ? "text-white/70 hover:text-white"
      : "text-[rgba(29,35,64,0.55)] hover:text-[rgba(29,35,64,0.85)] dark:text-[rgba(244,241,248,0.55)] dark:hover:text-[rgba(244,241,248,0.85)]";

  const iconTextClass = lightText
    ? "text-white/70 hover:text-white"
    : "text-[rgba(29,35,64,0.55)] hover:text-[rgba(29,35,64,0.85)] dark:text-[rgba(244,241,248,0.55)] dark:hover:text-[rgba(244,241,248,0.85)]";

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solidBg
            ? "border-b border-[rgba(50,58,90,0.10)] bg-[rgba(246,244,250,0.94)] backdrop-blur-md dark:border-[rgba(180,172,215,0.10)] dark:bg-[rgba(10,15,34,0.94)]"
            : "border-b border-transparent bg-transparent"
        }`}
        animate={{ y: visible || isJourneyPage ? 0 : -80 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between px-4 md:px-6 xl:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 md:hidden ${iconTextClass} ${FOCUS_RING}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
            <Link href="/" aria-label="My Pham home" className={`flex items-center gap-5 transition-colors duration-300 ${FOCUS_RING}`}>
              <span
                className={`hidden h-7 w-7 bg-current transition-colors duration-300 md:block ${lightText ? "text-white" : "text-surface dark:text-white"}`}
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
              <span className={`font-mono text-sm font-medium tracking-wider transition-colors duration-300 ${lightText ? "text-white" : "text-surface dark:text-white"}`}>
                MY PHAM
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <nav className="flex items-center gap-[26px]">
              {navLinks.map(([label, href]) => {
                const isActive = pathname === href || (href !== "/" && href !== "/#about" && pathname.startsWith(href));
                return (
                  <Link
                    key={label}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative font-mono text-[13px] font-medium uppercase leading-none tracking-[0.12em] transition-colors duration-200 ${navTextClass(isActive)} ${FOCUS_RING}`}
                  >
                    {label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute left-1/2 top-full mt-[5px] h-px w-[78%] -translate-x-1/2 ${
                          lightText
                            ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.25)]"
                            : "bg-[#7C6AF2] shadow-[0_0_6px_rgba(145,120,220,0.20)] dark:bg-[#A58AFF]"
                        }`}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-[18px]">
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${iconTextClass} ${FOCUS_RING}`}
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

              <Link
                href="/connect"
                className={`flex h-10 items-center rounded-[10px] border px-5 font-mono text-[13px] font-medium uppercase leading-none tracking-[0.12em] transition-colors duration-200 ${
                  lightText
                    ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                    : "border-[rgba(50,58,90,0.28)] text-[#1D2340] hover:border-[rgba(124,106,242,0.55)] hover:bg-[rgba(124,106,242,0.05)] dark:border-[rgba(180,172,215,0.30)] dark:text-[rgba(244,241,248,0.92)] dark:hover:border-[rgba(165,138,255,0.60)] dark:hover:bg-[rgba(165,138,255,0.06)]"
                } ${FOCUS_RING}`}
              >
                Connect
              </Link>
            </div>
          </div>
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
                        isActive ? "text-[#7C6AF2] dark:text-[#A58AFF]" : "text-surface/80 dark:text-white/60 hover:text-surface dark:hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
                <Link href="/connect" onClick={() => setMobileOpen(false)}
                  className="font-mono text-sm tracking-wider uppercase py-3 text-[#7C6AF2] dark:text-[#A58AFF]"
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
