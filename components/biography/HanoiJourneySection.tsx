"use client";
import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FeatureCollection, Point } from "geojson";
import { hanoiJourneyCopy } from "@/data/hanoiJourney";
import { useJourneyState } from "@/lib/hooks/useJourneyState";
import { useGeoJson } from "@/lib/hooks/useGeoJson";
import { HanoiMap, HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT, type ProjectedPin } from "@/components/biography/HanoiMap";
import { PinPreviewCard } from "@/components/biography/PinPreviewCard";
import { MobilePreviewSheet } from "@/components/biography/MobilePreviewSheet";
import { JourneyProgress } from "@/components/biography/JourneyProgress";
import { JourneyLegend } from "@/components/biography/JourneyLegend";
import { ChapterStoryModal } from "@/components/biography/ChapterStoryModal";
import { ChapterCheckpoint } from "@/components/biography/ChapterCheckpoint";
import { NotYetInterlude } from "@/components/biography/NotYetInterlude";

const MARGIN = 120;

type View = "map" | "checkpoint" | "interlude";

export function HanoiJourneySection({
  onLearnMore,
  onChapterComplete,
}: {
  onLearnMore?: (pinId: string) => void;
  /** called when the reader crosses the ocean at the end of the interlude — will drive the globe transition / U.S. chapter once that's built */
  onChapterComplete?: () => void;
}) {
  const journey = useJourneyState();
  const riverData = useGeoJson("/data/hanoi-river.json");
  const lakeData = useGeoJson("/data/west-lake.json");
  const roadsData = useGeoJson("/data/hanoi-roads.json");
  const prefersReducedMotion = useReducedMotion();

  const { projectedPins, riverPathD, lakePathD, roadsPathD } = useMemo(() => {
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

    const roadsPathD = roadsData
      ? roadsData.features
          .map((f) => pathGen(f as never))
          .filter((d): d is string => !!d)
          .join(" ")
      : undefined;

    return {
      projectedPins,
      riverPathD: riverData ? (pathGen(riverData.features[0] as never) ?? undefined) : undefined,
      lakePathD: lakeData ? (pathGen(lakeData.features[0] as never) ?? undefined) : undefined,
      roadsPathD: roadsPathD || undefined,
    };
  }, [journey.pins, riverData, lakeData, roadsData]);

  const [storyOpen, setStoryOpen] = useState(false);
  const [pendingCheckpoint, setPendingCheckpoint] = useState(false);
  const [view, setView] = useState<View>("map");

  const handleLearnMore = () => {
    const willCompleteAll =
      !journey.completedIds.includes(journey.activePin.id) && journey.completedIds.length + 1 === journey.total;
    journey.markActiveCompleted();
    setStoryOpen(true);
    if (willCompleteAll) setPendingCheckpoint(true);
    onLearnMore?.(journey.activePin.id);
  };

  const handleCloseStory = () => {
    setStoryOpen(false);
    if (pendingCheckpoint) {
      setPendingCheckpoint(false);
      setView("checkpoint");
    }
  };

  const handleStay = () => setView("map");
  const handleContinue = () => setView("interlude");
  // no U.S. chapter to skip to yet, so "skip directly" leads to the same interlude for now
  const handleSkip = () => setView("interlude");
  const handleCrossOcean = () => {
    if (onChapterComplete) {
      onChapterComplete();
    } else {
      setView("map"); // temporary: return to the settled map until the globe transition / U.S. chapter exists
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (view !== "map") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      journey.next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      journey.prev();
    }
  };

  const journeyEnded = view === "checkpoint" || view === "interlude";
  const pinStatusFor = journeyEnded ? () => "completed" as const : journey.statusFor;

  if (view === "interlude") {
    return <NotYetInterlude onCrossOcean={handleCrossOcean} />;
  }

  return (
    <section
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden rounded-3xl border border-border bg-[#F7F3FA] p-5 shadow-sm dark:border-white/10 dark:bg-[#18233F] md:p-8"
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

      <motion.div className="relative" animate={{ scale: view === "checkpoint" ? 0.96 : 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
        <HanoiMap
          pins={projectedPins}
          activePinId={journey.activePin.id}
          statusFor={pinStatusFor}
          onSelectPin={journey.selectById}
          riverPathD={riverPathD}
          lakePathD={lakePathD}
          roadsPathD={roadsPathD}
          reducedMotion={!!prefersReducedMotion}
          progressOverride={view === "checkpoint" ? 1 : undefined}
          settled={view === "checkpoint"}
        />

        {/* desktop floating panel: pin preview, or the end-of-chapter checkpoint */}
        <div className="absolute right-4 top-1/2 hidden w-[300px] -translate-y-1/2 lg:block xl:w-[320px]">
          <AnimatePresence mode="wait">
            {view === "checkpoint" ? (
              <ChapterCheckpoint key="checkpoint" onContinue={handleContinue} onStay={handleStay} onSkip={handleSkip} />
            ) : (
              <PinPreviewCard
                key="preview"
                pin={journey.activePin}
                index={journey.activeIndex}
                total={journey.total}
                onLearnMore={handleLearnMore}
                onPrev={journey.prev}
                onNext={journey.next}
                canPrev={journey.canPrev}
                canNext={journey.canNext}
              />
            )}
          </AnimatePresence>
        </div>

        <JourneyLegend className="absolute bottom-4 left-4 hidden md:inline-flex" />
      </motion.div>

      {/* tablet/below-lg: panel sits under the map instead of floating over it */}
      <div className="mt-5 hidden md:block lg:hidden">
        {view === "checkpoint" ? (
          <ChapterCheckpoint onContinue={handleContinue} onStay={handleStay} onSkip={handleSkip} className="max-w-md" />
        ) : (
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
        )}
      </div>

      {view === "checkpoint" ? (
        <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
          <ChapterCheckpoint
            onContinue={handleContinue}
            onStay={handleStay}
            onSkip={handleSkip}
            className="rounded-b-none rounded-t-2xl border-b-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
          />
        </div>
      ) : (
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
      )}

      <AnimatePresence>
        {storyOpen && (
          <ChapterStoryModal
            pin={journey.activePin}
            index={journey.activeIndex}
            total={journey.total}
            onClose={handleCloseStory}
            onPrev={journey.prev}
            onNext={journey.next}
            canPrev={journey.canPrev}
            canNext={journey.canNext}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
