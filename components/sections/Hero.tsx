"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SocialLinks } from "@/components/ui/SocialLinks";

function PlaneIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 16 22 8l-20-1 7 5-7 4Z" />
      <path d="m9 12 2 7 3-9" />
    </svg>
  );
}

const ticketChips = [
  { eyebrow: "Arrival", title: "Data Science",     meta: "MP 2026" },
  { eyebrow: "Arrival", title: "Product Strategy", meta: "MP 2026" },
  { eyebrow: "Arrival", title: "Operations",       meta: "MP 2026" },
  { eyebrow: "Arrival", title: "AI / ML",          meta: "MP 2026" },
  { eyebrow: "Arrival", title: "Research",         meta: "MP 2026" },
];

const destinations = [
  {
    num: "01",
    title: "Work Library",
    desc: "Projects in data, product, and operations. Case studies, code, and impact.",
    href: "/projects",
    image: "/projects/wandr.png",
  },
  {
    num: "02",
    title: "Biography",
    desc: "My story, values, and the journey that shapes my work.",
    href: "/biography",
    image: "/headshot.jpg",
  },
  {
    num: "03",
    title: "Involvements",
    desc: "Leadership, communities, initiatives, and causes I care about.",
    href: "/involvements",
    image: "/projects/kite.png",
  },
];

function SideRail() {
  return (
    <motion.aside
      className="absolute left-0 top-0 hidden h-full w-[72px] border-r border-white/10 lg:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex h-full flex-col items-center justify-between pb-10 pt-28">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
          <div>MP</div>
          <div className="mt-2">00</div>
        </div>
        <div className="flex flex-1 flex-col items-center gap-5 py-8">
          <div className="h-52 w-px bg-gradient-to-b from-accent via-accent/70 to-transparent" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-white/35" />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/35">Scroll</span>
          <div className="h-6 w-px bg-accent" />
        </div>
      </div>
    </motion.aside>
  );
}

