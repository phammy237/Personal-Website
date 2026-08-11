"use client";
import { Component, type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeoPoint } from "@/data/biography";
import { AbstractGlobeFallback } from "@/components/biography/AbstractGlobeFallback";
import type { GlobeMarker, SatelliteGlobeProps } from "@/components/biography/SatelliteGlobeCanvas";

// Isolated + code-split: three.js/@react-three never ships in the initial server-rendered
// biography bundle, and never runs during SSR (Canvas/WebGL are browser-only).
const SatelliteGlobeCanvas = dynamic(
  () => import("@/components/biography/SatelliteGlobeCanvas").then((m) => m.SatelliteGlobeCanvas),
  { ssr: false }
);

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

class GlobeErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Satellite globe failed to render — falling back to the abstract globe.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export type GlobeHeroProps = {
  countries: FeatureCollection<Geometry> | null;
  highlightCountryIds?: string[];
  initialTarget?: GeoPoint;
  interactive?: boolean;
  ambient?: boolean;
  size?: number;
  className?: string;
  ariaLabel?: string;
  /** chapter-level markers (e.g. one "HANOI" pin), not the detailed in-city story pins */
  markers?: GlobeMarker[];
  /** restrained dashed travel arc, e.g. Vietnam → United States */
  arc?: SatelliteGlobeProps["arc"];
  /** changing this smoothly rotates the globe to face the new point — drives chapter transitions */
  focusTarget?: GeoPoint | null;
  /** camera dolly-in, used for the "zooming into the destination" transition beat */
  zoomedIn?: boolean;
  onFocusComplete?: () => void;
};

export function GlobeHero({ className = "", size = 560, ...props }: GlobeHeroProps) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const reducedMotion = !!useReducedMotion();

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  if (webglOk === false) {
    return <AbstractGlobeFallback {...props} size={size} className={className} />;
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <GlobeErrorBoundary fallback={<AbstractGlobeFallback {...props} size={size} />}>
        <SatelliteGlobeCanvas {...props} size={size} reducedMotion={reducedMotion} />
      </GlobeErrorBoundary>
    </div>
  );
}
