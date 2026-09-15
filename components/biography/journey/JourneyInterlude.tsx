"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import { notYetInterludeCopy } from "@/data/hanoiJourney";

export type JourneyInterludeHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

// see JourneyChapterComplete's own EDGE_FADE comment — tightened from the 0.02 "panel" convention
// so two full-bleed centered text beats never linger visibly on top of each other.
const EDGE_FADE = 0.006;
const NOT_YET = getStageById("hanoi-interlude-not-yet");
const NOW = getStageById("hanoi-interlude-now");

/**
 * The between-chapters interlude — two beats sharing one minimal, cinematic, no-card shell:
 * "not yet" (hanoi-interlude-not-yet) crossfades into "now" (hanoi-interlude-now) as the camera
 * itself drifts wider (see journeyMapCamera.ts's Hanoi -> Vietnam -> regional-Asia sequence for
 * this same window). Only the second beat carries a CTA ("Cross the Ocean") — the first is purely
 * reflective, matching "keep this reflective, not resentful or dramatic."
 */
export function JourneyInterlude({
  handleRef,
  reducedMotion,
  onCrossOcean,
}: {
  handleRef: React.MutableRefObject<JourneyInterludeHandle | null>;
  reducedMotion: boolean;
  onCrossOcean: () => void;
}) {
  const notYetRef = useRef<HTMLDivElement | null>(null);
  const nowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apply = (el: HTMLDivElement | null, weight: number) => {
      if (!el) return;
      const visible = weight > 0.05;
      el.style.opacity = String(weight);
      el.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * 16}px)`;
      el.style.pointerEvents = visible ? "auto" : "none";
      el.inert = !visible;
    };
    handleRef.current = {
      update: (progress) => {
        apply(notYetRef.current, stageWeight(progress, NOT_YET.start, NOT_YET.end, EDGE_FADE));
        apply(nowRef.current, stageWeight(progress, NOW.start, NOW.end, EDGE_FADE));
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  return (
    <>
      <div
        ref={notYetRef}
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 px-6 text-center opacity-0"
      >
        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.25em] text-accent dark:text-accent-lavender">
          Between Chapters
        </p>
        <h2 className="max-w-lg font-display text-4xl leading-[1.12] text-surface dark:text-white md:text-5xl">
          {notYetInterludeCopy.heading}
        </h2>
        <p className="max-w-md font-body text-sm leading-relaxed text-muted dark:text-white/60">
          {notYetInterludeCopy.paragraph}
        </p>
      </div>

      <div
        ref={nowRef}
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-6 text-center opacity-0"
      >
        <h2 className="max-w-lg font-display text-4xl leading-[1.12] text-surface dark:text-white md:text-5xl">
          {notYetInterludeCopy.resolution}
        </h2>
        <button
          type="button"
          onClick={onCrossOcean}
          className="group mt-2 flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-surface transition-colors hover:text-accent dark:text-white/80 dark:hover:text-white"
        >
          {notYetInterludeCopy.cta}
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/50 transition-colors group-hover:border-accent dark:border-accent-lavender/50 dark:group-hover:border-accent-lavender">
            →
          </span>
        </button>
      </div>
    </>
  );
}
