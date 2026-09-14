"use client";
import { useEffect, useRef, useState } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { rampDownTo } from "@/lib/biography/journeyMotion";
import { journeyHeroContent } from "@/lib/biography/journeyHeroContent";

export type JourneyHeroContentHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

// Fully visible through earth-intro, faded out by the time the camera reaches Hanoi — matches the
// same window the map's own Earth-hero padding/glow use (see JourneyMapCanvas), so the text, the
// globe's framing, and the "glowing Hanoi" marker all resolve together instead of independently.
const FADE_COMPLETE_AT = getStageById("hanoi-approach").start;

/**
 * The Earth-hero stage's left-side title/CTA block — plain overlay text, not a card, sitting beside
 * (not on top of) the globe. Purely presentational/ref-driven, mirroring JourneyStoryLayer's
 * update(progress) pattern so this introduces no additional scroll listener.
 */
export function JourneyHeroContent({
  handleRef,
  reducedMotion,
  onBeginJourney,
}: {
  handleRef: React.MutableRefObject<JourneyHeroContentHandle | null>;
  reducedMotion: boolean;
  onBeginJourney: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Disables the CTA the instant it's clicked, independent of the progress-driven fade below (which
  // takes a beat to reach the >0.05 "inert" threshold) — belt-and-suspenders against a double click
  // firing beginJourneyTransition twice. Re-enabled automatically if the user scrolls back to a
  // fully-visible Earth stage, rather than staying disabled forever after one use.
  const [isBeginning, setIsBeginning] = useState(false);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = rampDownTo(progress, FADE_COMPLETE_AT, FADE_COMPLETE_AT);
        const visible = weight > 0.05;
        el.style.opacity = String(weight);
        el.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * 16}px)`;
        el.style.pointerEvents = visible ? "auto" : "none";
        el.inert = !visible;
        setIsBeginning((prev) => (prev && weight > 0.5 ? false : prev));
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  const handleClick = () => {
    if (isBeginning) return;
    setIsBeginning(true);
    onBeginJourney();
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-full max-w-md flex-col justify-center gap-6 px-6 md:px-12 lg:px-16"
    >
      <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.25em] text-muted dark:text-white/50">
        {journeyHeroContent.eyebrow}
      </p>
      <h2 className="font-display text-5xl leading-[1.05] text-surface dark:text-white md:text-6xl">
        {journeyHeroContent.headingLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <p className="max-w-sm font-body text-sm leading-relaxed text-muted dark:text-white/60">{journeyHeroContent.body}</p>
      <button
        type="button"
        onClick={handleClick}
        disabled={isBeginning}
        className="group flex w-fit items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-surface transition-colors hover:text-accent disabled:cursor-default disabled:opacity-60 disabled:hover:text-surface dark:text-white/80 dark:hover:text-white dark:disabled:hover:text-white/80"
      >
        {journeyHeroContent.ctaLabel}
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/50 transition-colors group-hover:border-accent dark:border-accent-lavender/50 dark:group-hover:border-accent-lavender">
          →
        </span>
      </button>
    </div>
  );
}