function BoardingPass() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[18px] border border-accent/35 bg-[#101020]/85 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-md"
      initial={{ opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.38, duration: 0.65, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(139,92,246,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-4 w-4 place-items-center rounded-full border border-white/20 text-[10px] text-white/35">G</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/55">Boarding Pass</span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">MP-2026</span>
      </div>

      {/* HAN → GNV */}
      <div className="relative px-5 py-5">
        <div className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">From</p>
            <p className="mt-1.5 font-display text-4xl leading-none text-white sm:text-5xl">HAN</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Hanoi</p>
          </div>
          <div className="pb-6 text-accent">
            <div className="flex items-center justify-center gap-2">
              <span className="h-px flex-1 border-t border-dashed border-accent/70" />
              <PlaneIcon />
              <span className="h-px flex-1 border-t border-dashed border-accent/70" />
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">To</p>
            <p className="mt-1.5 font-display text-4xl leading-none text-white sm:text-5xl">GNV</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Gainesville</p>
          </div>
        </div>
      </div>

      {/* Gate / Status / Seat */}
      <div className="relative border-y border-dashed border-white/16 px-5 py-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Gate</p>
            <div className="mt-2.5 flex justify-between">
              {[["P","Product"],["D","Data"],["O","Ops"]].map(([letter, word]) => (
                <div key={letter} className="flex flex-col items-center gap-1">
                  <span className="font-display text-xl text-white">{letter}</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/35">{word}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Status</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              In Progress
            </p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Seat</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">Builder</p>
          </div>
        </div>
      </div>

      {/* Passenger info + barcode */}
      <div className="relative grid grid-cols-[1fr_auto] gap-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Passenger</p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/75">My Pham</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Class</p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/75">First Class</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Role</p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/75">Builder · Problem Solver</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Term</p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/75">2026</p>
          </div>
        </div>
        <div className="hidden h-12 w-16 items-end gap-[2px] opacity-40 sm:flex">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="flex-1 bg-white" style={{ height: `${20 + ((i * 19) % 28)}px` }} />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="relative flex items-end justify-between border-t border-dashed border-accent/35 px-5 py-3">
        <p className="max-w-[260px] font-display text-sm italic leading-snug text-white/55">
          I turn ambiguity into product, strategy, and data-driven solutions.
        </p>
        <div className="grid h-12 w-12 place-items-center rounded-full border border-accent/50 text-center font-mono text-[7px] uppercase leading-tight tracking-[0.14em] text-accent/75">
          Building<br />Impact
        </div>
      </div>
    </motion.div>
  );
}

function TicketChips() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5 }}
    >
      {ticketChips.map((ticket) => (
        <div
          key={ticket.title}
          className="relative min-h-[76px] rounded-lg border border-accent/35 bg-[#0b1020]/70 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur"
        >
          <div className="absolute inset-x-2 top-1 border-t border-dashed border-white/15" />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">{ticket.eyebrow}</p>
          <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.08em] text-accent">{ticket.title}</p>
          <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
            <span>{ticket.meta}</span>
            <span>+</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function DestinationCards() {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-3"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.88, duration: 0.55 }}
    >
      {destinations.map((destination) => (
        <Link
          key={destination.num}
          href={destination.href}
          className="group relative min-h-[180px] overflow-hidden rounded-lg border border-white/14 bg-white/[0.03]"
        >
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center opacity-55 transition duration-500 group-hover:scale-100 group-hover:opacity-70"
            style={{ backgroundImage: `url(${destination.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060914] via-[#060914]/80 to-[#060914]/25" />
          <div className="relative flex h-full flex-col justify-between p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
              Gate <span className="block pt-1 font-display text-3xl tracking-normal text-white">{destination.num}</span>
            </p>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-display text-3xl text-white md:text-4xl">{destination.title}</h3>
                <p className="mt-3 max-w-[280px] font-mono text-[12px] leading-relaxed text-white/68">{destination.desc}</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/80 text-lg text-white transition group-hover:border-accent group-hover:text-accent">
                &rarr;
              </span>
            </div>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-[#030813] text-white">
      <SideRail />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/headshot.jpg')] bg-cover bg-[center_28%] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_42%,rgba(139,92,246,0.2),transparent_28%),linear-gradient(90deg,#030813_0%,rgba(3,8,19,0.9)_36%,rgba(3,8,19,0.72)_58%,#030813_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#030813] via-[#030813]/88 to-transparent" />
        <div className="absolute left-[12%] top-[50%] hidden h-px w-[44%] bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />
        <div className="absolute left-[16%] top-[48%] hidden h-24 w-[64%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.14),transparent_60%)] blur-xl lg:block" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 pb-6 pt-24 sm:px-6 lg:px-20 xl:px-24">
        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1.3fr_1fr] xl:gap-10">
          <div className="pt-4">
            <motion.div
              className="mb-7 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-accent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_rgba(139,92,246,0.95)]" />
              Flight MP-2026
            </motion.div>

            <motion.h1
              className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.82] tracking-normal text-white"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
            >
              MY PHAM
            </motion.h1>

            <motion.p
              className="mt-4 font-display text-[clamp(1.3rem,2.4vw,2.6rem)] leading-none text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.55 }}
            >
              Now Boarding: <span className="text-accent">My Pham</span>
            </motion.p>

            <motion.p
              className="mt-5 max-w-2xl font-mono text-sm leading-7 tracking-[0.03em] text-white/62 sm:text-base"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.5 }}
            >
              Data Science student building across product, operations, and decision systems.
            </motion.p>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.5 }}
            >
              <Link
                href="#about"
                className="group inline-flex w-fit items-center border border-accent/55 bg-[#0c0c1f]/70 text-accent transition hover:border-accent hover:bg-accent hover:text-white"
              >
                <span className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em]">Explore My Journey</span>
                <span className="border-l border-current/35 px-4 py-2.5 text-base leading-none">&rarr;</span>
              </Link>
            </motion.div>

            <div className="mt-10">
              <TicketChips />
            </div>
          </div>

          <div className="hidden lg:block">
            <BoardingPass />
          </div>
        </div>

        <div className="mt-8 lg:mt-5">
          <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/72">
            <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_rgba(139,92,246,0.85)]" />
            Destinations
          </div>
          <DestinationCards />
        </div>
      </div>
    </section>
  );
}
