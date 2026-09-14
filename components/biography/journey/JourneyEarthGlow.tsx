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

/**
 * Pure CSS/SVG decorative atmosphere around the MapLibre canvas — the things WebGL's own `sky`
 * config (mapStyle.ts) can't easily give it: a soft outer bloom, a faint scattered star field, and
 * a couple of ambient purple haze pockets. No image assets, no WebGL, no animation frameworks —
 * three absolutely-positioned, pointer-events:none layers, opacity driven by scroll progress.
 * Deliberately behind the map canvas and every text/label layer in stacking order (z-0), so it
 * reads as space *around* the globe rather than a texture stuck on top of it.
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
      {/* soft bloom sized close to the globe itself (not a room-filling haze) — a ~50-60px blurred
          spread just outside its rim, matching "30-60px soft spread, opacity low." */}
      <div
        className="absolute left-1/2 top-1/2 h-[62vh] w-[62vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-[50px] dark:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(142,107,255,0.16) 0%, rgba(142,107,255,0.06) 55%, transparent 75%)" }}
      />
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
      {/* one faint purple haze, lower-left */}
      <div
        className="absolute -left-[10%] -bottom-[12%] h-[45vh] w-[45vh] rounded-full opacity-0 blur-3xl dark:opacity-30"
        style={{ background: "radial-gradient(circle, rgba(142,107,255,0.22) 0%, transparent 70%)" }}
      />
      {/* one faint blue-violet haze, upper-right */}
      <div
        className="absolute -right-[8%] -top-[12%] h-[42vh] w-[42vh] rounded-full opacity-0 blur-3xl dark:opacity-25"
        style={{ background: "radial-gradient(circle, rgba(110,120,255,0.20) 0%, transparent 70%)" }}
      />
    </div>
  );
}
