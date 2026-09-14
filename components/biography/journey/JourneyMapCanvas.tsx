"use client";
import { useEffect, useRef } from "react";
import { Map as MapLibreMap, AttributionControl, setWorkerUrl, type MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getJourneyMapStyle } from "@/lib/biography/mapStyle";
import { EARTH_PRESET, type JourneyCameraState } from "@/lib/biography/mapCameraPresets";
import { computeJourneyMapPadding } from "@/lib/biography/journeyMapPadding";
import { lerp } from "@/lib/biography/journeyMotion";
import {
  hanoiPinsGeoJSON,
  usPinsGeoJSON,
  hanoiRouteGeoJSON,
  domesticRouteGeoJSON,
  transpacificRouteGeoJSON,
  hanoiAnchorGeoJSON,
  hanoiChapterLabelGeoJSON,
} from "@/lib/biography/journeyGeoData";
import { hanoiJourneyPins } from "@/data/hanoiJourney";

// MapLibre derives its worker script URL from `import.meta.url` at runtime (see
// maplibre-gl-dev.mjs's `defaultWorkerUrl()`), expecting a sibling `maplibre-gl-worker.mjs` next
// to wherever its own module ends up being served. Under Next.js's webpack bundling that module
// lives inside an app chunk with no such sibling, so the derived URL isn't a usable script — the
// worker silently never runs any real code (no parse error surfaces on `map.on("error")`), and the
// map is left permanently retrying tile loads with zero actual network requests ever going out.
// This was the actual cause of "the globe/map doesn't render" — not a style, color, or camera bug.
// Fix: point MapLibre at real, statically-served copies of the worker + its shared chunk (vendored
// into public/ from node_modules/maplibre-gl/dist — re-copy both if maplibre-gl is ever upgraded).
if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

export type JourneyPinStatus = "unvisited" | "active" | "completed";

export type JourneyMapHandle = {
  /** per-frame, no animation — the scroll-scrubbed analog of map.jumpTo(). `progress` (not derived
   *  from `state` itself) drives the centralized screen-space padding — see journeyMapPadding.ts. */
  setCamera: (state: JourneyCameraState, progress: number) => void;
  setPinStatus: (pinId: string, status: JourneyPinStatus) => void;
  setHanoiRouteProgress: (fraction: number) => void;
  setDomesticRouteProgress: (fraction: number) => void;
  setTranspacificRouteOpacity: (opacity: number) => void;
  /** the Earth-hero-stage "glowing Hanoi" marker — fades out well before the real Hanoi pins take
   *  over, see GeographicJourney's hero-weight fade. */
  setHanoiAnchorGlowOpacity: (opacity: number) => void;
  /** the understated "Hanoi" chapter label shown during hanoi-overview, fading out once pin
   *  stories start so it never competes with the location labels. */
  setHanoiChapterLabelOpacity: (opacity: number) => void;
  /** starts/stops the extremely-subtle Pin-01 pulse hint — a self-contained time-based loop (not
   *  scroll-tick-driven), only running while the hanoi-overview stage is actually on screen. */
  setHanoiOverviewPulseActive: (active: boolean) => void;
};

export type JourneyMapCanvasProps = {
  theme: "light" | "dark";
  reducedMotion: boolean;
  handleRef: React.MutableRefObject<JourneyMapHandle | null>;
  onPinClick: (pinId: string) => void;
  /** fired on pointer enter/leave of any pin — null on leave. Drives the compact hover preview;
   *  has no effect on journey/camera state (see JourneyPinPreview). */
  onPinHover: (pinId: string | null) => void;
  /** fired once handleRef.current is assigned and safe to call. GeographicJourney's own scroll
   *  effect and this component's dynamic import (next/dynamic) both load asynchronously and race —
   *  without this, a page load with zero scroll (progress stuck at 0) can call setCamera/setPinStatus/
   *  etc. before the handle exists, silently no-op the very first paint, and never get a second
   *  chance until the user's first scroll tick "self-heals" it. */
  onReady?: () => void;
  ariaLabel?: string;
};

