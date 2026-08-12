import { forwardRef } from "react";
import type { JourneyStageConfig } from "@/lib/biography/journeyTypes";
import { JourneyPlaceholder } from "@/components/biography/journey/JourneyPlaceholder";

type JourneyStageProps = {
  stage: JourneyStageConfig;
  index: number;
  total: number;
  /** server-safe initial visibility — stage 0 shown, rest hidden — before the scroll effect takes over */
  initiallyActive: boolean;
};

/**
 * Positioning shell only. Per-frame opacity/scale/position are applied imperatively by
 * GeographicJourney (via gsap.set on this element's ref) so 20 stacked stages don't each cause a
 * React re-render on every scroll tick — the DOM node is the single source of truth for "what's
 * currently on screen", the centralized stage config is the source of truth for "what stage is
 * this and when should it be visible".
 */
export const JourneyStage = forwardRef<HTMLDivElement, JourneyStageProps>(function JourneyStage(
  { stage, index, total, initiallyActive },
  ref
) {
  return (
    <div
      ref={ref}
      aria-hidden={!initiallyActive}
      data-stage-id={stage.id}
      style={{ opacity: initiallyActive ? 1 : 0, pointerEvents: initiallyActive ? "auto" : "none" }}
      className="absolute inset-0"
    >
      <JourneyPlaceholder stage={stage} index={index} total={total} />
    </div>
  );
});
