import type { JourneyStageConfig } from "@/lib/biography/journeyTypes";

const CHAPTER_ACCENT: Record<JourneyStageConfig["chapter"], string> = {
  earth: "border-accent-lavender/40 text-accent-lavender",
  hanoi: "border-accent-gold/40 text-accent-gold",
  us: "border-accent-mauve/40 text-accent-mauve",
  today: "border-accent-light/50 text-accent-light",
};

/**
 * Deliberately plain — its only job is to prove the scroll choreography works before Phase 3
 * wires in the real globe, maps, and story panels.
 */
export function JourneyPlaceholder({ stage, index, total }: { stage: JourneyStageConfig; index: number; total: number }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div
        className={`flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border bg-navy-mid/60 px-8 py-10 text-center backdrop-blur-sm ${CHAPTER_ACCENT[stage.chapter]}`}
      >
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          Stage {index + 1} / {total}
        </span>
        <h2 className="font-display text-3xl text-white md:text-4xl">{stage.label}</h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/35">{stage.chapter} chapter</p>
      </div>
    </div>
  );
}
