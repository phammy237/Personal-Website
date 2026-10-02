"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { GeoPoint } from "@/data/biography/biography";

// three.js + the satellite textures only download while the first-visit intro is actually showing
const SatelliteGlobeCanvas = dynamic(
  () => import("@/components/biography/SatelliteGlobeCanvas").then((m) => m.SatelliteGlobeCanvas),
  { ssr: false }
);

const HANOI: GeoPoint = { lat: 21.03, lon: 105.85 };
const GAINESVILLE: GeoPoint = { lat: 29.65, lon: -82.32 };

const MASK = "radial-gradient(circle closest-side, #000 80%, transparent 100%)";
/** when, during the signature draw, the globe turns from Hanoi to Gainesville and then dollies in */
const TURN_AT_MS = 1600;
const ZOOM_AT_MS = 3200;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The home page's first impression: the journey's Earth, turning from Hanoi to Gainesville behind the
 * signature while it draws, then zooming toward Gainesville as the intro hands off to the hero.
 * Purely decorative — renders nothing without WebGL or when the visitor prefers reduced motion.
 */
export function IntroGlobe() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [focus, setFocus] = useState<GeoPoint>(HANOI);
  const [zoomed, setZoomed] = useState(false);
  const [size, setSize] = useState(560);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !hasWebGL()) return;
    setSize(Math.round(Math.min(620, window.innerWidth * 0.86, window.innerHeight * 0.78)));
    setEnabled(true);
    const turn = setTimeout(() => setFocus(GAINESVILLE), TURN_AT_MS);
    const zoom = setTimeout(() => setZoomed(true), ZOOM_AT_MS);
    return () => { clearTimeout(turn); clearTimeout(zoom); };
  }, []);

  if (!enabled) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700"
      style={{ opacity: ready ? 0.62 : 0 }}
    >
      {/* soft circular mask: once the camera dollies in the sphere outgrows its square canvas, and
          this dissolves the edges instead of showing the canvas corners */}
      <div style={{ WebkitMaskImage: MASK, maskImage: MASK }}>
      <SatelliteGlobeCanvas
        countries={null}
        initialTarget={HANOI}
        focusTarget={focus}
        zoomedIn={zoomed}
        arc={{ from: HANOI, to: GAINESVILLE }}
        interactive={false}
        ambient={false}
        wheelZoom={false}
        size={size}
        ariaLabel="Earth turning from Hanoi to Gainesville"
        onReady={() => setReady(true)}
      />
      </div>
    </div>
  );
}
