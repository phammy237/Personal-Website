"use client";
import { forwardRef, useMemo } from "react";
import { geoMercator } from "d3-geo";
import type { FeatureCollection, Point } from "geojson";
import { HanoiMap, HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT, type ProjectedPin } from "@/components/biography/HanoiMap";
import { usJourneyPins } from "@/data/usJourney";

// Same generous continental-scale margin the existing (untouched) /biography U.S. map projects
// with — reused here so this overview reads identically, without importing that component's own
// useJourneyState-driven click-stepping controller.
const MARGIN = 180;

const noopSelect = () => {};
const allUnvisited = () => "unvisited" as const;
// guaranteed not to match any real pin id, so no pin ever renders as "active" here
const NO_ACTIVE_PIN = "";

type JourneyUsMapStageProps = {
  reducedMotion: boolean;
};

/**
 * The existing U.S. map renderer (HanoiMap, reused generically — it already only assumes a
 * projected-pin shape) in a stable, neutral state: every pin "unvisited", none active, no story,
 * no drag/wheel-zoom (`settled`). Persistently mounted alongside the Earth/Hanoi block; only its
 * own opacity is ever toggled by GeographicJourney, matching the pattern JourneyHanoiMapStage and
 * JourneyEarthStage already established.
 */
export const JourneyUsMapStage = forwardRef<HTMLDivElement, JourneyUsMapStageProps>(function JourneyUsMapStage(
  { reducedMotion },
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
      <div className="w-full max-w-[1000px] md:w-[82vw]">
        <HanoiMap
          pins={projectedPins}
          activePinId={NO_ACTIVE_PIN}
          statusFor={allUnvisited}
          onSelectPin={noopSelect}
          reducedMotion={reducedMotion}
          progressOverride={0}
          settled
          pinsInteractive={false}
        />
      </div>
    </div>
  );
});
