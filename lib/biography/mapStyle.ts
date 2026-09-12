import type { StyleSpecification } from "maplibre-gl";

/**
 * Free, open, no-API-key OpenStreetMap vector tiles — no signup, no billing, no rate limit stated.
 * TileJSON + source-layer schema (openmaptiles/OpenMapTiles) confirmed live against
 * tiles.openfreemap.org before wiring this in. Attribution text below matches what OpenFreeMap
 * asks for verbatim ("OpenFreeMap © OpenMapTiles · Data from OpenStreetMap").
 */
const OPENFREEMAP_TILEJSON_URL = "https://tiles.openfreemap.org/planet";
export const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © ' +
  '<a href="https://www.openmaptiles.org" target="_blank">OpenMapTiles</a> · Data from ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

type ThemeColors = {
  background: string;
  water: string;
  waterway: string;
  boundaryCountry: string;
  boundaryState: string;
  roadMinor: string;
  roadMajor: string;
  label: string;
  labelHalo: string;
};

const DARK: ThemeColors = {
  background: "#18233F",
  water: "#141B33",
  waterway: "rgba(155,139,181,0.35)",
  boundaryCountry: "rgba(155,139,181,0.45)",
  boundaryState: "rgba(255,255,255,0.12)",
  roadMinor: "rgba(255,255,255,0.12)",
  roadMajor: "rgba(155,139,181,0.35)",
  label: "#9B8BB5",
  labelHalo: "#18233F",
};

const LIGHT: ThemeColors = {
  background: "#F7F3FA",
  water: "#E4DDED",
  waterway: "rgba(91,58,142,0.25)",
  boundaryCountry: "rgba(91,58,142,0.35)",
  boundaryState: "#E6E0EE",
  roadMinor: "#E6E0EE",
  roadMajor: "rgba(91,58,142,0.28)",
  label: "#676186",
  labelHalo: "#F7F3FA",
};

/**
 * Small, hand-picked layer set against OpenFreeMap's OpenMapTiles-schema tiles — full color
 * control instead of a pre-baked raster style, tuned to this site's own brand tokens
 * (tailwind.config.ts) rather than a third party's palette.
 */
export function getJourneyMapStyle(theme: "light" | "dark"): StyleSpecification {
  const c = theme === "dark" ? DARK : LIGHT;

  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    projection: { type: "globe" },
    sources: {
      openmaptiles: { type: "vector", url: OPENFREEMAP_TILEJSON_URL },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": c.background } },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": c.water },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: { "line-color": c.waterway, "line-width": 1 },
      },
      {
        id: "boundary-state",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", ["get", "admin_level"], 4],
        paint: { "line-color": c.boundaryState, "line-width": 0.5, "line-dasharray": [2, 2] },
      },
      {
        id: "boundary-country",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", ["get", "admin_level"], 2],
        paint: { "line-color": c.boundaryCountry, "line-width": 1 },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["!", ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]]],
        minzoom: 12,
        paint: { "line-color": c.roadMinor, "line-width": 0.75 },
      },
      {
        id: "road-major",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
        minzoom: 4,
        paint: { "line-color": c.roadMajor, "line-width": 1.1 },
      },
      {
        id: "place-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", ["get", "class"], ["literal", ["country", "city", "town"]]],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 2, 10, 12, 14],
        },
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1.2 },
      },
    ],
  } satisfies StyleSpecification;
}
