"use client";
import { JourneyMediaPlaceholder } from "@/components/biography/journey/JourneyMediaPlaceholder";

/**
 * The compact, default state for any active location (Hanoi or U.S.) — title, one featured image,
 * 2-3 lines of dedicated preview copy, and a "Learn More" opt-in into the full expanded story.
 * Shared between Hanoi and U.S. panels since both pin data shapes carry the same
 * `preview: {title, description}` + `image` fields (see HanoiJourneyPin/USJourneyPin) — no new data
 * needed. Purely presentational: the caller owns storyMode state and the stable, ref'd wrapper this
 * renders inside (so the scroll-driven opacity/transform that decides "is this location on screen
 * at all" never remounts when preview/expanded toggles). A teaser, not a mini article — kept
 * visually light/tight on purpose.
 */
export function JourneyPinPreviewCard({
  number,
  title,
  description,
  image,
  mediaPlaceholder,
  metaLabel,
  index,
  total,
  loadMedia,
  onLearnMore,
  onPrev,
  onNext,
}: {
  number: number;
  title: string;
  description: string;
  image?: string;
  /** shown in the image slot instead, only when `image` is absent — see JourneyMediaPlaceholder */
  mediaPlaceholder?: { eyebrow: string; description: string };
  metaLabel: string;
  index: number;
  total: number;
  loadMedia: boolean;
  onLearnMore: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 p-5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[11px] font-medium text-white dark:bg-[#6F4DD6]">
          {String(number).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[17px] leading-tight text-surface dark:text-[#F4F1FB]">{title}</h2>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-accent dark:text-[#A98CFF]">{metaLabel}</p>
        </div>
      </div>

      <p className="line-clamp-3 font-body text-sm leading-relaxed text-muted dark:text-[rgba(238,236,246,0.75)]">{description}</p>

      {image ? (
        loadMedia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="aspect-[16/8.5] w-full rounded-[12px] object-cover" loading="lazy" />
        ) : (
          <div className="aspect-[16/8.5] w-full rounded-[12px] bg-accent-light/40 dark:bg-white/[0.04]" />
        )
      ) : (
        mediaPlaceholder && (
          <JourneyMediaPlaceholder
            number={number}
            title={title}
            eyebrow={mediaPlaceholder.eyebrow}
            description={mediaPlaceholder.description}
            className="aspect-[16/8.5] w-full rounded-[12px]"
          />
        )
      )}

      <button
        type="button"
        onClick={onLearnMore}
        style={{ background: "linear-gradient(135deg, #6847B8, #8E6BFF)" }}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[11px] font-mono text-[11px] uppercase tracking-[0.12em] text-white transition-all hover:brightness-110 hover:shadow-[0_0_18px_rgba(142,107,255,0.4)]"
      >
        Learn More
        <span aria-hidden="true">→</span>
      </button>

      <div className="flex items-center justify-between border-t border-border/40 pt-3 dark:border-white/[0.05]">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous location"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(180,160,255,0.18)] text-muted transition-colors hover:bg-[rgba(142,107,255,0.1)] dark:text-[rgba(205,200,225,0.7)]"
        >
          ←
        </button>
        <span className="font-mono text-[11px] tracking-[0.14em] text-muted dark:text-[rgba(205,200,225,0.5)]">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next location"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(180,160,255,0.18)] text-muted transition-colors hover:bg-[rgba(142,107,255,0.1)] dark:text-[rgba(205,200,225,0.7)]"
        >
          →
        </button>
      </div>
    </div>
  );
}
