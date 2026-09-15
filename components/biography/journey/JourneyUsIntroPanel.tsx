"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import { applyStageWeightStyle } from "@/components/biography/journey/journeyPanelStyle";
import { usJourneyCopy } from "@/data/usJourney";

export type JourneyUsIntroPanelHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

const US_OVERVIEW = getStageById("us-overview");
const EDGE_FADE = 0.02; // matches JourneyHanoiIntroPanel's own EDGE_FADE

/**
 * The U.S.-overview landing state's intro block — same shell/behavior as JourneyHanoiIntroPanel
 * (left column, ref-driven update(progress), no card/border), shown only for the us-overview stage.
 * Two CTAs instead of one: "Start the Chapter" jumps straight into Rivermont's settled story
 * window (mirrors JourneyHanoiIntroPanel's onStart), while "Explore Freely" eases only as far as
 * rivermont-approach's own start — letting the user scroll/click through the map themselves rather
 * than being snapped straight into a story panel.
 */
export function JourneyUsIntroPanel({
  handleRef,
  reducedMotion,
  onStartChapter,
  onExploreFreely,
  showReturnLink,
  onReturnToSummary,
}: {
  handleRef: React.MutableRefObject<JourneyUsIntroPanelHandle | null>;
  reducedMotion: boolean;
  onStartChapter: () => void;
  onExploreFreely: () => void;
  /** true once the user has already reached us-complete at least once this session — mirrors
   *  JourneyHanoiIntroPanel's own showReturnLink. */
  showReturnLink?: boolean;
  onReturnToSummary?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = stageWeight(progress, US_OVERVIEW.start, US_OVERVIEW.end, EDGE_FADE);
        applyStageWeightStyle(el, weight, reducedMotion);
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-full max-w-sm items-center px-6 opacity-0 md:px-12 lg:px-16"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-[130%] dark:opacity-100"
        style={{
          background: "linear-gradient(to right, rgba(24,35,63,0.55) 0%, rgba(24,35,63,0.28) 55%, transparent 100%)",
        }}
      />
      <div className="flex flex-col gap-5">
        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.25em] text-accent dark:text-accent-lavender">
          {usJourneyCopy.eyebrow}
        </p>
        <h2 className="font-display text-5xl leading-[1.05] text-surface dark:text-white md:text-6xl">
          {usJourneyCopy.heading}
        </h2>
        <p className="max-w-sm font-body text-sm leading-relaxed text-muted dark:text-white/60">{usJourneyCopy.body}</p>
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={onStartChapter}
            className="group flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-surface transition-colors hover:text-accent dark:text-white/80 dark:hover:text-white"
          >
            {usJourneyCopy.ctaLabel}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/50 transition-colors group-hover:border-accent dark:border-accent-lavender/50 dark:group-hover:border-accent-lavender">
              →
            </span>
          </button>
          <button
            type="button"
            onClick={onExploreFreely}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60 transition-colors hover:text-muted dark:text-white/35 dark:hover:text-white/60"
          >
            {usJourneyCopy.secondaryCtaLabel}
          </button>
          {showReturnLink && onReturnToSummary && (
            <button
              type="button"
              onClick={onReturnToSummary}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60 transition-colors hover:text-muted dark:text-white/35 dark:hover:text-white/60"
            >
              Back to chapter summary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
