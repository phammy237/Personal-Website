"use client";
import { useEffect, useRef } from "react";
import { Map as MapLibreMap, AttributionControl, type MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getJourneyMapStyle } from "@/lib/biography/mapStyle";
import { EARTH_PRESET, type JourneyCameraState } from "@/lib/biography/mapCameraPresets";
import {
  hanoiPinsGeoJSON,
  usPinsGeoJSON,
  hanoiRouteGeoJSON,
  domesticRouteGeoJSON,
  transpacificRouteGeoJSON,
} from "@/lib/biography/journeyGeoData";

export type JourneyPinStatus = "unvisited" | "active" | "completed";

export type JourneyMapHandle = {
  /** per-frame, no animation — the scroll-scrubbed analog of map.jumpTo() */
  setCamera: (state: JourneyCameraState) => void;
  setPinStatus: (pinId: string, status: JourneyPinStatus) => void;
  setHanoiRouteProgress: (fraction: number) => void;
  setDomesticRouteProgress: (fraction: number) => void;
  setTranspacificRouteOpacity: (opacity: number) => void;
};

export type JourneyMapCanvasProps = {
  theme: "light" | "dark";
  reducedMotion: boolean;
  handleRef: React.MutableRefObject<JourneyMapHandle | null>;
  onPinClick: (pinId: string) => void;
  /** fired on pointer enter/leave of any pin — null on leave. Drives the compact hover preview;
   *  has no effect on journey/camera state (see JourneyPinPreview). */
  onPinHover: (pinId: string | null) => void;
  ariaLabel?: string;
};

const MOBILE_WIDTH_THRESHOLD = 768;
const PIN_LAYER_GROUPS = [
  { source: "hanoi-pins", prefix: "hanoi-pin", data: hanoiPinsGeoJSON },
  { source: "us-pins", prefix: "us-pin", data: usPinsGeoJSON },
] as const;

const PIN_CIRCLE_COLOR = [
  "case",
  ["==", ["feature-state", "status"], "active"],
  "#5B3A8E",
  ["==", ["feature-state", "status"], "completed"],
  "#C9BAD9",
  "rgba(24,35,63,0.35)",
];

const PIN_STROKE_COLOR = ["case", ["==", ["feature-state", "status"], "active"], "#F1EAF7", "#9B8BB5"];

const PIN_RADIUS = [
  "case",
  ["==", ["feature-state", "status"], "active"],
  8,
  ["boolean", ["feature-state", "hover"], false],
  7,
  5.5,
];

const PIN_STROKE_WIDTH = ["case", ["boolean", ["feature-state", "hover"], false], 2.5, 1.5];
const PIN_GLOW_RADIUS = ["case", ["==", ["feature-state", "status"], "active"], 17, 0];
const PIN_GLOW_OPACITY = ["case", ["==", ["feature-state", "status"], "active"], 0.35, 0];

const PIN_NUMBER_COLOR = [
  "case",
  ["==", ["feature-state", "status"], "active"],
  "#FFFFFF",
  ["==", ["feature-state", "status"], "completed"],
  "#5B3A8E",
  "#9B8BB5",
];

function labelOpacityExpression(isMobile: boolean) {
  if (isMobile) {
    // mobile: only the active location's label shows at all
    return ["case", ["==", ["feature-state", "status"], "active"], 1, 0];
  }
  return [
    "case",
    ["==", ["feature-state", "status"], "active"],
    1,
    ["==", ["feature-state", "status"], "completed"],
    0.55,
    ["boolean", ["feature-state", "hover"], false],
    0.85,
    0,
  ];
}

/** completed-up-to-`fraction` purple, the rest dimmer */
function routeGradient(fraction: number) {
  const f = Math.max(0.0001, Math.min(0.9999, fraction));
  return [
    "interpolate",
    ["linear"],
    ["line-progress"],
    0,
    "#5B3A8E",
    f,
    "#5B3A8E",
    Math.min(1, f + 0.001),
    "rgba(155,139,181,0.18)",
    1,
    "rgba(155,139,181,0.18)",
  ];
}

