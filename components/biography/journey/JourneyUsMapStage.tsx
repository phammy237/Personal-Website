"use client";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoMercator } from "d3-geo";
import type { FeatureCollection, Point } from "geojson";
import { HanoiMap, HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT, type ProjectedPin } from "@/components/biography/HanoiMap";
import type { PinStatus } from "@/components/biography/MapPin";
import { JourneyUsStoryPanel } from "@/components/biography/journey/JourneyUsStoryPanel";
import { usJourneyPins } from "@/data/usJourney";
import {
  RIVERMONT_PIN_ID,
  computeUsCameraFrame,
  deriveRivermontStoryWeight,
  lerpComposition,
  resolveUsComposition,
  resolveUsReducedComposition,
  toUsMapPinStatus,
  type UsMapStageHandle,
} from "@/lib/biography/usCamera";

// Same generous continental-scale margin the existing (untouched) /biography U.S. map projects
// with — reused here so this overview reads identically, without importing that component's own
// useJourneyState-driven click-stepping controller.
const MARGIN = 180;
/** below this measured container width, use the mobile focus/composition instead of desktop's */
const MOBILE_WIDTH_THRESHOLD = 640;

const noopSelect = () => {};
// no pin is ever click-activated in Phase 8 — HanoiMap only exposes a single interactivity toggle
// for every pin at once, and enabling Rivermont without also activating Gainesville would need a
// per-pin capability the shared renderer doesn't have yet (see the Phase 8 report)
const PINS_INTERACTIVE = false;

const RIVERMONT_PIN_DATA = usJourneyPins[0];

type JourneyUsMapStageProps = {
  reducedMotion: boolean;
  handleRef: React.MutableRefObject<UsMapStageHandle | null>;
};

/**
 * The existing U.S. map renderer (HanoiMap, reused generically) plus Rivermont's story panel,
 * persistently mounted across us-overview → rivermont-approach → rivermont-story (and held, inert,
 * through every later not-yet-implemented U.S. stage). GeographicJourney only ever toggles this
 * stage's outer opacity/scale (unchanged from Phase 7) and calls `handleRef.updateCamera(progress)`
 * every scroll tick; camera, pin status, and story visibility are all resolved right here from the
 * same camera frame, imperatively, so a scroll tick never re-renders GeographicJourney's own tree —
 * the same division of responsibility Phase 6's JourneyHanoiMapStage already established.
 */
export const JourneyUsMapStage = forwardRef<HTMLDivElement, JourneyUsMapStageProps>(function JourneyUsMapStage(
  { reducedMotion, handleRef },
  ref
) {
  const projectedPins = useMemo(() => {
    const pinFeatureCollection: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: usJourneyPins.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.coordinates.lon, p.coordinates.lat] },
      })),
    };

    const projection = geoMercator().fitExtent(
      [
        [MARGIN, MARGIN],
        [HANOI_MAP_WIDTH - MARGIN, HANOI_MAP_HEIGHT - MARGIN],
      ],
      pinFeatureCollection
    );

    const projected: ProjectedPin[] = usJourneyPins.map((p) => {
      const point = projection([p.coordinates.lon, p.coordinates.lat]);
      return {
        id: p.id,
        number: p.number,
        title: p.title,
        subtitle: p.subtitle,
        x: point ? (point[0] / HANOI_MAP_WIDTH) * 100 : 50,
        y: point ? (point[1] / HANOI_MAP_HEIGHT) * 100 : 50,
      };
    });
    return projected;
  }, []);
  const projectedPinsRef = useRef(projectedPins);
  projectedPinsRef.current = projectedPins;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);
  // cached from the measured container, not read on every scroll tick — only on mount + resize
  const sizeRef = useRef({ width: 1000, height: 820 });
  const isMobileRef = useRef(false);

  const [cursor, setCursor] = useState<-1 | 0>(-1);
  const cursorRef = useRef<-1 | 0>(-1);

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
      const frame = computeUsCameraFrame(progress);

      if (frame.cursor !== cursorRef.current) {
        cursorRef.current = frame.cursor;
        setCursor(frame.cursor);
      }

      const el = cameraRef.current;
      if (el) {
        if (reducedMotion) {
          // restrained near-static shift: a discrete, smaller-amplitude composition rather than a
          // continuous scroll-driven pan/zoom — still marks the neutral → active change, per the
          // Phase 8 reduced-motion requirement
          const composition = resolveUsReducedComposition(frame.cursor, projectedPinsRef.current, sizeRef.current, isMobileRef.current);
          el.style.transform = `translate(${composition.dx}px, ${composition.dy}px) scale(${composition.scale})`;
        } else {
          const to = resolveUsComposition(frame.toId, projectedPinsRef.current, sizeRef.current, isMobileRef.current);
          const composition =
            frame.fromId === frame.toId
              ? to
              : lerpComposition(
                  resolveUsComposition(frame.fromId, projectedPinsRef.current, sizeRef.current, isMobileRef.current),
                  to,
                  frame.t
                );
          el.style.transform = `translate(${composition.dx}px, ${composition.dy}px) scale(${composition.scale})`;
        }
      }

      const panelEl = storyRef.current;
      if (panelEl) {
        const weight = deriveRivermontStoryWeight(progress);
        const visible = weight > 0.5;
        panelEl.style.opacity = String(weight);
        panelEl.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * 24}px)`;
        panelEl.style.pointerEvents = visible ? "auto" : "none";
        panelEl.setAttribute("aria-hidden", visible ? "false" : "true");
        // DOM property, not a JSX prop — see JourneyPinStoryPanel's identical comment on why
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
    (id: string): PinStatus => (id === RIVERMONT_PIN_ID ? toUsMapPinStatus(cursor) : "unvisited"),
    [cursor]
  );
  // no real pin id while cursor is -1 (neutral us-overview) — keeps PinLabel's own "active" styling
  // in sync with statusFor instead of prematurely bolding Rivermont's label before its stage starts
  const activePinId = cursor >= 0 ? RIVERMONT_PIN_ID : "";

  return (
    <div
      ref={ref}
      role="region"
      aria-label="United States overview map"
      aria-hidden="true"
      data-stage-id="us-overview"
      style={{ opacity: 0, pointerEvents: "none" }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden px-6"
    >
      <div ref={containerRef} className="w-full max-w-[1000px] md:w-[82vw]">
        <div ref={cameraRef} style={{ transformOrigin: "50% 50%", willChange: "transform" }}>
          <HanoiMap
            pins={projectedPins}
            activePinId={activePinId}
            statusFor={statusFor}
            onSelectPin={noopSelect}
            reducedMotion={reducedMotion}
            progressOverride={0}
            settled
            pinsInteractive={PINS_INTERACTIVE}
          />
        </div>
      </div>

      <JourneyUsStoryPanel ref={storyRef} pin={RIVERMONT_PIN_DATA} />
    </div>
  );
});
