"use client";
import { useMemo } from "react";
import { geoMercator } from "d3-geo";
import { useReducedMotion } from "framer-motion";
import type { FeatureCollection, Point } from "geojson";
import { usJourneyCopy, usJourneyPins } from "@/data/usJourney";
import { useJourneyState } from "@/lib/hooks/useJourneyState";
import { HanoiMap, HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT, type ProjectedPin } from "@/components/biography/HanoiMap";
import { JourneyProgress } from "@/components/biography/JourneyProgress";
import { JourneyLegend } from "@/components/biography/JourneyLegend";

// Two widely-spaced points at continental scale — a generous margin keeps them
// from sitting flush against the map's edges the way Hanoi's dense cluster doesn't need to.
const MARGIN = 180;

/**
 * Phase 1: static map, pins, and route only. Preview cards, the story modal,
 * and the chapter checkpoint/interlude flow land in later phases — see
 * HanoiJourneySection for the fuller pattern this will grow into.
 */
export function USJourneySection() {
  const journey = useJourneyState(usJourneyPins);
  const prefersReducedMotion = useReducedMotion();

  const projectedPins = useMemo(() => {
    const pinFeatureCollection: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: journey.pins.map((p) => ({
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

    const projected: ProjectedPin[] = journey.pins.map((p) => {
      const point = projection([p.coordinates.lon, p.coordinates.lat]);
      return {
        ...p,
        x: point ? (point[0] / HANOI_MAP_WIDTH) * 100 : 50,
        y: point ? (point[1] / HANOI_MAP_HEIGHT) * 100 : 50,
      };
    });

    return projected;
  }, [journey.pins]);

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border bg-[#F7F3FA] p-5 shadow-sm dark:border-white/10 dark:bg-[#18233F] md:p-8"
      aria-label="United States journey map"
    >
      <div className="relative z-10 mb-5 flex flex-wrap items-start justify-between gap-4 md:mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{usJourneyCopy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-surface dark:text-white md:text-4xl">{usJourneyCopy.heading}</h2>
          <p className="mt-1.5 font-body text-sm text-muted dark:text-white/50">{usJourneyCopy.instruction}</p>
        </div>
        <JourneyProgress index={journey.activeIndex} total={journey.total} />
      </div>

      <div className="relative">
        {/* No real geo backdrop for the U.S. chapter yet — HanoiMap's river/road/lake
            props are optional, so it renders cleanly without them. */}
        <HanoiMap
          pins={projectedPins}
          activePinId={journey.activePin.id}
          statusFor={journey.statusFor}
          onSelectPin={journey.selectById}
          reducedMotion={!!prefersReducedMotion}
        />
        <JourneyLegend className="absolute bottom-4 left-4 hidden md:inline-flex" />
      </div>
    </section>
  );
}
