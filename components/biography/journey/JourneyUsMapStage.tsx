"use client";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoMercator } from "d3-geo";
import type { FeatureCollection, Point } from "geojson";
import { HanoiMap, HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT, type ProjectedPin } from "@/components/biography/HanoiMap";
import type { PinStatus } from "@/components/biography/MapPin";
import { JourneyUsStoryPanel } from "@/components/biography/journey/JourneyUsStoryPanel";
import { JourneyUsMemoriesPanel } from "@/components/biography/journey/JourneyUsMemoriesPanel";
import { usJourneyPins, usMemoryMarkers } from "@/data/usJourney";
import {
  DOMESTIC_ROUTE_WAYPOINTS,
  GAINESVILLE_PIN_ID,
  RIVERMONT_PIN_ID,
  computeUsJourneyFrame,
  lerpComposition,
  resolveUsComposition,
  resolveUsReducedComposition,
  toUsMapPinStatus,
  type UsMapStageHandle,
} from "@/lib/biography/usCamera";
import type { JourneyPinStatus } from "@/lib/biography/hanoiCamera";

// Same generous continental-scale margin the existing (untouched) /biography U.S. map projects
// with — reused here so this overview reads identically, without importing that component's own
// useJourneyState-driven click-stepping controller.
const MARGIN = 180;
/** below this measured container width, use the mobile focus/composition instead of desktop's */
const MOBILE_WIDTH_THRESHOLD = 640;
/** restrained entrance slide for the story panels — skipped entirely under reduced motion */
const STORY_SLIDE_PX = 24;

const RIVERMONT_PIN_DATA = usJourneyPins[0];
const GAINESVILLE_PIN_DATA = usJourneyPins[1];

// Both real U.S. pins are interactive throughout Phase 9 (matching Hanoi's own established
// precedent of every pin being clickable regardless of its current status) — written as an
// explicit allowlist, not a bare `true`, so it automatically excludes any future non-numbered
// memory marker without needing another change here.
const isPinInteractive = (id: string) => id === RIVERMONT_PIN_ID || id === GAINESVILLE_PIN_ID;

type JourneyUsMapStageProps = {
  reducedMotion: boolean;
  handleRef: React.MutableRefObject<UsMapStageHandle | null>;
  /** scrolls the page to a stable point within the clicked pin's own story stage — this stage never
   *  sets camera, story, route, or status state directly, only requests the scroll (mirroring
   *  JourneyHanoiMapStage's onSelectPin) */
  onSelectPin: (pinId: string) => void;
};

/**
 * The existing U.S. map renderer (HanoiMap, reused generically) plus Rivermont's and Gainesville's
 * story panels and the domestic flight route, persistently mounted across us-overview through
 * gainesville-story (and held, inert, through every later not-yet-implemented U.S. stage).
 * GeographicJourney only ever toggles this stage's outer opacity/scale and calls
 * `handleRef.updateCamera(progress)` every scroll tick; camera, route/plane, pin status, and story
 * visibility are all resolved right here from the same journey frame, imperatively, so a scroll
 * tick never re-renders GeographicJourney's own tree — the same division of responsibility Phase 6
 * established for Hanoi.
 */
