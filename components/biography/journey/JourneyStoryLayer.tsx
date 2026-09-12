"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { computeHanoiCameraFrame, deriveStoryWeights } from "@/lib/biography/hanoiCamera";
import { deriveRivermontStoryWeight, deriveGainesvilleStoryWeight, deriveUsMemoriesWeight } from "@/lib/biography/usCamera";
import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { usJourneyPins, usMemoryMarkers } from "@/data/usJourney";
import { JourneyPinStoryPanel } from "@/components/biography/journey/JourneyPinStoryPanel";
import { JourneyUsStoryPanel } from "@/components/biography/journey/JourneyUsStoryPanel";
import { JourneyUsMemoriesPanel } from "@/components/biography/journey/JourneyUsMemoriesPanel";

export type JourneyStoryLayerHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

/** restrained entrance slide for the story panels — skipped entirely under reduced motion */
const STORY_SLIDE_PX = 24;
/** only the active location ± this many neighbors actually load real media — matches the existing
 *  "don't eagerly load every image" rule from the Hanoi panel's own original design */
const LOAD_MEDIA_NEIGHBOR_RADIUS = 1;

/** combined index across the 7 numbered locations: Hanoi pins 0-4, Rivermont 5, Gainesville 6 */
const RIVERMONT_INDEX = 5;
const GAINESVILLE_INDEX = 6;

const RIVERMONT_PIN_DATA = usJourneyPins[0];
const GAINESVILLE_PIN_DATA = usJourneyPins[1];

/**
 * Owns every location's story panel (5 Hanoi + Rivermont + Gainesville + the us-memories beat) and
 * their scroll-driven opacity/slide-in, replacing the per-map-stage wiring the old
 * JourneyHanoiMapStage/JourneyUsMapStage components used to own. GeographicJourney calls
 * handleRef.current.update(progress) once per scroll tick, alongside its other single-source-of-
 * truth updates (camera, pin status, route progress) — this introduces no new scroll listener.
 *
 * Reuses the exact same story-weight math (deriveStoryWeights/deriveRivermontStoryWeight/etc.)
 * those old components already called — none of that renderer-agnostic logic changed, only where
 * its output gets applied.
 */
export function JourneyStoryLayer({
  handleRef,
  reducedMotion,
}: {
  handleRef: React.MutableRefObject<JourneyStoryLayerHandle | null>;
  reducedMotion: boolean;
}) {
  const hanoiRefs = useRef<Array<HTMLDivElement | null>>([null, null, null, null, null]);
  const rivermontRef = useRef<HTMLDivElement | null>(null);
  const gainesvilleRef = useRef<HTMLDivElement | null>(null);
  const memoriesRef = useRef<HTMLDivElement | null>(null);

  // which locations currently load real media (active ± 1) — real React state, since it decides
  // whether <img>/<video> tags exist at all, unlike the purely-imperative opacity/transform below
  const [loadMediaIndex, setLoadMediaIndex] = useState<number>(-1);
  const loadMediaIndexRef = useRef(loadMediaIndex);
  loadMediaIndexRef.current = loadMediaIndex;

  useEffect(() => {
    const applyStoryWeight = (panelEl: HTMLDivElement | null, weight: number) => {
      if (!panelEl) return;
      const visible = weight > 0.5;
      panelEl.style.opacity = String(weight);
      panelEl.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * STORY_SLIDE_PX}px)`;
      panelEl.style.pointerEvents = visible ? "auto" : "none";
      panelEl.setAttribute("aria-hidden", visible ? "false" : "true");
      // DOM property, not a JSX prop — React 18 doesn't recognize `inert` as boolean-attribute-able
      panelEl.inert = !visible;
    };

    handleRef.current = {
      update: (progress) => {
        const frame = computeHanoiCameraFrame(progress);
        const weights = deriveStoryWeights(frame);
        weights.forEach((w, i) => applyStoryWeight(hanoiRefs.current[i], w));

        const rivermontWeight = deriveRivermontStoryWeight(progress);
        const gainesvilleWeight = deriveGainesvilleStoryWeight(progress);
        applyStoryWeight(rivermontRef.current, rivermontWeight);
        applyStoryWeight(gainesvilleRef.current, gainesvilleWeight);
        applyStoryWeight(memoriesRef.current, deriveUsMemoriesWeight(progress));

        let activeIndex = -1;
        if (frame.pinCursor >= 0 && frame.pinCursor <= 4) activeIndex = frame.pinCursor;
        else if (rivermontWeight > 0.5) activeIndex = RIVERMONT_INDEX;
        else if (gainesvilleWeight > 0.5) activeIndex = GAINESVILLE_INDEX;
        if (activeIndex !== loadMediaIndexRef.current) {
          loadMediaIndexRef.current = activeIndex;
          setLoadMediaIndex(activeIndex);
        }
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  const shouldLoad = useCallback(
    (index: number) => loadMediaIndex >= 0 && Math.abs(index - loadMediaIndex) <= LOAD_MEDIA_NEIGHBOR_RADIUS,
    [loadMediaIndex]
  );

  return (
    <>
      {hanoiJourneyPins.map((pin, i) => (
        <JourneyPinStoryPanel
          key={pin.id}
          ref={(el) => {
            hanoiRefs.current[i] = el;
          }}
          pin={pin}
          loadMedia={shouldLoad(i)}
        />
      ))}
      <JourneyUsStoryPanel ref={rivermontRef} pin={RIVERMONT_PIN_DATA} loadMedia={shouldLoad(RIVERMONT_INDEX)} />
      <JourneyUsStoryPanel ref={gainesvilleRef} pin={GAINESVILLE_PIN_DATA} loadMedia={shouldLoad(GAINESVILLE_INDEX)} />
      <JourneyUsMemoriesPanel ref={memoriesRef} markers={usMemoryMarkers} loadMedia={shouldLoad(GAINESVILLE_INDEX)} />
    </>
  );
}
