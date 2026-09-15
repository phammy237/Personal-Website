"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import type { JourneyStageId } from "@/lib/biography/journeyTypes";

export type JourneyChapterCompleteHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

// Deliberately tighter than JourneyHanoiIntroPanel's 0.02 (≈45vh of overlap at this journey's
// stage width) — two full-bleed, centered text blocks reading "on top of" each other for that long
// looks broken, not cinematic, unlike a compact side card brushing past another one mid-scroll.
// ≈14vh of overlap instead: still a real crossfade (never an instant snap), just short enough that
// only someone scrubbing very slowly ever sees both at once.
const EDGE_FADE = 0.006;

/**
 * Shared chapter-complete overlay — "no card," centered, full-bleed over the map's own return-to-
 * overview camera — used for both hanoi-complete and us-complete. Same ref-driven update(progress)
 * pattern as JourneyHanoiIntroPanel: visible only while its own stage is on screen, invisible (and
 * inert) otherwise, so it never has to be conditionally mounted/unmounted.
 */
export function JourneyChapterComplete({
  handleRef,
  stageId,
  reducedMotion,
  eyebrow,
  heading,
  paragraph,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  handleRef: React.MutableRefObject<JourneyChapterCompleteHandle | null>;
  stageId: JourneyStageId;
  reducedMotion: boolean;
  eyebrow: string;
  heading: string;
  paragraph: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stage = getStageById(stageId);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = stageWeight(progress, stage.start, stage.end, EDGE_FADE);
        const visible = weight > 0.05;
        el.style.opacity = String(weight);
        el.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * 16}px)`;
        el.style.pointerEvents = visible ? "auto" : "none";
        el.inert = !visible;
      },
    };
    return () => {
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleRef, reducedMotion, stage.start, stage.end]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-6 text-center opacity-0"
    >
      <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.25em] text-accent dark:text-accent-lavender">
        {eyebrow}
      </p>
      <h2 className="max-w-xl font-display text-4xl leading-[1.1] text-surface dark:text-white md:text-5xl">{heading}</h2>
      <p className="max-w-md font-body text-sm leading-relaxed text-muted dark:text-white/60">{paragraph}</p>
      <div className="mt-2 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onPrimary}
          className="group flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-surface transition-colors hover:text-accent dark:text-white/80 dark:hover:text-white"
        >
          {primaryLabel}
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/50 transition-colors group-hover:border-accent dark:border-accent-lavender/50 dark:group-hover:border-accent-lavender">
            →
          </span>
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60 transition-colors hover:text-muted dark:text-white/35 dark:hover:text-white/60"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
