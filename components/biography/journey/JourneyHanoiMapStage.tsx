"use client";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { HanoiMap } from "@/components/biography/HanoiMap";
import type { PinStatus } from "@/components/biography/MapPin";
import { JourneyPinStoryPanel } from "@/components/biography/journey/JourneyPinStoryPanel";
import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { useHanoiMapProjection } from "@/lib/hooks/useHanoiMapProjection";
import { journeyStages } from "@/lib/biography/journeyStages";
import { motionFade, reducedMotionFade } from "@/lib/biography/journeyMotion";
import { computeMapOpacity } from "@/lib/biography/journeyCamera";
import {
  computeHanoiCameraFrame,
  derivePinStatus,
  deriveRouteProgress,
  deriveStoryWeights,
  lerpComposition,
  resolveHanoiComposition,
  toMapPinStatus,
  type HanoiMapStageHandle,
} from "@/lib/biography/hanoiCamera";

const FIRST_PIN_ID = hanoiJourneyPins[0].id;
/** below this measured container width, use the mobile focus/composition instead of desktop's */
const MOBILE_WIDTH_THRESHOLD = 640;
const MOTION_FADE = motionFade(journeyStages.length);
const REDUCED_FADE = reducedMotionFade(journeyStages.length);
/** the panel's own restrained entrance slide — skipped entirely under reduced motion */
const STORY_SLIDE_PX = 24;

type JourneyHanoiMapStageProps = {
  reducedMotion: boolean;
  handleRef: React.MutableRefObject<HanoiMapStageHandle | null>;
  /** scrolls the page to pin N's stable reading position — GeographicJourney owns the actual
   *  scroll math (mirroring the chapter rail's boundary-safe helper); this stage never scrolls
   *  or mutates camera/story state directly, only requests the scroll */
  onSelectPin: (pinId: string) => void;
};

/**
 * The existing Hanoi map renderer (HanoiMap + the shared projection hook it already uses) plus
 * its five story panels, reused/extended wholesale — no second map, no copied pin/story data.
 * Persistently mounted across hanoi-approach → hanoi-overview → hanoi-pin-1..5; GeographicJourney
 * only ever toggles this stage's outer opacity/scale (unchanged from Phase 4) and calls
 * `handleRef.updateCamera(progress)` every scroll tick. Camera, pin status, route progress, and
 * story visibility are all resolved right here from the same camera frame, imperatively, so a
 * scroll tick never re-renders GeographicJourney's own tree.
 */
export const JourneyHanoiMapStage = forwardRef<HTMLDivElement, JourneyHanoiMapStageProps>(function JourneyHanoiMapStage(
  { reducedMotion, handleRef, onSelectPin },
  ref
) {
  const { projectedPins, riverPathD, lakePathD, roadsPathD } = useHanoiMapProjection(hanoiJourneyPins);
  const projectedPinsRef = useRef(projectedPins);
  projectedPinsRef.current = projectedPins;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const storyRefsRef = useRef(new Map<string, HTMLDivElement>());
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

      // story panels: the map's own opacity envelope (Pin-5-aware) caps every story weight, so
      // no story can outlive the map itself — see computeMapOpacity in journeyCamera.ts
      const fade = reducedMotion ? REDUCED_FADE : MOTION_FADE;
      const mapOpacity = computeMapOpacity(progress, fade);
      const storyWeights = deriveStoryWeights(frame);
      for (let i = 0; i < hanoiJourneyPins.length; i++) {
        const panelEl = storyRefsRef.current.get(hanoiJourneyPins[i].id);
        if (!panelEl) continue;
        const weight = storyWeights[i] * mapOpacity;
        const visible = weight > 0.5;
        panelEl.style.opacity = String(weight);
        panelEl.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * STORY_SLIDE_PX}px)`;
        panelEl.style.pointerEvents = visible ? "auto" : "none";
        panelEl.setAttribute("aria-hidden", visible ? "false" : "true");
        // set as a DOM property, not a JSX prop — see JourneyPinStoryPanel's comment on why
        panelEl.inert = !visible;
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

  const registerStoryRef = useCallback(
    (pinId: string) => (el: HTMLDivElement | null) => {
      if (el) storyRefsRef.current.set(pinId, el);
      else storyRefsRef.current.delete(pinId);
    },
    []
  );

  const clampedActiveIndex = Math.max(0, Math.min(hanoiJourneyPins.length - 1, activePinIndex));

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
            onSelectPin={onSelectPin}
            riverPathD={riverPathD}
            lakePathD={lakePathD}
            roadsPathD={roadsPathD}
            // deliberately hardcoded true, independent of the real reducedMotion prop above (which
            // instead governs *this* component's own camera/story motion): it suppresses MapPin's
            // infinite pulse on the active pin and keeps the route reveal instant rather than
            // replaying its own 1.1s transition on every scroll-driven progressOverride change
            reducedMotion
            progressOverride={deriveRouteProgress(activePinIndex)}
            settled
            pinsInteractive
          />
        </div>
      </div>

      {hanoiJourneyPins.map((pin, index) => (
        <JourneyPinStoryPanel
          key={pin.id}
          ref={registerStoryRef(pin.id)}
          pin={pin}
          loadMedia={Math.abs(index - clampedActiveIndex) <= 1}
        />
      ))}
    </div>
  );
});
