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
    // Same outer-wrapper/inner-ref split as JourneyPinStoryPanel, for the same reason, and the
    // exact same editorial-column treatment — no separate visual style for the U.S. chapter.
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-end justify-center px-3 pb-32 md:block md:px-0 md:pb-0 ${hidden ? "invisible" : ""}`}
    >
      <div
        ref={ref}
        id={`us-story-${pin.id}`}
        role="region"
        aria-label={`Preview: ${pin.preview.title}`}
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: "none" }}
        className="relative flex max-h-[56vh] w-full flex-col overflow-y-auto overflow-x-hidden border-t border-[rgba(73,82,110,0.12)] bg-[rgba(250,248,252,0.94)] dark:border-[rgba(180,174,205,0.14)] dark:bg-[rgba(8,13,27,0.94)] md:fixed md:right-0 md:top-[80px] md:bottom-6 md:max-h-none md:w-[440px] md:min-w-[400px] md:max-w-[30vw] md:border-t-0 md:border-l"
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