export const JourneyUsMapStage = forwardRef<HTMLDivElement, JourneyUsMapStageProps>(function JourneyUsMapStage(
  { reducedMotion, handleRef, onSelectPin },
  ref
) {
  const { projectedPins, routePathD, routePoints } = useMemo(() => {
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

    // domestic route: the same projection instance, so it aligns pixel-for-pixel with the pins
    // above — no second projection built anywhere for this
    const projectedRoute = DOMESTIC_ROUTE_WAYPOINTS.map((pt) => projection(pt) as [number, number] | null);
    let d = "";
    let penDown = false;
    for (const p of projectedRoute) {
      if (!p) {
        penDown = false;
        continue;
      }
      d += `${penDown ? "L" : "M"}${p[0]},${p[1]} `;
      penDown = true;
    }

    return { projectedPins: projected, routePathD: d || null, routePoints: projectedRoute };
  }, []);
  const projectedPinsRef = useRef(projectedPins);
  projectedPinsRef.current = projectedPins;
  const routePointsRef = useRef(routePoints);
  routePointsRef.current = routePoints;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const rivermontStoryRef = useRef<HTMLDivElement | null>(null);
  const gainesvilleStoryRef = useRef<HTMLDivElement | null>(null);
  const usMemoriesRef = useRef<HTMLDivElement | null>(null);
  const routeLineRef = useRef<SVGPathElement | null>(null);
  const planeRef = useRef<SVGGElement | null>(null);
  // cached from the measured container, not read on every scroll tick — only on mount + resize
  const sizeRef = useRef({ width: 1000, height: 820 });
  const isMobileRef = useRef(false);

  const [rivermontStatus, setRivermontStatus] = useState<JourneyPinStatus>("upcoming");
  const [gainesvilleStatus, setGainesvilleStatus] = useState<JourneyPinStatus>("upcoming");
  const rivermontStatusRef = useRef<JourneyPinStatus>("upcoming");
  const gainesvilleStatusRef = useRef<JourneyPinStatus>("upcoming");

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
      const frame = computeUsJourneyFrame(progress);

      if (frame.rivermontStatus !== rivermontStatusRef.current) {
        rivermontStatusRef.current = frame.rivermontStatus;
        setRivermontStatus(frame.rivermontStatus);
      }
      if (frame.gainesvilleStatus !== gainesvilleStatusRef.current) {
        gainesvilleStatusRef.current = frame.gainesvilleStatus;
        setGainesvilleStatus(frame.gainesvilleStatus);
      }

      const el = cameraRef.current;
      if (el) {
        if (reducedMotion) {
          // restrained near-static shift: a small discrete set of smaller-amplitude compositions
          // rather than a continuous scroll-driven pan/zoom
          const composition = resolveUsReducedComposition(progress, projectedPinsRef.current, sizeRef.current, isMobileRef.current);
          el.style.transform = `translate(${composition.dx}px, ${composition.dy}px) scale(${composition.scale})`;
        } else {
          const to = resolveUsComposition(frame.toId, projectedPinsRef.current, sizeRef.current, isMobileRef.current);
          const composition =
            frame.fromId === frame.toId
              ? to
              : lerpComposition(
                  resolveUsComposition(frame.fromId, projectedPinsRef.current, sizeRef.current, isMobileRef.current),
                  to,
                  frame.cameraT
                );
          el.style.transform = `translate(${composition.dx}px, ${composition.dy}px) scale(${composition.scale})`;
        }
      }

      // domestic route + plane — a single shared value (frame.routeProgress) drives both, so they
      // can never drift apart; the route's own stroke-dash reveal already hides it completely
      // before the flight starts, so no separate group-opacity fade is needed for the line itself
      if (routeLineRef.current) routeLineRef.current.style.strokeDashoffset = String(1 - frame.routeProgress);
      const pts = routePointsRef.current;
      if (planeRef.current && pts.length > 1) {
        const idx = frame.routeProgress * (pts.length - 1);
        const i0 = Math.min(pts.length - 2, Math.floor(idx));
        const a = pts[i0];
        const b = pts[i0 + 1];
        if (a && b) {
          const localT = idx - i0;
          const x = a[0] + (b[0] - a[0]) * localT;
          const y = a[1] + (b[1] - a[1]) * localT;
          const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
          // SVG's own `transform` attribute, not CSS `style.transform` — see AbstractGlobeFallback's
          // identical comment on why
          planeRef.current.setAttribute("transform", `translate(${x} ${y}) rotate(${angle})`);
        }
        planeRef.current.style.opacity = String(frame.planeOpacity);
      }

      const applyStoryWeight = (panelEl: HTMLDivElement | null, weight: number) => {
        if (!panelEl) return;
        const visible = weight > 0.5;
        panelEl.style.opacity = String(weight);
        panelEl.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * STORY_SLIDE_PX}px)`;
        panelEl.style.pointerEvents = visible ? "auto" : "none";
        panelEl.setAttribute("aria-hidden", visible ? "false" : "true");
        // DOM property, not a JSX prop — see JourneyPinStoryPanel's identical comment on why
        panelEl.inert = !visible;
      };
      applyStoryWeight(rivermontStoryRef.current, frame.rivermontStoryWeight);
      applyStoryWeight(gainesvilleStoryRef.current, frame.gainesvilleStoryWeight);
      applyStoryWeight(usMemoriesRef.current, frame.usMemoriesWeight);
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
      if (id === RIVERMONT_PIN_ID) return toUsMapPinStatus(rivermontStatus);
      if (id === GAINESVILLE_PIN_ID) return toUsMapPinStatus(gainesvilleStatus);
      return "unvisited";
    },
    [rivermontStatus, gainesvilleStatus]
  );
  // the pin currently marked "active" — never both, per the status table (there's a brief window
  // late in florida-flight where Rivermont has already completed and Gainesville isn't active yet)
  const activePinId = rivermontStatus === "active" ? RIVERMONT_PIN_ID : gainesvilleStatus === "active" ? GAINESVILLE_PIN_ID : "";

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
          <div className="relative">
            <HanoiMap
              pins={projectedPins}
              activePinId={activePinId}
              statusFor={statusFor}
              onSelectPin={onSelectPin}
              reducedMotion={reducedMotion}
              progressOverride={0}
              settled
              isPinInteractive={isPinInteractive}
            />
            {routePathD && (
              // decorative: the route/plane communicate no unique text of their own (the pins and
              // story panels already do), so this whole layer stays out of the accessibility tree
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-70 dark:opacity-80"
                viewBox={`0 0 ${HANOI_MAP_WIDTH} ${HANOI_MAP_HEIGHT}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  ref={routeLineRef}
                  d={routePathD}
                  fill="none"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  pathLength={1}
                  className="stroke-[#8A6FB0] dark:stroke-[#C9BAD9]"
                />
                <g ref={planeRef} style={{ opacity: 0 }}>
                  <path d="M 7 0 L -4 4 L -1.5 0 L -4 -4 Z" className="fill-accent dark:fill-[#F1EAF7]" />
                </g>
              </svg>
            )}
          </div>
        </div>
      </div>

      <JourneyUsStoryPanel ref={rivermontStoryRef} pin={RIVERMONT_PIN_DATA} />
      <JourneyUsStoryPanel ref={gainesvilleStoryRef} pin={GAINESVILLE_PIN_DATA} />
      <JourneyUsMemoriesPanel ref={usMemoriesRef} markers={usMemoryMarkers} />
    </div>
  );
});
