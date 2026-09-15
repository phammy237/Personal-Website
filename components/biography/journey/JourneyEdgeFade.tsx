"use client";
import { useEffect, useRef } from "react";
import { computeJourneyVignetteState } from "@/lib/biography/journeyVignette";

export type JourneyEdgeFadeHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved. `modalOpen` dampens the
   *  edges and fully suppresses the panel-side fade while the story modal's own backdrop is already
   *  dimming the screen — computeJourneyVignetteState itself is untouched, this only changes how
   *  much of its output actually reaches the DOM. */
  update: (progress: number, modalOpen?: boolean) => void;
};

const LEFT_FADE = "linear-gradient(to right, rgba(8,13,28,0.62) 0%, rgba(8,13,28,0.18) 18vw, transparent 32vw)";
const RIGHT_FADE = "linear-gradient(to left, rgba(8,13,28,0.42) 0%, rgba(8,13,28,0.1) 16vw, transparent 30vw)";
const TOP_FADE = "linear-gradient(to bottom, rgba(8,13,28,0.32) 0%, transparent 12vh)";
const BOTTOM_FADE = "linear-gradient(to top, rgba(8,13,28,0.48) 0%, transparent 16vh)";
// separate, stronger localized fade specifically for the open story panel — never used at Earth
const PANEL_FADE = "linear-gradient(to left, rgba(8,13,28,0.72) 0%, rgba(8,13,28,0.55) 12vw, rgba(8,13,28,0.15) 30vw, transparent 42vw)";

/**
 * Cinematic edge fade — stage-specific, never a permanent full-screen darkening. Five independent
 * pointer-events:none layers (left/right/top/bottom edges + a separate, stronger panel-side fade),
 * each opacity driven by computeJourneyVignetteState(progress) — the single source of truth for
 * "how much fade, on which edge, right now." At the Earth stage every value is 0, so the hero scene
 * renders completely open; edges only appear once real map geography is on screen. Sits above the
 * MapLibre canvas and below every text/UI layer (z-[8], same as before) so it only ever visually
 * affects the map, never the hero copy, story panel, navbar, or rail.
 */
export function JourneyEdgeFade({ handleRef }: { handleRef: React.MutableRefObject<JourneyEdgeFadeHandle | null> }) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRef.current = {
      update: (progress, modalOpen) => {
        const state = computeJourneyVignetteState(progress);
        const dampen = modalOpen ? 0.35 : 1;
        if (leftRef.current) leftRef.current.style.opacity = String(state.leftOpacity * dampen);
        if (rightRef.current) rightRef.current.style.opacity = String(state.rightOpacity * dampen);
        if (topRef.current) topRef.current.style.opacity = String(state.topOpacity * dampen);
        if (bottomRef.current) bottomRef.current.style.opacity = String(state.bottomOpacity * dampen);
        // built specifically for the preview card's asymmetric side framing — the modal's own
        // centered backdrop already dims the whole screen, so this would only double-darken it.
        if (panelRef.current) panelRef.current.style.opacity = modalOpen ? "0" : String(state.panelFadeOpacity);
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[8]">
      <div ref={leftRef} className="absolute inset-0" style={{ background: LEFT_FADE, opacity: 0 }} />
      <div ref={rightRef} className="absolute inset-0" style={{ background: RIGHT_FADE, opacity: 0 }} />
      <div ref={topRef} className="absolute inset-0" style={{ background: TOP_FADE, opacity: 0 }} />
      <div ref={bottomRef} className="absolute inset-0" style={{ background: BOTTOM_FADE, opacity: 0 }} />
      <div ref={panelRef} className="absolute inset-0" style={{ background: PANEL_FADE, opacity: 0 }} />
    </div>
  );
}
