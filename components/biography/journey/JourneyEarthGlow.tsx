"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { rampDownTo } from "@/lib/biography/journeyMotion";

export type JourneyEarthGlowHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

// Same window the Earth hero text and the "glowing Hanoi" anchor marker already fade out over
// (see GeographicJourney's HERO_FADE_COMPLETE_AT) — every Earth-only decoration resolves together.
const FADE_COMPLETE_AT = getStageById("hanoi-approach").start;

// Globe composition, matched to EARTH_PRESET/journeyMapPadding — center ~64vw/50vh, ~76vh diameter.
const GLOBE_LEFT = "64vw";
const GLOBE_DIAMETER = "76vh";

/**
 * Pure CSS/SVG decorative atmosphere around the MapLibre canvas — the things WebGL's own `sky`
 * config (mapStyle.ts) can't easily give it: a thin directional atmospheric rim, an outer bloom, a
 * large faint backlight, a masked lower-hemisphere shadow (so the now-photorealistic raster Earth
 * reads as a lit sphere, not a flat disc), a sparse star field, and a couple of ambient purple/
 * violet haze pockets. No image assets, no WebGL, no animation frameworks — pointer-events:none
 * layers, opacity driven by scroll progress. Deliberately behind the map canvas's own text/label
 * layers in stacking order, so it reads as space *around* the globe and light *on* it, never a
 * layer stuck flatly on top.
 */
