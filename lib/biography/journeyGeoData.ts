import { geoInterpolate } from "d3-geo";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { usJourneyPins } from "@/data/usJourney";
import { DOMESTIC_ROUTE_WAYPOINTS } from "@/lib/biography/usCamera";
import { FLIGHT_ORIGIN, FLIGHT_DESTINATION } from "@/lib/biography/transpacificCamera";

export type JourneyPinProperties = {
  id: string;
  number: number;
  numberLabel: string;
  title: string;
  subtitle: string;
  group: "hanoi" | "us";
};

/** module-load-computed from the already-real lat/lon in data/hanoiJourney.ts and data/usJourney.ts
 *  — no data-file changes needed, this just reshapes existing coordinates into GeoJSON features. */
export const hanoiPinsGeoJSON: FeatureCollection<Point, JourneyPinProperties> = {
  type: "FeatureCollection",
  features: hanoiJourneyPins.map((pin) => ({
    type: "Feature",
    id: pin.id,
    properties: {
      id: pin.id,
      number: pin.number,
      numberLabel: String(pin.number).padStart(2, "0"),
      title: pin.title,
      subtitle: pin.subtitle,
      group: "hanoi",
    },
    geometry: { type: "Point", coordinates: [pin.coordinates.lon, pin.coordinates.lat] },
  })),
};

export const usPinsGeoJSON: FeatureCollection<Point, JourneyPinProperties> = {
  type: "FeatureCollection",
  features: usJourneyPins.map((pin) => ({
    type: "Feature",
    id: pin.id,
    properties: {
      id: pin.id,
      number: pin.number,
      numberLabel: String(pin.number).padStart(2, "0"),
      title: pin.title,
      subtitle: pin.subtitle,
      group: "us",
    },
    geometry: { type: "Point", coordinates: [pin.coordinates.lon, pin.coordinates.lat] },
  })),
};

/** the 5 Hanoi pins in order — a narrative connection, not a real street route */
export const hanoiRouteGeoJSON: Feature<LineString> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: hanoiJourneyPins.map((pin) => [pin.coordinates.lon, pin.coordinates.lat]),
  },
};

/** Rivermont -> Gainesville — reuses the already-computed great-circle waypoints from usCamera.ts
 *  verbatim (no new geometry computed here) */
export const domesticRouteGeoJSON: Feature<LineString> = {
  type: "Feature",
  properties: {},
  geometry: { type: "LineString", coordinates: DOMESTIC_ROUTE_WAYPOINTS },
};

const TRANSPACIFIC_ROUTE_SEGMENTS = 64;

/** Vietnam -> Rivermont great-circle — reuses the same FLIGHT_ORIGIN/FLIGHT_DESTINATION endpoints
 *  transpacificCamera.ts's globe crossing already flies between, so the map's route matches the
 *  camera's own path instead of an independently-guessed line. */
export const transpacificRouteGeoJSON: Feature<LineString> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: (() => {
      const interpolate = geoInterpolate(
        [FLIGHT_ORIGIN.lon, FLIGHT_ORIGIN.lat],
        [FLIGHT_DESTINATION.lon, FLIGHT_DESTINATION.lat]
      );
      const points: [number, number][] = [];
      for (let i = 0; i <= TRANSPACIFIC_ROUTE_SEGMENTS; i++) points.push(interpolate(i / TRANSPACIFIC_ROUTE_SEGMENTS));
      return points;
    })(),
  },
};
