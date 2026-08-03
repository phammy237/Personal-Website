"use client";
import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { useReducedMotion } from "framer-motion";
import type { FeatureCollection, Point } from "geojson";
import { hanoiJourneyCopy } from "@/data/hanoiJourney";
import { useJourneyState } from "@/lib/hooks/useJourneyState";
import { useGeoJson } from "@/lib/hooks/useGeoJson";
import { HanoiMap, HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT, type ProjectedPin } from "@/components/biography/HanoiMap";
import { PinPreviewCard } from "@/components/biography/PinPreviewCard";
import { MobilePreviewSheet } from "@/components/biography/MobilePreviewSheet";
import { JourneyProgress } from "@/components/biography/JourneyProgress";
import { JourneyLegend } from "@/components/biography/JourneyLegend";

const MARGIN = 90;

export function HanoiJourneySection({ onLearnMore }: { onLearnMore?: (pinId: string) => void }) {
  const journey = useJourneyState();
  const riverData = useGeoJson("/data/hanoi-river.json");
  const lakeData = useGeoJson("/data/west-lake.json");
  const prefersReducedMotion = useReducedMotion();

  const { projectedPins, riverPathD, lakePathD } = useMemo(() => {
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
    const pathGen = geoPath(projection);

    const projectedPins: ProjectedPin[] = journey.pins.map((p) => {
      const point = projection([p.coordinates.lon, p.coordinates.lat]);
      return {
        ...p,
        x: point ? (point[0] / HANOI_MAP_WIDTH) * 100 : 50,
        y: point ? (point[1] / HANOI_MAP_HEIGHT) * 100 : 50,
      };
    });

    return {
      projectedPins,
      riverPathD: riverData ? (pathGen(riverData.features[0] as never) ?? undefined) : undefined,
      lakePathD: lakeData ? (pathGen(lakeData.features[0] as never) ?? undefined) : undefined,
    };
  }, [journey.pins, riverData, lakeData]);

  const handleLearnMore = () => {
    journey.markActiveCompleted();
    onLearnMore?.(journey.activePin.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      journey.next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      journey.prev();
    }
  };

  return (
    <section
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden rounded-3xl border border-border bg-[#FBFAFF] p-5 shadow-sm dark:border-white/10 dark:bg-[#0A0916] md:p-8"
      aria-label="Hanoi journey map"
    >
      <div className="relative z-10 mb-5 flex flex-wrap items-start justify-between gap-4 md:mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{hanoiJourneyCopy.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-surface dark:text-white md:text-4xl">{hanoiJourneyCopy.heading}</h2>
          <p className="mt-1.5 font-body text-sm text-muted dark:text-white/50">{hanoiJourneyCopy.instruction}</p>
        </div>
        <JourneyProgress index={journey.activeIndex} total={journey.total} />
      </div>

      <div className="relative">
        <HanoiMap
          pins={projectedPins}
          activePinId={journey.activePin.id}
          statusFor={journey.statusFor}
          onSelectPin={journey.selectById}
          riverPathD={riverPathD}
          lakePathD={lakePathD}
          reducedMotion={!!prefersReducedMotion}
        />

        {/* desktop floating preview card */}
        <div className="absolute right-4 top-1/2 hidden w-[300px] -translate-y-1/2 lg:block xl:w-[320px]">
          <PinPreviewCard
            pin={journey.activePin}
            index={journey.activeIndex}
            total={journey.total}
            onLearnMore={handleLearnMore}
            onPrev={journey.prev}
            onNext={journey.next}
            canPrev={journey.canPrev}
            canNext={journey.canNext}
          />
        </div>

        <JourneyLegend className="absolute bottom-4 left-4 hidden md:inline-flex" />
      </div>

      {/* tablet/below-lg: preview card sits under the map instead of floating over it */}
      <div className="mt-5 hidden md:block lg:hidden">
        <PinPreviewCard
          pin={journey.activePin}
          index={journey.activeIndex}
          total={journey.total}
          onLearnMore={handleLearnMore}
          onPrev={journey.prev}
          onNext={journey.next}
          canPrev={journey.canPrev}
          canNext={journey.canNext}
          className="max-w-md"
        />
      </div>

      <MobilePreviewSheet
        pin={journey.activePin}
        index={journey.activeIndex}
        total={journey.total}
        onLearnMore={handleLearnMore}
        onPrev={journey.prev}
        onNext={journey.next}
        canPrev={journey.canPrev}
        canNext={journey.canNext}
      />
    </section>
  );
}
