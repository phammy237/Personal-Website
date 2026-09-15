"use client";
import { forwardRef } from "react";
import { JourneyPinPreviewCard } from "@/components/biography/journey/JourneyPinPreviewCard";
import type { USJourneyPin } from "@/data/usJourney";

/**
 * One U.S. location's compact preview card — same shell/behavior as JourneyPinStoryPanel (Hanoi),
 * sharing JourneyPinPreviewCard. "Learn More" opens the same shared JourneyStoryModal (see
 * JourneyStoryLayer) rather than morphing this panel; see that component's comment for the full
 * rationale.
 *
 * JourneyStoryLayer owns this element's opacity/transform via the forwarded ref — nothing here
 * animates on its own. Aria-hidden/inert are likewise applied imperatively by the caller's
 * scroll-tick loop, matching JourneyPinStoryPanel's own established pattern. `loadMedia` gates
 * whether real media actually loads — only the current and immediately adjacent stories load
 * media, matching JourneyPinStoryPanel's own perf gate.
 */
export const JourneyUsStoryPanel = forwardRef<
  HTMLDivElement,
  {
    pin: USJourneyPin;
    loadMedia: boolean;
    index: number;
    total: number;
    /** true while the story modal is open for this location — see JourneyPinStoryPanel's identical prop */
    hidden?: boolean;
    onLearnMore: () => void;
    onPrev: () => void;
    onNext: () => void;
  }
>(function JourneyUsStoryPanel({ pin, loadMedia, index, total, hidden, onLearnMore, onPrev, onNext }, ref) {
  return (
    // Same outer-wrapper/inner-ref split as JourneyPinStoryPanel, for the same reason: layout
    // positioning (mobile bottom sheet vs. desktop right panel) lives on this static wrapper via
    // flexbox, never as a transform, so it never fights with the inner element's own imperative
    // slide-in transform. Desktop right offset (pr-32/40) and mobile bottom offset (pb-36) match
    // the Hanoi panel's verified clearance from the progress rail and mobile chapter rail.
    <div
      className={`pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-4 pb-36 md:items-start md:justify-end md:px-0 md:pb-0 md:pr-[5vw] md:pt-[14vh] ${hidden ? "invisible" : ""}`}
    >
      <div
        ref={ref}
        id={`us-story-${pin.id}`}
        role="region"
        aria-label={`Preview: ${pin.preview.title}`}
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: "none" }}
        className="relative flex w-full flex-col overflow-hidden rounded-[22px] border border-border bg-white/97 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[rgba(22,27,57,0.92)] md:w-[360px]"
      >
        <JourneyPinPreviewCard
          number={pin.number}
          title={pin.preview.title}
          description={pin.preview.description}
          image={pin.image}
          metaLabel={`${pin.subtitle} · ${pin.yearRange}`}
          index={index}
          total={total}
          loadMedia={loadMedia}
          onLearnMore={onLearnMore}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
    </div>
  );
});
