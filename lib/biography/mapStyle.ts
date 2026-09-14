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
  skyColor: string;
  horizonColor: string;
};

// Exact design-system palette (see lib/biography/journeyPalette.ts) — dark theme only, this is the
// cinematic-atlas redesign's palette, not the site's shared brand tokens.
const DARK: ThemeColors = {
  background: "#121A33",
  water: "#0A1227",
  waterway: "rgba(170,160,210,0.28)",
  boundaryCountry: "rgba(170,160,210,0.35)",
  boundaryState: "rgba(170,160,210,0.13)",
  roadMinor: "rgba(190,185,220,0.12)",
  roadMajor: "rgba(200,190,230,0.28)",
  // "default map labels: opacity .20-.35 max" — curated named labels (Hồ Tây, Sông Hồng, etc.)
  // get their own brighter, hand-placed layer; this is the baseline for everything else.
  label: "rgba(238,236,246,0.32)",
  labelHalo: "#121A33",
  // Deliberately darker than `background` — the globe's sphere and the void around it
  // (MapLibre's "sky" in globe projection) must never share a color, or the sphere's
  // edge disappears against it. See mapStyle.ts fog/sky regression notes.
  skyColor: "#060910",
  horizonColor: "#C7BAFF",
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
  skyColor: "#DCD3EA",
  horizonColor: "#B9A8D6",
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
    // Without an explicit `sky`, MapLibre's globe projection leaves the space around the
    // sphere unpainted, so whatever sits behind the canvas (the page background) shows through
    // instead. If that happens to match `background` above, the sphere becomes indistinguishable
    // from its surroundings even though it's rendering correctly — this is what "the globe doesn't
    // render at all" turned out to be. `atmosphere-blend` fades the horizon glow out once zoomed
    // past the globe stage so it doesn't tint the flat Hanoi/U.S. mercator views.
    // Thin, crisp rim (low sky-horizon-blend) rather than a broad glow — "2-4px visible highlight,"
    // not a uniform neon circle.
    sky: {
      "sky-color": c.skyColor,
      "horizon-color": c.horizonColor,
      "sky-horizon-blend": 0.18,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 1, 6, 0],
    },
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
        // "reduce minor road contrast" — a touch thinner/dimmer, and doesn't appear until genuinely
        // zoomed into a pin (minzoom nudged 12→12.5), not while still panning around the overview
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["!", ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]]],
        minzoom: 12.5,
        paint: { "line-color": c.roadMinor, "line-width": 0.6 },
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
      // Country/city labels for the globe/Vietnam-approach zooms — fades out (maxzoom) well before
      // Hanoi's own overview zoom (11.3), where the curated labels below take over instead of a
      // second, generic "Hà Nội" competing with the custom hanoi-chapter-label layer.
      {
        id: "place-label-major",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", ["get", "class"], ["literal", ["country", "city"]]],
        maxzoom: 10,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 2, 10, 12, 14],
        },
        paint: { "text-color": c.label, "text-halo-color": c.labelHalo, "text-halo-width": 1.2 },
      },
      // Curated Hanoi labels only — no generic town/POI/commercial labels at city scale. Named,
      // real OSM features (district place points + West Lake + the Red River), not fabricated
      // points; "Hanoi" itself already has its own larger, dedicated layer (hanoi-chapter-label).
      {
        id: "curated-hanoi-districts",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", ["get", "name"], ["literal", ["Ba Đình", "Cầu Giấy", "Đống Đa", "Hoàn Kiếm"]]],
        minzoom: 10,
        layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 13 },
        paint: {
          "text-color": "rgba(199,186,255,0.5)",
          "text-halo-color": c.background,
          "text-halo-width": 1.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.8, 1],
        },
      },
      {
        id: "curated-west-lake",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water",
        filter: ["==", ["get", "name"], "Hồ Tây"],
        minzoom: 10,
        layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 13 },
        paint: {
          "text-color": "rgba(199,186,255,0.55)",
          "text-halo-color": c.background,
          "text-halo-width": 1.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.8, 1],
        },
      },
      {
        id: "curated-red-river",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "waterway",
        filter: ["==", ["get", "name"], "Sông Hồng"],
        minzoom: 10,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 13,
          "symbol-placement": "line",
        },
        paint: {
          "text-color": "rgba(199,186,255,0.55)",
          "text-halo-color": c.background,
          "text-halo-width": 1.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.8, 1],
        },
      },
    ],
  } satisfies StyleSpecification;
}