const MOBILE_WIDTH_THRESHOLD = 768;
const PIN_LAYER_GROUPS = [
  { source: "hanoi-pins", prefix: "hanoi-pin", data: hanoiPinsGeoJSON },
  { source: "us-pins", prefix: "us-pin", data: usPinsGeoJSON },
] as const;

// Exact spec, three concentric layers (`-glow`, `-ring`, `-circle`) plus the number:
// ACTIVE:    halo 34px rgba(142,107,255,.18) / ring 22px 2px #A98CFF / inner 14px #8E6BFF / number white 11px
// COMPLETED: 18px filled rgba(142,107,255,.55), no ring, no glow
// FUTURE:    14px transparent fill, 1px ring rgba(180,160,255,.45), no glow
const STATUS = ["feature-state", "status"];

const PIN_CIRCLE_COLOR = ["case", ["==", STATUS, "active"], "#8E6BFF", ["==", STATUS, "completed"], "rgba(142,107,255,0.55)", "transparent"];
const PIN_RADIUS = ["case", ["==", STATUS, "active"], 7, ["==", STATUS, "completed"], 9, 7];

// the ring is the ONLY visible edge for future pins (transparent fill); for completed pins it's
// switched off entirely (a plain filled dot, no ring) via PIN_RING_OPACITY below
const PIN_RING_RADIUS = ["case", ["==", STATUS, "active"], 11, 7];
const PIN_RING_STROKE_WIDTH = ["case", ["==", STATUS, "active"], 2, 1];
const PIN_RING_COLOR = ["case", ["==", STATUS, "active"], "#A98CFF", "rgba(180,160,255,0.45)"];
const PIN_RING_OPACITY = ["case", ["==", STATUS, "completed"], 0, 1];

const PIN_GLOW_RADIUS = ["case", ["==", STATUS, "active"], 17, 0];
const PIN_GLOW_OPACITY = ["case", ["==", STATUS, "active"], 0.18, 0]; // "only active pin glows strongly"

const PIN_NUMBER_COLOR = "#FFFFFF";

/** title: active 1, completed .45, future 0 (hover reveals it — see PIN_TITLE_OPACITY_MOBILE) */
function titleOpacityExpression(isMobile: boolean) {
  if (isMobile) return ["case", ["==", STATUS, "active"], 1, 0];
  return [
    "case",
    ["==", STATUS, "active"],
    1,
    ["==", STATUS, "completed"],
    0.45,
    ["boolean", ["feature-state", "hover"], false],
    0.85,
    0,
  ];
}

/** subtitle: active only — "Completed: title only" / "Future: hidden unless hover" */
function subtitleOpacityExpression(isMobile: boolean) {
  if (isMobile) return 0;
  return ["case", ["==", STATUS, "active"], 1, ["boolean", ["feature-state", "hover"], false], 0.85, 0];
}

// Three states along the core line: completed (.85), a narrow full-brightness band right at the
// leading edge ("current segment"), future (.12) — the glow layer underneath is flat/constant, not
// gradient-driven (see setupJourneyLayers), so only the core needs this per-frame update.
const ROUTE_COMPLETED = "rgba(169,140,255,0.85)";
const ROUTE_CURRENT = "#A98CFF";
const ROUTE_FUTURE = "rgba(169,140,255,0.12)";
const CURRENT_BAND_WIDTH = 0.015;

function routeGradient(fraction: number) {
  const f = Math.max(0.0001, Math.min(0.9999, fraction));
  const bandStart = Math.max(0, f - CURRENT_BAND_WIDTH);
  return [
    "interpolate",
    ["linear"],
    ["line-progress"],
    0,
    ROUTE_COMPLETED,
    bandStart,
    ROUTE_COMPLETED,
    f,
    ROUTE_CURRENT,
    Math.min(1, f + 0.001),
    ROUTE_FUTURE,
    1,
    ROUTE_FUTURE,
  ];
}

const INITIAL_DIM_GRADIENT = routeGradient(0);

