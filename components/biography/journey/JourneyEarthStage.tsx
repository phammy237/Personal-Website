"use client";
import { forwardRef, useEffect, useState } from "react";
import { GlobeHero } from "@/components/biography/GlobeHero";
import type { GlobeViewState, SatelliteGlobeHandle } from "@/components/biography/SatelliteGlobeCanvas";
import { useWorldTopology } from "@/lib/hooks/useWorldTopology";
import { chapters } from "@/data/biography";
import { APPROACH_CAMERA_KEYFRAMES } from "@/lib/biography/journeyCamera";

/** Vietnam/Hanoi — reused verbatim from the existing biography chapter data, not a new coordinate. */
const VIETNAM_TARGET = chapters[0].globeTarget;
const VIETNAM_COUNTRY_ID = chapters[0].countryId;
const INITIAL_VIEW_STATE: GlobeViewState = APPROACH_CAMERA_KEYFRAMES["earth-intro"];

type JourneyEarthStageProps = {
  /** populated with the globe's imperative handle once the scene mounts — GeographicJourney
   *  calls handleRef.current.setViewState(...) directly from its scroll-progress loop */
  handleRef: React.MutableRefObject<SatelliteGlobeHandle | null>;
  /** pauses the render loop (no unmount) once the globe is fully hidden behind the map */
  visible: boolean;
  /** drag/pinch/reset only make sense while the camera isn't under scroll control — true only
   *  during stable earth-intro */
  interactive: boolean;
};

/**
 * The persistent globe host for the whole Earth → Vietnam → Hanoi approach (spans four stage
 * slots: earth-intro through hanoi-overview). Reused wholesale from the `/biography` hero via
 * GlobeHero/SatelliteGlobeCanvas — mounted once, for the page's lifetime; GeographicJourney owns
 * all opacity/scale/camera choreography and drives it through refs, never remounting this.
 */
export const JourneyEarthStage = forwardRef<HTMLDivElement, JourneyEarthStageProps>(function JourneyEarthStage(
  { handleRef, visible, interactive },
  ref
) {
  const countries = useWorldTopology();
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

  return (
    <div
      ref={ref}
      aria-hidden="false"
      data-stage-id="earth-intro"
      style={{ opacity: 1, pointerEvents: "auto" }}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <GlobeHero
        countries={countries}
        highlightCountryIds={[VIETNAM_COUNTRY_ID]}
        markers={[{ id: "hanoi", position: VIETNAM_TARGET, label: "Hanoi" }]}
        viewState={INITIAL_VIEW_STATE}
        interactive={interactive}
        ambient={false}
        wheelZoom={false}
        visible={visible}
        handleRef={handleRef}
        size={size}
        ariaLabel="Satellite view of Earth approaching Vietnam and Hanoi"
      />
      {interactive && (
        <p className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
          Drag to explore
        </p>
      )}
    </div>
  );
});