export function JourneyEarthGlow({
  handleRef,
}: {
  handleRef: React.MutableRefObject<JourneyEarthGlowHandle | null>;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        el.style.opacity = String(rampDownTo(progress, FADE_COMPLETE_AT, FADE_COMPLETE_AT));
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    // z-[5]: above the map canvas (z-auto) so the semi-transparent bloom/haze actually composites
    // over the rendered globe instead of being fully hidden behind its opaque background fill —
    // still well below the z-20 text/story overlays.
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {/* B. OUTER BLOOM — cool lavender/blue, 30-60px-equivalent spread, strongest around the lit
          (upper) hemisphere. Sized close to the globe's own diameter, not a room-filling haze. */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[48px] dark:opacity-100"
        style={{
          left: GLOBE_LEFT,
          top: "50%",
          height: GLOBE_DIAMETER,
          width: GLOBE_DIAMETER,
          background: "radial-gradient(circle, rgba(142,107,255,0.16) 0%, rgba(120,140,255,0.07) 55%, transparent 75%)",
        }}
      />
      {/* C. LARGE BACKLIGHT — very large, faint, violet/indigo, extending well beyond the globe's
          own rim (unlike the bloom above, which hugs it closely). Biased upward, matching "top/
          upper-left/upper-right stronger, bottom darker." */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[90px] dark:opacity-55"
        style={{
          left: GLOBE_LEFT,
          top: "42vh",
          height: "calc(76vh + 220px)",
          width: "calc(76vh + 220px)",
          background: "radial-gradient(ellipse, rgba(110,120,255,0.13) 0%, transparent 62%)",
        }}
      />
      {/* A. ATMOSPHERIC RIM — a thin bright ring traced with an inset box-shadow (so it reads as a
          crisp edge-light, not another soft blur), masked by a conic gradient so it's only bright
          across the top/upper-left/upper-right arc and fades across the bottom — "the strongest
          halo should visually separate the top/right Earth edge from the dark background," without
          washing behind the headline (the mask keeps the lower-left/text-side arc essentially off). */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 dark:opacity-100"
        style={{
          left: GLOBE_LEFT,
          top: "50%",
          height: GLOBE_DIAMETER,
          width: GLOBE_DIAMETER,
          boxShadow: "inset 0 0 0 1.5px rgba(210,220,255,0.55), inset 0 0 22px 3px rgba(160,180,255,0.22)",
          WebkitMaskImage:
            "conic-gradient(from 0deg, rgba(0,0,0,1) 0deg, rgba(0,0,0,1) 75deg, rgba(0,0,0,0.05) 150deg, rgba(0,0,0,0.05) 230deg, rgba(0,0,0,1) 300deg, rgba(0,0,0,1) 360deg)",
          maskImage:
            "conic-gradient(from 0deg, rgba(0,0,0,1) 0deg, rgba(0,0,0,1) 75deg, rgba(0,0,0,0.05) 150deg, rgba(0,0,0,0.05) 230deg, rgba(0,0,0,1) 300deg, rgba(0,0,0,1) 360deg)",
        }}
      />
      {/* Lower-hemisphere shadow — masked to the globe's own circular silhouette (never a
          rectangular wash over the whole scene), a directional linear gradient from clear (top) to
          deep navy (bottom) so the raster Earth itself reads as a lit sphere with a real terminator,
          not flat. */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-0 dark:opacity-100"
        style={{ left: GLOBE_LEFT, top: "50%", height: GLOBE_DIAMETER, width: GLOBE_DIAMETER }}
      >
        <div
          className="h-full w-full"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, transparent 38%, rgba(5,8,16,0.3) 72%, rgba(5,8,16,0.5) 100%)",
          }}
        />
      </div>
      {/* sparse scattered star field — ~18 tiny fixed dots, not a texture */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.22]"
        style={{
          backgroundImage: [
            "radial-gradient(1px 1px at 12% 18%, rgba(244,241,251,0.9), transparent)",
            "radial-gradient(1px 1px at 26% 64%, rgba(244,241,251,0.7), transparent)",
            "radial-gradient(1.5px 1.5px at 41% 32%, rgba(244,241,251,0.8), transparent)",
            "radial-gradient(1px 1px at 58% 76%, rgba(244,241,251,0.6), transparent)",
            "radial-gradient(1px 1px at 72% 14%, rgba(244,241,251,0.9), transparent)",
            "radial-gradient(1.5px 1.5px at 85% 52%, rgba(244,241,251,0.7), transparent)",
            "radial-gradient(1px 1px at 93% 84%, rgba(244,241,251,0.6), transparent)",
            "radial-gradient(1px 1px at 8% 88%, rgba(244,241,251,0.5), transparent)",
            "radial-gradient(1px 1px at 48% 6%, rgba(244,241,251,0.6), transparent)",
            "radial-gradient(1.5px 1.5px at 65% 92%, rgba(244,241,251,0.7), transparent)",
            "radial-gradient(1px 1px at 18% 42%, rgba(244,241,251,0.5), transparent)",
            "radial-gradient(1px 1px at 36% 88%, rgba(244,241,251,0.6), transparent)",
            "radial-gradient(1px 1px at 54% 22%, rgba(244,241,251,0.5), transparent)",
            "radial-gradient(1.5px 1.5px at 78% 68%, rgba(244,241,251,0.7), transparent)",
            "radial-gradient(1px 1px at 90% 30%, rgba(244,241,251,0.5), transparent)",
            "radial-gradient(1px 1px at 4% 55%, rgba(244,241,251,0.5), transparent)",
            "radial-gradient(1px 1px at 63% 8%, rgba(244,241,251,0.6), transparent)",
            "radial-gradient(1px 1px at 97% 60%, rgba(244,241,251,0.5), transparent)",
          ].join(","),
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* upper-left haze — top corners stronger, bottom left deliberately bare/darker */}
      <div
        className="absolute -left-[5%] -top-[10%] h-[40vh] w-[40vh] rounded-full opacity-0 blur-3xl dark:opacity-25"
        style={{ background: "radial-gradient(circle, rgba(142,107,255,0.22) 0%, transparent 70%)" }}
      />
      {/* upper-right haze, near the globe's own rim */}
      <div
        className="absolute -right-[6%] -top-[8%] h-[42vh] w-[42vh] rounded-full opacity-0 blur-3xl dark:opacity-28"
        style={{ background: "radial-gradient(circle, rgba(110,120,255,0.22) 0%, transparent 70%)" }}
      />
      {/* space background depth (section 13): a faint violet nebula-like haze to the right of the
          globe, and an extremely faint blue-violet haze lower-left — both well clear of the hero
          text column (roughly 0-30vw), which stays clean. */}
      <div
        className="absolute -right-[8%] top-[30%] h-[55vh] w-[55vh] rounded-full opacity-0 blur-3xl dark:opacity-[0.14]"
        style={{ background: "radial-gradient(circle, rgba(160,120,255,0.3) 0%, transparent 72%)" }}
      />
      <div
        className="absolute -bottom-[15%] left-[6%] h-[46vh] w-[46vh] rounded-full opacity-0 blur-3xl dark:opacity-[0.1]"
        style={{ background: "radial-gradient(circle, rgba(100,110,220,0.28) 0%, transparent 72%)" }}
      />
    </div>
  );
}
