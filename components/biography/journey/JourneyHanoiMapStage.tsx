"use client";
import { forwardRef, useCallback } from "react";
import { HanoiMap } from "@/components/biography/HanoiMap";
import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { useHanoiMapProjection } from "@/lib/hooks/useHanoiMapProjection";

const FIRST_PIN_ID = hanoiJourneyPins[0].id;
/** always "unvisited" — this phase never activates a pin or opens a story */
const NEUTRAL_STATUS = "unvisited" as const;
const NOOP = () => {};

type JourneyHanoiMapStageProps = {
  reducedMotion: boolean;
};

/**
 * The existing Hanoi map renderer (HanoiMap + the shared projection hook it already uses),
 * reused wholesale — no second map, no copied pin data. Pins render in their default neutral
 * ("unvisited") state and clicks are inert, since selecting/opening a story is Phase 5's job.
 *
 * Always `settled` (HanoiMap's own drag/wheel-zoom/reset stay off) for the whole of this phase —
 * HanoiMap's wheel handler calls preventDefault when it isn't settled, and since this map fills
 * most of the viewport at hanoi-overview, that would hijack the same wheel events that need to
 * keep scrolling the page (exactly the trapping the globe's own wheelZoom={false} avoids).
 * Phase 5, when it makes the map genuinely interactive, will need a wheel-safe way to enable
 * this — mirroring the globe's `wheelZoom` prop is the natural approach.
 */
export const JourneyHanoiMapStage = forwardRef<HTMLDivElement, JourneyHanoiMapStageProps>(function JourneyHanoiMapStage(
  { reducedMotion },
  ref
) {
  const { projectedPins, riverPathD, lakePathD, roadsPathD } = useHanoiMapProjection(hanoiJourneyPins);
  const statusFor = useCallback(() => NEUTRAL_STATUS, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-stage-id="hanoi-overview"
      style={{ opacity: 0, pointerEvents: "none" }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-6"
    >
      <div className="w-full max-w-[1000px] md:w-[82vw]">
        <HanoiMap
          pins={projectedPins}
          activePinId={FIRST_PIN_ID}
          statusFor={statusFor}
          onSelectPin={NOOP}
          riverPathD={riverPathD}
          lakePathD={lakePathD}
          roadsPathD={roadsPathD}
          reducedMotion={reducedMotion}
          progressOverride={0}
          settled
        />
      </div>
    </div>
  );
});
