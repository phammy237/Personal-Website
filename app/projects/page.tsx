"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignatureIntro } from "@/components/ui/SignatureIntro";
import { allWork } from "@/data/projects";
import type { Project } from "@/data/projects";

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function DevpostIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.002 1.61L0 12.004 6.002 22.39h11.996L24 12.004 17.998 1.61zm1.593 4.084h4.811c3.173 0 5.765 2.592 5.765 5.765s-2.592 5.765-5.765 5.765H7.595zm2.427 2.427v6.677h2.384c1.849 0 3.338-1.489 3.338-3.338s-1.489-3.338-3.338-3.338z" />
    </svg>
  );
}

const ROTATE_MS = 6500;
const ALL_CATEGORIES = [
  "All", "Product/UX", "Data & Analytics", "Case Competition", "AI/ML", "Engineering", "Math & Modeling",
] as const;
type Cat = typeof ALL_CATEGORIES[number];

/* exclude hackathon-only entries — they're covered by their project counterpart */
const displayWork = allWork.filter((p) => p.category !== "Hackathon");

/* only prize winners rotate in hero */
const featuredWork = displayWork.filter((p) => p.prize);

function groupWork(filter: Cat) {
  const list = filter === "All" ? displayWork : displayWork.filter((p) => p.category === filter);
  if (filter !== "All") return [{ cat: filter as string, items: list }];
  const cats = ["Product/UX", "Data & Analytics", "Case Competition", "AI/ML", "Engineering", "Math & Modeling"];
  return cats.map((c) => ({ cat: c, items: list.filter((p) => p.category === c) })).filter((g) => g.items.length > 0);
}

type Tab = "overview" | "role" | "stack" | "media";

const AWARD_BADGE: Record<string, string> = {
  "Best Finance Project": "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  "3rd Place Overall": "bg-orange-500/20 text-orange-300 border-orange-500/40",
  "Top 20": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  "Outstanding Award": "bg-purple-500/20 text-purple-300 border-purple-500/40",
};

const MODAL_TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "role", label: "What I Did" },
  { key: "stack", label: "Stack" },
  { key: "media", label: "Media" },
];

