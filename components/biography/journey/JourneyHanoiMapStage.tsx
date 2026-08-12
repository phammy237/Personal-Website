"use client";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { HanoiMap } from "@/components/biography/HanoiMap";
import type { PinStatus } from "@/components/biography/MapPin";
import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { useHanoiMapProjection } from "@/lib/hooks/useHanoiMapProjection";
import {
  computeHanoiCameraFrame,
  derivePinStatus,
  deriveRouteProgress,
  lerpComposition,
  resolveHanoiComposition,
  toMapPinStatus,
  type HanoiMapStageHandle,
} from "@/lib/biography/hanoiCamera";

const FIRST_PIN_ID = hanoiJourneyPins[0].id;
/** below this measured container width, use the mobile focus/composition instead of desktop's */
const MOBILE_WIDTH_THRESHOLD = 640;

type JourneyHanoiMapStageProps = {
  reducedMotion: boolean;
  handleRef: React.MutableRefObject<HanoiMapStageHandle | null>;
};

/**
 * The existing Hanoi map renderer (HanoiMap + the shared projection hook it already uses),
 * reused wholesale — no second map, no copied pin data. Persistently mounted across
 * hanoi-approach → hanoi-overview → hanoi-pin-1..5; GeographicJourney only ever toggles this
 * stage's outer opacity/scale (unchanged from Phase 4) and calls `handleRef.updateCamera(progress)`
 * every scroll tick. Everything camera- and pin-state-related is resolved and applied right here,
 * imperatively, so a scroll tick never re-renders GeographicJourney's own tree.
 *
 * The camera itself is a plain CSS transform (translate + scale) on a wrapper placed *around* the
 * untouched HanoiMap — HanoiMap keeps rendering its normal fitted view; this only changes what
 * part of it the viewport is looking at, using the exact same projected pin positions HanoiMap
 * itself renders from (useHanoiMapProjection), not a second projection.
 */
export const JourneyHanoiMapStage = forwardRef<HTMLDivElement, JourneyHanoiMapStageProps>(function JourneyHanoiMapStage(
  { reducedMotion, handleRef },
  ref
) {
  const { projectedPins, riverPathD, lakePathD, roadsPathD } = useHanoiMapProjection(hanoiJourneyPins);
  const projectedPinsRef = useRef(projectedPins);
  projectedPinsRef.current = projectedPins;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  // cached from the measured container, not read on every scroll tick — only on mount + resize
  const sizeRef = useRef({ width: 1000, height: 820 });
  const isMobileRef = useRef(false);

  const [activePinIndex, setActivePinIndex] = useState(-1); // -1 = overview/approach, 0-4 = pin index, 5 = past pin-5
  const activePinIndexRef = useRef(-1);

  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        sizeRef.current = { width: rect.width, height: rect.height };
        isMobileRef.current = rect.width < MOBILE_WIDTH_THRESHOLD;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const updateCamera = useCallback(
    (progress: number) => {
      const frame = computeHanoiCameraFrame(progress);

      if (frame.pinCursor !== activePinIndexRef.current) {
        activePinIndexRef.current = frame.pinCursor;
        setActivePinIndex(frame.pinCursor);
      }

      const el = cameraRef.current;
      if (el) {
        if (reducedMotion) {
          // near-static: geographic context comes from pin state + route progress, not motion
          el.style.transform = "none";
        } else {
          const to = resolveHanoiComposition(frame.toId, projectedPinsRef.current, sizeRef.current, isMobileRef.current);
          const composition =
            frame.fromId === frame.toId
              ? to
              : lerpComposition(
                  resolveHanoiComposition(frame.fromId, projectedPinsRef.current, sizeRef.current, isMobileRef.current),
                  to,
                  frame.t
                );
          el.style.transform = `translate(${composition.dx}px, ${composition.dy}px) scale(${composition.scale})`;
        }
      }
    },
    [reducedMotion]
  );

  useEffect(() => {
    handleRef.current = { updateCamera };
    return () => {
      if (handleRef.current) handleRef.current = null;
    };
  }, [handleRef, updateCamera]);

  const statusFor = useCallback(
    (id: string): PinStatus => {
      const idx = hanoiJourneyPins.findIndex((p) => p.id === id);
      if (idx === -1) return "unvisited";
      return toMapPinStatus(derivePinStatus(idx, activePinIndex));
    },
    [activePinIndex]
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-stage-id="hanoi-overview"
      style={{ opacity: 0, pointerEvents: "none" }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-6"
    >
      <div ref={containerRef} className="w-full max-w-[1000px] md:w-[82vw]">
        <div ref={cameraRef} style={{ transformOrigin: "50% 50%", willChange: "transform" }}>
          <HanoiMap
            pins={projectedPins}
            activePinId={FIRST_PIN_ID}
            statusFor={statusFor}
            onSelectPin={NOOP}
            riverPathD={riverPathD}
            lakePathD={lakePathD}
            roadsPathD={roadsPathD}
            // deliberately hardcoded true, independent of the real reducedMotion prop above (which
            // instead governs *this* component's own camera motion): it suppresses MapPin's
            // infinite pulse on the active pin and keeps the route reveal instant rather than
            // replaying its own 1.1s transition on every scroll-driven progressOverride change
            reducedMotion
            progressOverride={deriveRouteProgress(activePinIndex)}
            settled
            pinsInteractive={false}
          />
        </div>
      </div>
    </div>
  );
});

const NOOP = () => {};
