"use client";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { GlobeHero } from "@/components/biography/GlobeHero";
import { GLOBE_DEFAULT_DISTANCE, type GlobeViewState, type SatelliteGlobeHandle } from "@/components/biography/SatelliteGlobeCanvas";
import { useWorldTopology } from "@/lib/hooks/useWorldTopology";
import { chapters } from "@/data/biography";
import type { JourneyStageConfig } from "@/lib/biography/journeyTypes";

/** Vietnam/Hanoi — reused verbatim from the existing biography chapter data, not a new coordinate. */
const VIETNAM_TARGET = chapters[0].globeTarget;
const VIETNAM_COUNTRY_ID = chapters[0].countryId;

type JourneyEarthStageProps = {
  stage: JourneyStageConfig;
  initiallyActive: boolean;
  visible: boolean;
};

/**
 * Stage 1 of the journey, `earth-intro` — the real satellite globe (reused wholesale from the
 * `/biography` hero) instead of a JourneyPlaceholder. Same absolute-positioned, opacity/scale/y
 * driven shell as every other stage, so GeographicJourney's existing crossfade engine drives it
 * without knowing it's WebGL underneath; only the *content* differs from JourneyStage.
 *
 * Reduced motion isn't threaded in here separately — GlobeHero already detects it itself
 * (ambient is hardcoded off regardless, and the stage-level opacity-only crossfade is already
 * handled by GeographicJourney), so there's nothing left for this component to gate on.
 */
export const JourneyEarthStage = forwardRef<HTMLDivElement, JourneyEarthStageProps>(function JourneyEarthStage(
  { stage, initiallyActive, visible },
  ref
) {
  const countries = useWorldTopology();
  const handleRef = useRef<SatelliteGlobeHandle | null>(null);
  const [size, setSize] = useState(640);

  useEffect(() => {
    const compute = () => {
      const bound = Math.min(window.innerWidth, window.innerHeight);
      setSize(Math.round(Math.max(320, Math.min(900, bound * 0.82))));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Fixed, non-animated for this phase — Phase 4 will drive this via handleRef.setViewState
  // instead of replacing this object, keeping updates off the React render path entirely.
  const viewState: GlobeViewState = useMemo(
    () => ({ latitude: VIETNAM_TARGET.lat, longitude: VIETNAM_TARGET.lon, distance: GLOBE_DEFAULT_DISTANCE }),
    []
  );

  return (
    <div
      ref={ref}
      aria-hidden={!initiallyActive}
      data-stage-id={stage.id}
      style={{ opacity: initiallyActive ? 1 : 0, pointerEvents: initiallyActive ? "auto" : "none" }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <GlobeHero
        countries={countries}
        highlightCountryIds={[VIETNAM_COUNTRY_ID]}
        markers={[{ id: "hanoi", position: VIETNAM_TARGET, label: "Hanoi" }]}
        viewState={viewState}
        interactive
        ambient={false}
        wheelZoom={false}
        visible={visible}
        handleRef={handleRef}
        size={size}
        ariaLabel="Satellite view of Earth, Vietnam and Southeast Asia facing the viewer"
      />
      <p className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
        Drag to explore
      </p>
    </div>
  );
});