/* ─── Modal ────────────────────────────────────────── */
function ProjectModal({ project, initialTab, onClose }: { project: Project; initialTab: Tab; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const hasMedia = !!(project.video || project.slides);
  const visibleTabs = MODAL_TABS.filter((t) => t.key !== "media" || hasMedia);

  const links = [
    project.github && { label: "GitHub", href: project.github },
    project.devpost && { label: "Devpost", href: project.devpost },
    project.slides && { label: "Slides", href: project.slides },
    project.liveUrl && { label: "Live Demo", href: project.liveUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-[#0D0F1A] border border-white/10"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
      >
        {/* Header */}
        <div className="relative h-52 md:h-60 flex items-end p-6 overflow-hidden" style={{ background: project.gradient }}>
          {project.image && <Image src={project.image} alt={project.title} fill className="object-cover opacity-30" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F1A] via-black/30 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10">✕</button>
          <div className="relative z-10 w-full">
            <span className="font-mono text-xs text-white/50 block mb-1">{project.competition ?? project.category} · {project.month}</span>
            <h2 className="font-display text-4xl md:text-5xl text-white leading-none mb-1">{project.title}</h2>
            {project.award && (
              <p className="font-mono text-xs text-yellow-400/70 mt-1.5">🏆 {project.award}</p>
            )}
            {links.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="font-mono text-xs px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-colors">{l.label} ↗</a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          {visibleTabs.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} className={`relative font-mono text-xs px-4 py-3 transition-colors ${tab === key ? "text-white" : "text-white/40 hover:text-white/70"}`}>
              {label}
              {tab === key && <motion.div layoutId="modal-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">The Problem</p>
                <p className="font-body text-white/70 leading-relaxed">{project.description}</p>
                {project.logline && (
                  <p className="font-body text-sm text-white/40 italic mt-3 leading-relaxed">{project.logline}</p>
                )}
              </motion.div>
            )}

            {tab === "role" && (
              <motion.div key="role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4">What I Did</p>
                <ul className="space-y-4">
                  {project.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-accent mt-1.5 flex-shrink-0 text-xs">▸</span>
                      <span className="font-body text-sm text-white/65 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {tab === "stack" && (
              <motion.div key="stack" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4">Tech Stack</p>
                {project.stack ? (
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    {project.stack.map((row, i) => (
                      <div key={i} className={`flex items-start gap-4 px-4 py-3 ${i !== 0 ? "border-t border-white/10" : ""}`}>
                        <span className="font-mono text-[11px] text-white/35 w-28 flex-shrink-0 pt-0.5 uppercase tracking-wide">{row.layer}</span>
                        <span className="font-body text-sm text-white/75 leading-snug">{row.tech}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((t) => (
                      <span key={t} className="font-mono text-xs text-white/70 border border-white/15 bg-white/5 px-3 py-1.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "media" && (
              <motion.div key="md" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
                {project.video && (
                  <div>
                    <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-3">Demo Video</p>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe src={project.video} title={`${project.title} demo`} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  </div>
                )}
                {project.slides && (
                  <div>
                    <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-3">Slides</p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black">
                      <iframe src={project.slides} className="absolute inset-0 w-full h-full" title={`${project.title} slides`} allowFullScreen />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Card ─────────────────────────────────────────── */
function WorkCard({ project, onSelect }: { project: Project; onSelect: (p: Project, t: Tab) => void }) {
  const [hovered, setHovered] = useState(false);
  const isComp = !!project.competition;
  const hasMedia = !!(project.video || project.slides);

  const extLinks = [
    project.github  && { key: "gh",      href: project.github,   label: "GitHub",   icon: "GH" },
    project.devpost && { key: "dp",       href: project.devpost,  label: "Devpost",  icon: "DP" },
    project.video   && { key: "yt",       href: project.video,    label: "Video",    icon: "▶" },
    project.slides  && { key: "slides",   href: project.slides,   label: "Slides",   icon: "⊞" },
    project.liveUrl && { key: "live",     href: project.liveUrl,  label: "Live",     icon: "↗" },
  ].filter(Boolean) as { key: string; href: string; label: string; icon: string }[];

  return (
    <motion.div className="relative flex-shrink-0 w-[220px] md:w-[260px]" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div
        className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={() => onSelect(project, hasMedia ? "media" : "overview")}
      >
        <div className="absolute inset-0" style={{ background: project.gradient }} />
        {project.image && <Image src={project.image} alt={project.title} fill className="object-cover opacity-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Center play/badge icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: hovered ? 1.15 : 1, opacity: hovered ? 1 : isComp ? 0.6 : 0.7 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-sm ${hovered && hasMedia ? "bg-white border-white" : "bg-white/20 border-white/60"}`}
          >
            {isComp && !hasMedia
              ? <span className="text-white text-xs">🏅</span>
              : <svg width="11" height="11" viewBox="0 0 12 12" fill={hovered && hasMedia ? "#080D24" : "white"}><polygon points="2,0 12,6 2,12" /></svg>
            }
          </motion.div>
        </div>

        {/* Top-right links + info on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute top-2 right-2 flex gap-1"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {extLinks.map((l) => (
                <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={l.label}
                  className="w-7 h-7 rounded-full bg-black/60 border border-white/25 flex items-center justify-center font-mono text-[10px] text-white/70 hover:text-white hover:bg-black/80 transition-colors">
                  {l.key === "gh" ? <GitHubIcon /> : l.key === "dp" ? <DevpostIcon /> : l.icon}
                </a>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(project, "overview"); }}
                title="More Info"
                className="w-7 h-7 rounded-full bg-black/50 border border-white/25 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-colors text-xs">
                ⓘ
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="font-display text-white text-sm leading-tight">{project.title}</p>
          {project.award && (
            <p className="font-mono text-[9px] text-yellow-400/70 mt-0.5 leading-tight">🏆 {project.award}</p>
          )}
        </div>
      </motion.div>

      {/* Hover strip */}
      <AnimatePresence>
        {hovered && (
          <motion.div className="absolute left-0 right-0 top-full z-30 bg-[#161828] border border-white/10 rounded-b-xl px-3 py-2.5 shadow-xl" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <p className="font-body text-xs text-white/60 leading-relaxed line-clamp-2">{project.logline}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Scroll Row with arrows ────────────────────────── */
function WorkRow({ cat, items, onSelect }: { cat: string; items: Project[]; onSelect: (p: Project, t: Tab) => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => rowRef.current?.scrollBy({ left: dir * 290, behavior: "smooth" });

  return (
    <motion.div className="mb-10 group/row" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
      <div className="flex items-center justify-between px-[5vw] mb-3">
        <p className="font-mono text-sm text-white/60 uppercase tracking-widest">{cat}</p>
        <div className="flex gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors text-sm">‹</button>
          <button onClick={() => scroll(1)} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors text-sm">›</button>
        </div>
      </div>
      <div ref={rowRef} className="flex gap-4 px-[5vw] overflow-x-auto pb-14 scrollbar-hide">
        {items.map((p) => <WorkCard key={p.slug} project={p} onSelect={onSelect} />)}
      </div>
    </motion.div>
  );
}

/* ─── Hero ──────────────────────────────────────────── */
function WorkHero({ onSelect }: { onSelect: (p: Project, t: Tab) => void }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const advance = useCallback(() => setIdx((i) => (i + 1) % featuredWork.length), []);

  useEffect(() => {
    if (paused || featuredWork.length === 0) return;
    const t = setInterval(advance, ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, advance]);

  if (featuredWork.length === 0) return null;
  const project = featuredWork[idx];

  return (
    <div className="relative w-full h-[42vh] md:h-[52vh] overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="sync">
        <motion.div key={project.slug} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <div className="absolute inset-0" style={{ background: project.gradient }} />
          {project.image && <Image src={project.image} alt={project.title} fill className="object-cover opacity-40" priority />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080D24] via-[#080D24]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080D24]/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end px-[5vw] pb-12 md:pb-16">
        <AnimatePresence mode="wait">
          <motion.div key={project.slug + "-c"} className="max-w-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
            {project.award && (
              <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border mb-3 ${AWARD_BADGE[project.award] ?? "bg-white/10 text-white/60 border-white/20"}`}>
                🏆 {project.award}
              </span>
            )}
            <h2 className="font-display text-5xl md:text-7xl text-white leading-none mb-2">{project.title}</h2>
            <p className="font-mono text-xs text-white/40 mb-3">{project.competition ?? project.category} · {project.month}</p>
            <p className="font-body text-white/60 max-w-md mb-5 leading-relaxed text-sm">{project.logline}</p>
            <div className="flex gap-3 flex-wrap items-center">
              {(project.video || project.slides) && (
                <button onClick={() => onSelect(project, "media")} className="flex items-center gap-2 font-mono text-sm px-6 py-2.5 bg-white text-navy hover:bg-white/90 transition-colors rounded-full">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><polygon points="1,0 12,6 1,12" /></svg> Play
                </button>
              )}
              <button onClick={() => onSelect(project, "overview")} className="flex items-center gap-2 font-mono text-sm px-6 py-2.5 bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-colors rounded-full">ⓘ More Info</button>
              {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-sm px-4 py-2.5 bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-colors rounded-full"><GitHubIcon /> GitHub</a>}
              {project.devpost && <a href={project.devpost} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-sm px-4 py-2.5 bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-colors rounded-full"><DevpostIcon /> Devpost</a>}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 right-[5vw] flex items-center gap-3">
          <button onClick={() => { setIdx((i) => (i - 1 + featuredWork.length) % featuredWork.length); setPaused(true); }} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors text-xs">‹</button>
          {featuredWork.map((_, i) => (
            <button key={i} onClick={() => { setIdx(i); setPaused(true); }}>
              <div className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
            </button>
          ))}
          <button onClick={() => { advance(); setPaused(true); }} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors text-xs">›</button>
        </div>
      </div>

      {!paused && featuredWork.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div key={idx} className="h-full bg-accent" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: ROTATE_MS / 1000, ease: "linear" }} />
        </div>
      )}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────── */
export default function WorkPage() {
  const [selected, setSelected] = useState<{ project: Project; tab: Tab } | null>(null);
  const [activeCategory, setActiveCategory] = useState<Cat>("All");
  const groups = groupWork(activeCategory);

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #080D24 0%, #0A0C1E 100%)" }}>
      <SignatureIntro />
      <Navbar />
      <div className="pt-16">
        <WorkHero onSelect={(p, t) => setSelected({ project: p, tab: t })} />
      </div>

      {/* Category filter */}
      <div className="px-[5vw] pt-6 pb-2 max-w-[1400px] mx-auto">
        <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {ALL_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`font-mono text-xs px-4 py-2 rounded-full border transition-all duration-200 ${activeCategory === cat ? "bg-accent text-white border-accent" : "bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white/80"}`}>
              {cat}
              {cat !== "All" && <span className="ml-1.5 opacity-50">({displayWork.filter((p) => p.category === cat).length})</span>}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="pb-24 pt-4">
        {groups.map(({ cat, items }) => (
          <WorkRow key={cat} cat={cat} items={items} onSelect={(p, t) => setSelected({ project: p, tab: t })} />
        ))}
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected.project} initialTab={selected.tab} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      <Footer />
    </main>
  );
}
