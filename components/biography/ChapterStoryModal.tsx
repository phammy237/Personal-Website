"use client";
import { ModalShell } from "@/components/ui/ModalShell";
import type { HanoiJourneyPin } from "@/data/hanoiJourney";

export function ChapterStoryModal({
  pin,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  pin: HanoiJourneyPin;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-2xl"
      panelClassName="bg-white border border-border dark:bg-[#0D0B1F] dark:border-white/10"
      closeButtonClassName="bg-black/5 text-surface/70 hover:bg-black/10 hover:text-surface dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-white"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pin.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-medium text-white">
            {String(pin.number).padStart(2, "0")}
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">
            {pin.subtitle} <span className="text-white/50">· Ages {pin.ageRange}</span>
          </p>
        </div>

        {/* prev/next between chapters, top-left so it doesn't collide with ModalShell's close button */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous chapter"
            onClick={onPrev}
            disabled={!canPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-white/80"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next chapter"
            onClick={onNext}
            disabled={!canNext}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-white/80"
          >
            ›
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-surface dark:text-white md:text-3xl">{pin.preview.title}</h2>
            <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-muted dark:text-white/40">
              Hanoi · Ages {pin.ageRange}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs text-muted dark:text-white/40">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {pin.backstory.map((paragraph, i) => (
            <p key={i} className="font-body text-sm leading-relaxed text-muted dark:text-white/65">
              {paragraph}
            </p>
          ))}
        </div>

        {pin.subsections && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 dark:border-white/10 sm:grid-cols-4">
            {pin.subsections.map((s) => (
              <div key={s.title}>
                <p className="font-mono text-xs uppercase tracking-wider text-accent">{s.title}</p>
                <p className="mt-1 font-body text-xs leading-relaxed text-muted dark:text-white/50">{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
