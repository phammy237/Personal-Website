import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { usJourneyPins } from "@/data/usJourney";

/**
 * Single source of truth for every named camera position the journey's persistent MapLibre
 * instance can be at — the "keep camera presets in a centralized config, not hard-coded all over
 * individual components" requirement. `journeyMapCamera.ts` interpolates BETWEEN these per scroll
 * stage; nothing else should hardcode a center/zoom pair.
 */
export type CameraPresetId =
  | "earth"
  | "vietnam"
  | "hanoi"
  | "hanoiPin"
  | "earthTransition"
  | "usa"
  | "rivermont"
  | "gainesville";

export type JourneyCameraPreset = {
  /** [longitude, latitude] — MapLibre's own coordinate order, not [lat, lon] */
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
};

const RIVERMONT_PIN = usJourneyPins[0];
const GAINESVILLE_PIN = usJourneyPins[1];

/** wide Asia view — the journey's starting and "zoomed back out" resting point */
export const EARTH_PRESET: JourneyCameraPreset = { center: [105, 18], zoom: 1.1 };

/** country-level Vietnam framing, on the way in from the globe */
export const VIETNAM_PRESET: JourneyCameraPreset = { center: [105.85, 17.5], zoom: 4.6 };

/** city-level Hanoi overview, framing all 5 story pins */
export const HANOI_PRESET: JourneyCameraPreset = { center: [105.803, 21.0], zoom: 11.3 };

/** wide Asia-Pacific view used as the "zoom back out toward the globe" pivot before crossing */
export const EARTH_TRANSITION_PRESET: JourneyCameraPreset = { center: [150, 25], zoom: 1.6 };

/** regional U.S. framing, centered between Rivermont and Gainesville */
export const USA_PRESET: JourneyCameraPreset = { center: [-86.4, 35.6], zoom: 3.6 };

export const RIVERMONT_PRESET: JourneyCameraPreset = {
  center: [RIVERMONT_PIN.coordinates.lon, RIVERMONT_PIN.coordinates.lat],
  zoom: 13.2,
};

export const GAINESVILLE_PRESET: JourneyCameraPreset = {
  center: [GAINESVILLE_PIN.coordinates.lon, GAINESVILLE_PIN.coordinates.lat],
  zoom: 12.6,
};

/** per-pin city-scale preset, generated (not hardcoded) from the pin's own stored coordinates */
export function hanoiPinPreset(index: number): JourneyCameraPreset {
  const pin = hanoiJourneyPins[index];
  return { center: [pin.coordinates.lon, pin.coordinates.lat], zoom: 14.2 };
}

export const CAMERA_PRESETS: Record<Exclude<CameraPresetId, "hanoiPin">, JourneyCameraPreset> = {
  earth: EARTH_PRESET,
  vietnam: VIETNAM_PRESET,
  hanoi: HANOI_PRESET,
  earthTransition: EARTH_TRANSITION_PRESET,
  usa: USA_PRESET,
  rivermont: RIVERMONT_PRESET,
  gainesville: GAINESVILLE_PRESET,
};

/** the live camera state the map is asked to jump to on every scroll tick */
export type JourneyCameraState = {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
};
