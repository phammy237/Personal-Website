"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import { journeyHanoiIntroContent } from "@/lib/biography/journeyHanoiIntroContent";

export type JourneyHanoiIntroPanelHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

const HANOI_OVERVIEW = getStageById("hanoi-overview");
// quick fade at both edges of the hanoi-overview window itself — visible regardless of whether the
// user arrived here via Begin Journey's cinematic jump or by scrolling here organically, since
// visibility is purely a function of progress, not of how progress got there.
const EDGE_FADE = 0.02;

/**
 * The Hanoi-overview landing state's intro block — same minimal overlay pattern as
 * JourneyHeroContent (ref-driven update(progress), no card/border), shown only for the
 * hanoi-overview stage, before any of the 5 pins have been visited. Its own CTA hands off to the
 * existing pin-click scroll path (onStart), so starting the Hanoi journey activates Pin 01 through
 * the same single scroll-progress source of truth every other navigation in this page already uses.
 */
export function JourneyHanoiIntroPanel({
  handleRef,
  reducedMotion,
  onStart,
  onSkip,
}: {
  handleRef: React.MutableRefObject<JourneyHanoiIntroPanelHandle | null>;
  reducedMotion: boolean;
  onStart: () => void;
  onSkip: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = stageWeight(progress, HANOI_OVERVIEW.start, HANOI_OVERVIEW.end, EDGE_FADE);
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
  }, [handleRef, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-full max-w-sm items-center px-6 opacity-0 md:px-12 lg:px-16"
    >
      {/* Subtle readability backdrop, not a card — a soft fade toward the page's own dark tone
          behind the text, no border/rounded-rectangle edge anywhere. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-[130%] dark:opacity-100"
        style={{
          background:
            "linear-gradient(to right, rgba(24,35,63,0.55) 0%, rgba(24,35,63,0.28) 55%, transparent 100%)",
        }}
      />
      <div className="flex flex-col gap-5">
        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.25em] text-accent dark:text-accent-lavender">
          {journeyHanoiIntroContent.eyebrow}
        </p>
        <h2 className="font-display text-5xl leading-[1.05] text-surface dark:text-white md:text-6xl">
          {journeyHanoiIntroContent.heading}
        </h2>
        <p className="max-w-sm font-body text-sm leading-relaxed text-muted dark:text-white/60">{journeyHanoiIntroContent.body}</p>
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={onStart}
            className="group flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-surface transition-colors hover:text-accent dark:text-white/80 dark:hover:text-white"
          >
            {journeyHanoiIntroContent.ctaLabel}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/50 transition-colors group-hover:border-accent dark:border-accent-lavender/50 dark:group-hover:border-accent-lavender">
              →
            </span>
          </button>
          {/* deliberately quiet — must not compete with the primary CTA above */}
          <button
            type="button"
            onClick={onSkip}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60 transition-colors hover:text-muted dark:text-white/35 dark:hover:text-white/60"
          >
            Skip to next chapter
          </button>
        </div>
      </div>
    </div>
  );
}