function applyHanoiAnchorOpacity(map: MapLibreMap, opacity: number) {
  if (!map.getLayer("hanoi-anchor-glow")) return;
  map.setPaintProperty("hanoi-anchor-glow", "circle-opacity", opacity * 0.3);
  map.setPaintProperty("hanoi-anchor-ring", "circle-stroke-opacity", opacity * 0.9);
  map.setPaintProperty("hanoi-anchor-dot", "circle-opacity", opacity);
  map.setPaintProperty("hanoi-anchor-label", "text-opacity", opacity);
}

function applyHanoiChapterLabelOpacity(map: MapLibreMap, opacity: number) {
  if (!map.getLayer("hanoi-chapter-label")) return;
  map.setPaintProperty("hanoi-chapter-label", "text-opacity", opacity * 0.75); // spec ceiling: opacity .75
}

/**
 * Adds every biography-specific source/layer (routes + pins) on top of the current base style, and
 * wires pin click/hover handlers. Called once on initial load AND again after every `setStyle()`
 * theme swap — a full style swap wipes anything not part of the style JSON itself, so this must be
 * fully idempotent/re-runnable, not a one-time setup.
 */
function setupJourneyLayers(
  map: MapLibreMap,
  theme: "light" | "dark",
  isMobile: boolean,
  onPinClickRef: React.MutableRefObject<(pinId: string) => void>,
  onPinHoverRef: React.MutableRefObject<(pinId: string | null) => void>,
  hoveredPinRef: React.MutableRefObject<{ source: string; id: string } | null>
) {
  map.addSource("hanoi-route", { type: "geojson", data: hanoiRouteGeoJSON, lineMetrics: true });
  map.addSource("domestic-route", { type: "geojson", data: domesticRouteGeoJSON, lineMetrics: true });
  map.addSource("transpacific-route", { type: "geojson", data: transpacificRouteGeoJSON });

  for (const [id, source] of [
    ["hanoi-route", "hanoi-route"],
    ["domestic-route", "domestic-route"],
  ] as const) {
    // Flat/constant — doesn't itself track progress; the core line below carries the
    // future/completed/current distinction via its gradient.
    map.addLayer({
      id: `${id}-glow`,
      type: "line",
      source,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#8E6BFF", "line-width": 9, "line-blur": 3, "line-opacity": 0.14 },
    });
    map.addLayer({
      id,
      type: "line",
      source,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-width": 2.5, "line-gradient": INITIAL_DIM_GRADIENT as never },
    });
  }
  // trans-Pacific: visually distinct from the two local routes — thinner, no glow, broader arc,
  // atmospheric (low fixed opacity rather than a progress gradient), only meaningfully visible
  // during the transition/global stage (opacity driven imperatively — see setTranspacificRouteOpacity)
  map.addLayer({
    id: "transpacific-route",
    type: "line",
    source: "transpacific-route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#9B8BB5", "line-width": 1, "line-opacity": 0 },
  });

  // Earth-hero-stage "glowing Hanoi" marker — visible only while zoomed out near the globe, before
  // the real Hanoi pins (below) take over. Starts fully transparent; GeographicJourney drives its
  // opacity every scroll tick via setHanoiAnchorGlowOpacity, same pattern as the routes above.
  // Exact spec: 8px white center, 14px purple ring, 26px halo — "only one strong geographic marker
  // on Earth hero."
  map.addSource("hanoi-anchor", { type: "geojson", data: hanoiAnchorGeoJSON });
  map.addLayer({
    id: "hanoi-anchor-glow",
    type: "circle",
    source: "hanoi-anchor",
    paint: { "circle-radius": 13, "circle-color": "#8E6BFF", "circle-blur": 1.2, "circle-opacity": 0 },
  });
  map.addLayer({
    id: "hanoi-anchor-ring",
    type: "circle",
    source: "hanoi-anchor",
    paint: {
      "circle-radius": 7,
      "circle-color": "transparent",
      "circle-stroke-color": "#A98CFF",
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0,
    },
  });
  map.addLayer({
    id: "hanoi-anchor-dot",
    type: "circle",
    source: "hanoi-anchor",
    paint: { "circle-radius": 4, "circle-color": "#F4F1FB", "circle-opacity": 0 },
  });
  map.addLayer({
    id: "hanoi-anchor-label",
    type: "symbol",
    source: "hanoi-anchor",
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 13.5,
      "text-anchor": "left",
      "text-offset": [1.1, 0],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": theme === "dark" ? "#F4F1FB" : "#121A33",
      "text-halo-color": theme === "dark" ? "#121A33" : "#F7F3FA",
      "text-halo-width": 1.4,
      "text-opacity": 0,
    },
  });

  // Understated "Hanoi" chapter label — visible only through the hanoi-overview stage, fading out
  // once pin stories start (see setHanoiChapterLabelOpacity). Separate from hanoi-anchor-label
  // above, which belongs to the earlier Earth-hero stage and is long gone by this point.
  map.addSource("hanoi-chapter-label", { type: "geojson", data: hanoiChapterLabelGeoJSON });
  map.addLayer({
    id: "hanoi-chapter-label",
    type: "symbol",
    source: "hanoi-chapter-label",
    layout: {
      "text-field": ["get", "title"],
      // Not a real serif — OpenFreeMap's glyph PBFs only offer a Noto Sans stack, and MapLibre
      // symbol text can't consume the page's own @font-face (DM Serif); sized up to read as a
      // heading regardless. Flagged as a known constraint, not an oversight.
      "text-font": ["Noto Sans Regular"],
      "text-size": 32,
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": theme === "dark" ? "rgba(244,241,251,0.75)" : "rgba(18,26,51,0.75)",
      "text-halo-color": theme === "dark" ? "#121A33" : "#F7F3FA",
      "text-halo-width": 1.6,
      "text-opacity": 0,
    },
  });

  for (const group of PIN_LAYER_GROUPS) {
    map.addSource(group.source, { type: "geojson", data: group.data });

    // Title and subtitle are separate layers (not one "format" text-field) because they need
    // independent opacity rules — completed shows title only, active shows both.
    map.addLayer({
      id: `${group.prefix}-label-title`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "title"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 15,
        "text-anchor": "left",
        "text-offset": [0.9, -0.15],
        "text-justify": "left",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#F4F1FB",
        "text-halo-color": "#121A33",
        "text-halo-width": 1.4,
        "text-opacity": titleOpacityExpression(isMobile) as never,
      },
    });
    map.addLayer({
      id: `${group.prefix}-label-subtitle`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "subtitle"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "text-anchor": "left",
        "text-offset": [0.9, 0.9],
        "text-justify": "left",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "rgba(205,200,225,0.7)",
        "text-halo-color": "#121A33",
        "text-halo-width": 1.4,
        "text-opacity": subtitleOpacityExpression(isMobile) as never,
      },
    });

    map.addLayer({
      id: `${group.prefix}-glow`,
      type: "circle",
      source: group.source,
      paint: {
        "circle-radius": PIN_GLOW_RADIUS as never,
        "circle-color": "#8E6BFF",
        "circle-blur": 1,
        "circle-opacity": PIN_GLOW_OPACITY as never,
      },
    });

    // stroke-only ring — the ONLY visible edge for future pins (transparent fill below); switched
    // off for completed (plain filled dot, no ring)
    map.addLayer({
      id: `${group.prefix}-ring`,
      type: "circle",
      source: group.source,
      paint: {
        "circle-radius": PIN_RING_RADIUS as never,
        "circle-color": "transparent",
        "circle-stroke-color": PIN_RING_COLOR as never,
        "circle-stroke-width": PIN_RING_STROKE_WIDTH as never,
        "circle-stroke-opacity": PIN_RING_OPACITY as never,
      },
    });

    map.addLayer({
      id: `${group.prefix}-circle`,
      type: "circle",
      source: group.source,
      paint: { "circle-radius": PIN_RADIUS as never, "circle-color": PIN_CIRCLE_COLOR as never },
    });

    map.addLayer({
      id: `${group.prefix}-number`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "numberLabel"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: { "text-color": PIN_NUMBER_COLOR },
    });

    const circleLayerId = `${group.prefix}-circle`;
    map.on("click", circleLayerId, (e) => {
      const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
      const id = feature?.properties?.id as string | undefined;
      if (id) onPinClickRef.current(id);
    });
    map.on("mouseenter", circleLayerId, (e) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
      const id = feature?.properties?.id as string | undefined;
      if (!id) return;
      if (hoveredPinRef.current) map.setFeatureState(hoveredPinRef.current, { hover: false });
      hoveredPinRef.current = { source: group.source, id };
      map.setFeatureState({ source: group.source, id }, { hover: true });
      onPinHoverRef.current(id);
    });
    map.on("mouseleave", circleLayerId, () => {
      map.getCanvas().style.cursor = "";
      if (hoveredPinRef.current) {
        map.setFeatureState(hoveredPinRef.current, { hover: false });
        hoveredPinRef.current = null;
      }
      onPinHoverRef.current(null);
    });
  }

  // Pin-01's "extremely subtle" overview hint — a slow, time-based pulse (not scroll-tick-driven,
  // since the visitor may sit still reading the intro), started/stopped via
  // setHanoiOverviewPulseActive. Filtered from the same hanoi-pins source rather than a new one —
  // no new/fake geometry, just an extra decorative layer over the real Pin 01 feature.
  map.addLayer({
    id: "hanoi-pin-1-hint",
    type: "circle",
    source: "hanoi-pins",
    filter: ["==", ["get", "id"], hanoiJourneyPins[0].id],
    paint: { "circle-radius": 10, "circle-color": "#9B8BB5", "circle-blur": 1, "circle-opacity": 0 },
  });
}

