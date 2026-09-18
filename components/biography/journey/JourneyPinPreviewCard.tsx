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
    <div className="flex w-full flex-col px-[30px] pb-[26px] pt-[30px]">
      <div className="flex items-center gap-3">
        <span
          className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-full font-mono text-[10px] text-white"
          style={{ background: "#8D78D8" }}
        >
          {String(number).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[21px] leading-tight text-surface dark:text-[#F3F0F6]">{title}</h2>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-accent dark:text-[#9480D8]">{metaLabel}</p>
        </div>
      </div>

      {image ? (
        loadMedia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="mt-5 aspect-video w-full rounded-[3px] object-cover md:min-h-[220px]"
            loading="lazy"
          />
        ) : (
          <div className="mt-5 aspect-video w-full rounded-[3px] bg-accent-light/40 dark:bg-white/[0.04] md:min-h-[220px]" />
        )
      ) : mediaPlaceholder ? (
        <JourneyMediaPlaceholder
          number={number}
          title={title}
          eyebrow={mediaPlaceholder.eyebrow}
          description={mediaPlaceholder.description}
          className="mt-5 aspect-video w-full rounded-[3px] md:min-h-[220px]"
        />
      ) : null}

      <p className="mt-5 font-body text-[17px] leading-[1.6] text-muted dark:text-[rgba(226,224,235,0.70)]">{description}</p>

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-5 flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-surface transition-colors hover:text-accent dark:text-[#FFFFFF] dark:hover:text-[#B09DF2]"
      >
        Read the story
        <span aria-hidden="true">→</span>
      </button>

      <div className="mt-[22px] flex items-center justify-between border-t border-[rgba(180,174,205,0.16)] pt-4">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous location"
          className="-m-2 p-2 font-mono text-[13px] text-muted transition-colors hover:text-accent dark:text-[rgba(210,205,225,0.55)] dark:hover:text-[#B09DF2]"
        >
          ←
        </button>
        <span className="font-mono text-[10px] tracking-[0.14em] text-muted dark:text-[rgba(210,205,225,0.42)]">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next location"
          className="-m-2 p-2 font-mono text-[13px] text-muted transition-colors hover:text-accent dark:text-[rgba(210,205,225,0.55)] dark:hover:text-[#B09DF2]"
        >
          →
        </button>
      </div>
    </div>
  );
}
