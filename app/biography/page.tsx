"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobeHero } from "@/components/biography/GlobeHero";
import { RegionOverview } from "@/components/biography/RegionOverview";
import { ChapterMap } from "@/components/biography/ChapterMap";
import { HanoiJourneySection } from "@/components/biography/HanoiJourneySection";
import { useStoryState } from "@/lib/hooks/useStoryState";
import { useWorldTopology } from "@/lib/hooks/useWorldTopology";
import { heroCopy } from "@/data/biography";

export default function BiographyPage() {
  const story = useStoryState();
  const countries = useWorldTopology();

  return (
    <main className="min-h-screen bg-[#F8F9FF] dark:bg-navy">
      <Navbar />

      <div className="px-[5vw] pb-24 pt-28">
        <AnimatePresence mode="wait">
          {story.stage === "globe" && (
            <motion.section
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto grid min-h-[70vh] max-w-[1400px] items-center gap-10 lg:grid-cols-[0.85fr_1fr]"
            >
              <div className="order-2 lg:order-1">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{heroCopy.eyebrow}</p>
                <h1 className="mt-4 whitespace-pre-line font-display text-5xl leading-[0.95] text-surface dark:text-white md:text-6xl">
                  {heroCopy.heading}
                </h1>
                <p className="mt-5 max-w-md font-body text-base leading-relaxed text-muted dark:text-white/60">
                  {heroCopy.subheading}
                </p>
                <button
                  onClick={story.beginJourney}
                  className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-accent/90"
                >
                  {heroCopy.cta}
                  <span aria-hidden="true">→</span>
                </button>
                <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted/70 dark:text-white/35">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" />
                  </svg>
                  {heroCopy.dragHint}
                </div>
              </div>

              <div className="order-1 flex justify-center lg:order-2">
                <GlobeHero
                  countries={countries}
                  highlightCountryIds={["704"]}
                  initialTarget={{ lat: 21, lon: 105.85 }}
                  size={520}
                  ariaLabel="Interactive globe highlighting Vietnam"
                />
              </div>
            </motion.section>
          )}

          {story.stage === "region" && (
            <motion.section
              key="region"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-[1400px] py-6"
            >
              <button
                onClick={story.back}
                className="mb-5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-accent dark:text-white/40 dark:hover:text-accent"
              >
                ← Back to globe
              </button>
              <RegionOverview chapter={story.chapter} countries={countries} onExplore={story.enterMap} onSkip={story.back} />
            </motion.section>
          )}

          {story.stage === "map" && (
            <motion.section
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-[1800px] py-6"
            >
              <button
                onClick={story.back}
                className="mb-5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted transition-colors hover:text-accent dark:text-white/40 dark:hover:text-accent"
              >
                ← Back to {story.chapter.regionLabel}
              </button>
              {story.chapter.id === "vietnam" ? (
                <HanoiJourneySection />
              ) : (
                <ChapterMap
                  chapter={story.chapter}
                  completedPinIds={story.completedPinIds}
                  activePinId={story.activePinId}
                  onSelectPin={story.selectPin}
                />
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