const PIN_1_HINT_MIN_RADIUS = 8;
const PIN_1_HINT_MAX_RADIUS = 15;
const PIN_1_HINT_MAX_OPACITY = 0.22;
const PIN_1_HINT_PERIOD_MS = 2600;

/**
 * The one persistent MapLibre instance for the whole biography journey — mounted once, for the
 * page's lifetime, full-bleed (no fixed pixel size, unlike the old globe/SVG maps it replaces).
 * GeographicJourney owns all camera/pin/route choreography and drives it imperatively via
 * handleRef.current's methods every scroll tick, the same division of responsibility the old
 * Three.js globe and SVG maps used, just collapsed into a single renderer instead of three.
 *
 * Deliberately non-interactive for camera control (no drag/scroll-zoom) — the camera is purely
 * scroll-driven, matching the "one continuous, non-slide-changing zoom" goal. Pins remain
 * clickable (see onPinClick). The old globe's own "drag to explore" affordance during the idle
 * earth-intro beat is not reproduced here; worth revisiting as a follow-up.
 */
export function JourneyMapCanvas({
  theme,
  reducedMotion,
  handleRef,
  onPinClick,
  onPinHover,
  onReady,
  ariaLabel = "Interactive map of the journey",
}: JourneyMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const constructedThemeRef = useRef(theme);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onPinClickRef = useRef(onPinClick);
  onPinClickRef.current = onPinClick;
  const onPinHoverRef = useRef(onPinHover);
  onPinHoverRef.current = onPinHover;
  const hoveredPinRef = useRef<{ source: string; id: string } | null>(null);
  const isMobileRef = useRef(typeof window !== "undefined" && window.innerWidth < MOBILE_WIDTH_THRESHOLD);
  // last-known values, re-applied after every setupJourneyLayers call (including post-theme-swap
  // re-adds, which otherwise silently reset every pin/route to its default unstyled state)
  const pinStatusesRef = useRef(new Map<string, JourneyPinStatus>());
  const hanoiRouteProgressRef = useRef(0);
  const domesticRouteProgressRef = useRef(0);
  const transpacificOpacityRef = useRef(0);
  const hanoiAnchorOpacityRef = useRef(0);
  const hanoiChapterLabelOpacityRef = useRef(0);
  // Pin-01 hint pulse: a self-contained rAF loop, entirely separate from the scroll-progress
  // pipeline (a visitor sitting still reading the intro still sees it breathe). Only ever running
  // while GeographicJourney says the hanoi-overview stage is actually on screen.
  const pulseRafRef = useRef<number | null>(null);
  const pulseActiveRef = useRef(false);

  const applyPersistedState = (map: MapLibreMap) => {
    for (const [pinId, status] of Array.from(pinStatusesRef.current.entries())) {
      for (const group of PIN_LAYER_GROUPS) {
        if (group.data.features.some((f) => f.id === pinId)) {
          map.setFeatureState({ source: group.source, id: pinId }, { status });
        }
      }
    }
    map.setPaintProperty("hanoi-route", "line-gradient", routeGradient(hanoiRouteProgressRef.current) as never);
    map.setPaintProperty("domestic-route", "line-gradient", routeGradient(domesticRouteProgressRef.current) as never);
    map.setPaintProperty("transpacific-route", "line-opacity", transpacificOpacityRef.current * 0.55);
    applyHanoiAnchorOpacity(map, hanoiAnchorOpacityRef.current);
    applyHanoiChapterLabelOpacity(map, hanoiChapterLabelOpacityRef.current);
  };

  const stopPulse = () => {
    pulseActiveRef.current = false;
    if (pulseRafRef.current !== null) {
      cancelAnimationFrame(pulseRafRef.current);
      pulseRafRef.current = null;
    }
    const m = mapRef.current;
    if (m && m.getLayer("hanoi-pin-1-hint")) m.setPaintProperty("hanoi-pin-1-hint", "circle-opacity", 0);
  };

  const startPulse = () => {
    if (pulseActiveRef.current) return;
    pulseActiveRef.current = true;
    if (reducedMotion) {
      // static hint, no animation loop — matches this codebase's existing "skip the animated paint
      // expression under reduced motion" convention for pin pulses
      const m = mapRef.current;
      if (m && m.getLayer("hanoi-pin-1-hint")) {
        m.setPaintProperty("hanoi-pin-1-hint", "circle-radius", PIN_1_HINT_MIN_RADIUS);
        m.setPaintProperty("hanoi-pin-1-hint", "circle-opacity", PIN_1_HINT_MAX_OPACITY * 0.6);
      }
      return;
    }
    const tick = (now: number) => {
      if (!pulseActiveRef.current) return;
      const m = mapRef.current;
      if (m && m.getLayer("hanoi-pin-1-hint")) {
        const phase = (now % PIN_1_HINT_PERIOD_MS) / PIN_1_HINT_PERIOD_MS; // 0..1
        const wave = (Math.sin(phase * Math.PI * 2) + 1) / 2; // 0..1, smooth breathing
        m.setPaintProperty("hanoi-pin-1-hint", "circle-radius", lerp(PIN_1_HINT_MIN_RADIUS, PIN_1_HINT_MAX_RADIUS, wave));
        m.setPaintProperty("hanoi-pin-1-hint", "circle-opacity", lerp(0.06, PIN_1_HINT_MAX_OPACITY, 1 - wave));
      }
      pulseRafRef.current = requestAnimationFrame(tick);
    };
    pulseRafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: getJourneyMapStyle(theme),
      center: EARTH_PRESET.center,
      zoom: EARTH_PRESET.zoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      interactive: false,
      dragRotate: false,
      touchZoomRotate: false,
      fadeDuration: reducedMotion ? 0 : 300,
    });
    constructedThemeRef.current = theme;
    // OpenFreeMap's own TileJSON already declares its attribution string — MapLibre pulls it in
    // automatically, so no customAttribution here (adding one duplicated the same text twice).
    map.addControl(new AttributionControl({ compact: true }), "bottom-left");
    map.on("error", (e) => {
      // eslint-disable-next-line no-console
      console.error("Journey map error:", e.error);
    });
    mapRef.current = map;

    // "style.load" (style/sources resolved) — NOT "load" (requires the currently-visible tiles to
    // have actually finished fetching/rendering first). Gating setup on "load" left every pin,
    // route, and label permanently unadded whenever tile rendering was slow or incomplete, which
    // could make the whole map appear broken even though the base style/canvas were fine. Adding
    // sources/layers only needs the style to be ready, not a fully-painted frame.
    // `.once`, not `.on` — the theme-swap effect below registers its own `.once("style.load", ...)`
    // for every later swap; a persistent listener here would double-run setup on every swap too.
    map.once("style.load", () => {
      setupJourneyLayers(map, constructedThemeRef.current, isMobileRef.current, onPinClickRef, onPinHoverRef, hoveredPinRef);
      applyPersistedState(map);
    });

    handleRef.current = {
      setCamera: (state, progress) => {
        mapRef.current?.jumpTo({
          center: state.center,
          zoom: state.zoom,
          pitch: state.pitch ?? 0,
          bearing: state.bearing ?? 0,
          padding: computeJourneyMapPadding(progress, isMobileRef.current),
        });
      },
      setPinStatus: (pinId, status) => {
        pinStatusesRef.current.set(pinId, status);
        const m = mapRef.current;
        if (!m) return;
        for (const group of PIN_LAYER_GROUPS) {
          if (!m.getSource(group.source)) continue;
          if (group.data.features.some((f) => f.id === pinId)) {
            m.setFeatureState({ source: group.source, id: pinId }, { status });
          }
        }
      },
      setHanoiRouteProgress: (fraction) => {
        hanoiRouteProgressRef.current = fraction;
        const m = mapRef.current;
        if (!m || !m.getLayer("hanoi-route")) return;
        m.setPaintProperty("hanoi-route", "line-gradient", routeGradient(fraction) as never);
      },
      setDomesticRouteProgress: (fraction) => {
        domesticRouteProgressRef.current = fraction;
        const m = mapRef.current;
        if (!m || !m.getLayer("domestic-route")) return;
        m.setPaintProperty("domestic-route", "line-gradient", routeGradient(fraction) as never);
      },
      setTranspacificRouteOpacity: (opacity) => {
        transpacificOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m || !m.getLayer("transpacific-route")) return;
        m.setPaintProperty("transpacific-route", "line-opacity", opacity * 0.55);
      },
      setHanoiAnchorGlowOpacity: (opacity) => {
        hanoiAnchorOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m) return;
        applyHanoiAnchorOpacity(m, opacity);
      },
      setHanoiChapterLabelOpacity: (opacity) => {
        hanoiChapterLabelOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m) return;
        applyHanoiChapterLabelOpacity(m, opacity);
      },
      setHanoiOverviewPulseActive: (active) => {
        if (active) startPulse();
        else stopPulse();
      },
    };
    onReadyRef.current?.();

    const onCanvasResize = () => map.resize();
    window.addEventListener("resize", onCanvasResize);

    const onMobileBreakpointResize = () => {
      const nextIsMobile = window.innerWidth < MOBILE_WIDTH_THRESHOLD;
      if (nextIsMobile === isMobileRef.current) return;
      isMobileRef.current = nextIsMobile;
      for (const group of PIN_LAYER_GROUPS) {
        if (map.getLayer(`${group.prefix}-label-title`)) {
          map.setPaintProperty(`${group.prefix}-label-title`, "text-opacity", titleOpacityExpression(nextIsMobile) as never);
          map.setPaintProperty(`${group.prefix}-label-subtitle`, "text-opacity", subtitleOpacityExpression(nextIsMobile) as never);
        }
      }
    };
    window.addEventListener("resize", onMobileBreakpointResize);

    return () => {
      window.removeEventListener("resize", onCanvasResize);
      window.removeEventListener("resize", onMobileBreakpointResize);
      stopPulse();
      handleRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme swap: full style swap for now — acceptable, but flagged as something to revisit with
  // targeted setPaintProperty swaps across the handful of hand-picked layers if it ever visibly
  // flickers on toggle. Only fires for a genuine theme change (see constructedThemeRef above). A
  // style swap wipes every manually-added source/layer, so they're fully rebuilt on style.load and
  // every pin/route's last-known state is re-applied (see applyPersistedState).
  useEffect(() => {
    if (theme === constructedThemeRef.current) return;
    constructedThemeRef.current = theme;
    const map = mapRef.current;
    if (!map) return;
    map.once("style.load", () => {
      setupJourneyLayers(map, theme, isMobileRef.current, onPinClickRef, onPinHoverRef, hoveredPinRef);
      applyPersistedState(map);
    });
    map.setStyle(getJourneyMapStyle(theme));
  }, [theme]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className="absolute inset-0 h-full w-full"
    />
  );
}
