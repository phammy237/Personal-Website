"use client";
import { useEffect, useRef } from "react";
import { computeJourneyVignetteState } from "@/lib/biography/journeyVignette";

export type JourneyEdgeFadeHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved. `modalOpen` dampens the
   *  edges while the story modal's own backdrop is already dimming the screen —
   *  computeJourneyVignetteState itself is untouched, this only changes how much of its output
   *  actually reaches the DOM. */
  update: (progress: number, modalOpen?: boolean) => void;
};

// "Stronger but elegant edge falloff... center fully visible, middle slight darkening, outer
// 12-18% noticeably darker." ONE shared radial gradient (exact spec values) plus a subtle left/
// right cinematic falloff for wide viewports, where an ellipse alone under-darkens the far
// left/right edges — still one reused vignette system, not a second one.
const EDGE_FADE_GRADIENT =
  "radial-gradient(ellipse at center, rgba(4,7,18,0) 50%, rgba(4,7,18,0.10) 66%, rgba(4,7,18,0.30) 82%, rgba(3,5,14,0.58) 100%)";
const SIDE_FADE_GRADIENT =
  "linear-gradient(to right, rgba(3,5,14,0.20) 0%, transparent 13%, transparent 87%, rgba(3,5,14,0.26) 100%)";
// bottomOpacity's own known max across every stage (OVERVIEW_STATE) — used to normalize the
// existing, already-tuned per-stage intensity curve down to a single 0-1 driver for this one layer.
const INTENSITY_NORMALIZER = 0.4;

/**
 * Editorial-atlas edge fade — a single gentle radial falloff, stage-specific, never a permanent
 * full-screen darkening. Opacity driven by computeJourneyVignetteState(progress) (locked, reused
 * as-is — only how its output is consumed here has changed). At the Earth stage the value is 0, so
 * the hero scene renders completely open; the edge only appears once real map geography is on
 * screen. Sits above the MapLibre canvas and below every text/UI layer (z-[8]) so it only ever
 * visually affects the map, never the hero copy, story panel, navbar, or rail.
 */
export function JourneyEdgeFade({ handleRef }: { handleRef: React.MutableRefObject<JourneyEdgeFadeHandle | null> }) {
  const edgeRef = useRef<HTMLDivElement | null>(null);
  const sideRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRef.current = {
      update: (progress, modalOpen) => {
        const state = computeJourneyVignetteState(progress);
        const dampen = modalOpen ? 0.35 : 1;
        const intensity = Math.min(1, state.bottomOpacity / INTENSITY_NORMALIZER);
        const opacity = String(intensity * dampen);
        if (edgeRef.current) edgeRef.current.style.opacity = opacity;
        if (sideRef.current) sideRef.current.style.opacity = opacity;
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[8]">
      <div ref={edgeRef} className="absolute inset-0" style={{ background: EDGE_FADE_GRADIENT, opacity: 0 }} />
      <div ref={sideRef} className="absolute inset-0" style={{ background: SIDE_FADE_GRADIENT, opacity: 0 }} />
    </div>
  );
}