const INITIAL_DIM_GRADIENT = routeGradient(0);

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
    map.addLayer({
      id: `${id}-glow`,
      type: "line",
      source,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#9B8BB5",
        "line-width": 6,
        "line-blur": 3,
        "line-opacity": 0.25,
        "line-gradient": INITIAL_DIM_GRADIENT as never,
      },
    });
    map.addLayer({
      id,
      type: "line",
      source,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-width": 1.6, "line-gradient": INITIAL_DIM_GRADIENT as never },
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

  for (const group of PIN_LAYER_GROUPS) {
    map.addSource(group.source, { type: "geojson", data: group.data });

    map.addLayer({
      id: `${group.prefix}-label`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["format", ["get", "title"], {}, "\n", {}, ["get", "subtitle"], { "font-scale": 0.82 }],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "text-anchor": "left",
        "text-offset": [0.9, 0],
        "text-justify": "left",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": theme === "dark" ? "#FFFFFF" : "#18233F",
        "text-halo-color": theme === "dark" ? "#18233F" : "#F7F3FA",
        "text-halo-width": 1.4,
        "text-opacity": labelOpacityExpression(isMobile) as never,
      },
    });

    map.addLayer({
      id: `${group.prefix}-glow`,
      type: "circle",
      source: group.source,
      paint: {
        "circle-radius": PIN_GLOW_RADIUS as never,
        "circle-color": "#9B8BB5",
        "circle-blur": 1,
        "circle-opacity": PIN_GLOW_OPACITY as never,
      },
    });

    map.addLayer({
      id: `${group.prefix}-circle`,
      type: "circle",
      source: group.source,
      paint: {
        "circle-radius": PIN_RADIUS as never,
        "circle-color": PIN_CIRCLE_COLOR as never,
        "circle-stroke-color": PIN_STROKE_COLOR as never,
        "circle-stroke-width": PIN_STROKE_WIDTH as never,
      },
    });

    map.addLayer({
      id: `${group.prefix}-number`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "numberLabel"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 10,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: { "text-color": PIN_NUMBER_COLOR as never },
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
}

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
  ariaLabel = "Interactive map of the journey",
}: JourneyMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const constructedThemeRef = useRef(theme);
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

  const applyPersistedState = (map: MapLibreMap) => {
    for (const [pinId, status] of Array.from(pinStatusesRef.current.entries())) {
      for (const group of PIN_LAYER_GROUPS) {
        if (group.data.features.some((f) => f.id === pinId)) {
          map.setFeatureState({ source: group.source, id: pinId }, { status });
        }
      }
    }
    const hanoiGradient = routeGradient(hanoiRouteProgressRef.current);
    map.setPaintProperty("hanoi-route", "line-gradient", hanoiGradient as never);
    map.setPaintProperty("hanoi-route-glow", "line-gradient", hanoiGradient as never);
    const domesticGradient = routeGradient(domesticRouteProgressRef.current);
    map.setPaintProperty("domestic-route", "line-gradient", domesticGradient as never);
    map.setPaintProperty("domestic-route-glow", "line-gradient", domesticGradient as never);
    map.setPaintProperty("transpacific-route", "line-opacity", transpacificOpacityRef.current * 0.55);
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

    map.on("load", () => {
      setupJourneyLayers(map, constructedThemeRef.current, isMobileRef.current, onPinClickRef, onPinHoverRef, hoveredPinRef);
      applyPersistedState(map);
    });

    handleRef.current = {
      setCamera: (state) => {
        mapRef.current?.jumpTo({
          center: state.center,
          zoom: state.zoom,
          pitch: state.pitch ?? 0,
          bearing: state.bearing ?? 0,
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
        const gradient = routeGradient(fraction);
        m.setPaintProperty("hanoi-route", "line-gradient", gradient as never);
        m.setPaintProperty("hanoi-route-glow", "line-gradient", gradient as never);
      },
      setDomesticRouteProgress: (fraction) => {
        domesticRouteProgressRef.current = fraction;
        const m = mapRef.current;
        if (!m || !m.getLayer("domestic-route")) return;
        const gradient = routeGradient(fraction);
        m.setPaintProperty("domestic-route", "line-gradient", gradient as never);
        m.setPaintProperty("domestic-route-glow", "line-gradient", gradient as never);
      },
      setTranspacificRouteOpacity: (opacity) => {
        transpacificOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m || !m.getLayer("transpacific-route")) return;
        m.setPaintProperty("transpacific-route", "line-opacity", opacity * 0.55);
      },
    };

    const onCanvasResize = () => map.resize();
    window.addEventListener("resize", onCanvasResize);

    const onMobileBreakpointResize = () => {
      const nextIsMobile = window.innerWidth < MOBILE_WIDTH_THRESHOLD;
      if (nextIsMobile === isMobileRef.current) return;
      isMobileRef.current = nextIsMobile;
      for (const group of PIN_LAYER_GROUPS) {
        if (map.getLayer(`${group.prefix}-label`)) {
          map.setPaintProperty(`${group.prefix}-label`, "text-opacity", labelOpacityExpression(nextIsMobile) as never);
        }
      }
    };
    window.addEventListener("resize", onMobileBreakpointResize);

    return () => {
      window.removeEventListener("resize", onCanvasResize);
      window.removeEventListener("resize", onMobileBreakpointResize);
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
