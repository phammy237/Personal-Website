import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, smoothstep } from "@/lib/biography/journeyMotion";
import { slerpLatLon } from "@/lib/three/latLon";
import {
  EARTH_PRESET,
  VIETNAM_PRESET,
  HANOI_PRESET,
  EARTH_TRANSITION_PRESET,
  USA_PRESET,
  RIVERMONT_PRESET,
  GAINESVILLE_PRESET,
  hanoiPinPreset,
  type JourneyCameraPreset,
  type JourneyCameraState,
} from "@/lib/biography/mapCameraPresets";

/**
 * Continuous progress(0–1) → MapLibre camera state for the whole journey, replacing the
 * renderer-coupled halves of journeyCamera.ts/hanoiCamera.ts/transpacificCamera.ts/usCamera.ts.
 * Every stage boundary hands off at the exact same preset both functions agree on, so there's
 * never a visible snap — the same invariant the old per-renderer camera modules maintained.
 */

const VIETNAM_APPROACH = getStageById("vietnam-approach");
const HANOI_APPROACH = getStageById("hanoi-approach");
const HANOI_OVERVIEW = getStageById("hanoi-overview");
const HANOI_PIN_STAGE_IDS = ["hanoi-pin-1", "hanoi-pin-2", "hanoi-pin-3", "hanoi-pin-4", "hanoi-pin-5"] as const;
const HANOI_PIN_STAGES = HANOI_PIN_STAGE_IDS.map((id) => getStageById(id));
const HANOI_DEPARTURE = getStageById("hanoi-departure");
const TRANSPACIFIC_FLIGHT = getStageById("transpacific-flight");
const US_OVERVIEW = getStageById("us-overview");
const RIVERMONT_APPROACH = getStageById("rivermont-approach");
const RIVERMONT_STORY = getStageById("rivermont-story");
const RIVERMONT_DEPARTURE = getStageById("rivermont-departure");
const FLORIDA_FLIGHT = getStageById("florida-flight");
const GAINESVILLE_APPROACH = getStageById("gainesville-approach");

/** the fraction of a hanoi-pin-N stage's own window spent panning in — the rest holds on target.
 *  Kept short: adjacent Hanoi pins are only blocks apart, so the pan itself should read as a quick,
 *  subtle nudge with a long resting/readable tail, not a deliberate "flight." */
const HANOI_PIN_SETTLE_FRACTION = 0.45;

/**
 * hanoi-departure's own zoom-out (pin scale ~14 down to near-globe ~1.6) was, on its own, by far
 * the single biggest per-stage zoom change in the whole journey — nearly double the next largest.
 * Split across hanoi-departure's full window AND the early portion of transpacific-flight instead
 * of cramming it into one stage, so "zooming back out to the globe" reads as its own slower,
 * broader beat rather than an abrupt snap-out right before the Pacific crossing begins.
 */
// balanced so both pieces move at roughly the same peak rate (amount/width-fraction), rather than
// leaving the second (narrower) piece with a sharper burst than the first
const HANOI_EXIT_SPLIT = 0.7; // fraction of the pin(4)->earthTransition distance covered by hanoi-departure alone
const HANOI_EXIT_FINISH_FRACTION = 0.4; // remaining fraction finished within transpacific-flight's own early window

/**
 * Symmetric fix for the same issue on the U.S. side: usa->rivermont was the second-largest
 * per-stage zoom change, compressed into rivermont-approach alone — notably more abrupt than the
 * Hanoi equivalent (vietnam->hanoi), which gets its own full dedicated stage. Borrowing the tail of
 * us-overview's hold gives this transition closer to the same broad, unhurried pacing.
 */
const US_APPROACH_EARLY_START_FRACTION = 0.7; // us-overview holds until this fraction of its own window
const US_APPROACH_EARLY_SPLIT = 0.3; // fraction of the usa->rivermont distance covered before rivermont-approach begins

function holdPreset(preset: JourneyCameraPreset): JourneyCameraState {
  return { center: preset.center, zoom: preset.zoom, pitch: preset.pitch ?? 0, bearing: preset.bearing ?? 0 };
}

function lerpPreset(a: JourneyCameraPreset, b: JourneyCameraPreset, t: number): JourneyCameraState {
  // always great-circle slerp for center, never a raw lon lerp — safe for both short hops (reduces
  // to the same short path) and the Pacific crossing (never the "wrong way" through Europe/Africa)
  const { lat, lon } = slerpLatLon({ lat: a.center[1], lon: a.center[0] }, { lat: b.center[1], lon: b.center[0] }, t);
  return {
    center: [lon, lat],
    zoom: lerp(a.zoom, b.zoom, t),
    pitch: lerp(a.pitch ?? 0, b.pitch ?? 0, t),
    bearing: lerp(a.bearing ?? 0, b.bearing ?? 0, t),
  };
}

export function computeJourneyCameraState(progress: number, reducedMotion: boolean): JourneyCameraState {
  if (reducedMotion) return computeReducedJourneyCameraState(progress);

  if (progress < VIETNAM_APPROACH.start) return holdPreset(EARTH_PRESET);
  if (progress < VIETNAM_APPROACH.end) {
    return lerpPreset(EARTH_PRESET, VIETNAM_PRESET, smoothstep(localProgress(progress, VIETNAM_APPROACH)));
  }
  if (progress < HANOI_APPROACH.end) {
    return lerpPreset(VIETNAM_PRESET, HANOI_PRESET, smoothstep(localProgress(progress, HANOI_APPROACH)));
  }
  if (progress < HANOI_OVERVIEW.end) return holdPreset(HANOI_PRESET);

  for (let i = 0; i < HANOI_PIN_STAGES.length; i++) {
    const stage = HANOI_PIN_STAGES[i];
    if (progress < stage.end) {
      const from = i === 0 ? HANOI_PRESET : hanoiPinPreset(i - 1);
      const to = hanoiPinPreset(i);
      const t = smoothstep(clamp01(localProgress(progress, stage) / HANOI_PIN_SETTLE_FRACTION));
      return lerpPreset(from, to, t);
    }
  }

  const lastHanoiPin = hanoiPinPreset(HANOI_PIN_STAGES.length - 1);
  if (progress < HANOI_DEPARTURE.end) {
    const t = smoothstep(localProgress(progress, HANOI_DEPARTURE)) * HANOI_EXIT_SPLIT;
    return lerpPreset(lastHanoiPin, EARTH_TRANSITION_PRESET, t);
  }
  if (progress < TRANSPACIFIC_FLIGHT.end) {
    const localT = localProgress(progress, TRANSPACIFIC_FLIGHT);
    if (localT < HANOI_EXIT_FINISH_FRACTION) {
      // finishing the zoom-out carried over from hanoi-departure, before any Pacific panning starts
      const t = HANOI_EXIT_SPLIT + smoothstep(localT / HANOI_EXIT_FINISH_FRACTION) * (1 - HANOI_EXIT_SPLIT);
      return lerpPreset(lastHanoiPin, EARTH_TRANSITION_PRESET, t);
    }
    const panT = smoothstep((localT - HANOI_EXIT_FINISH_FRACTION) / (1 - HANOI_EXIT_FINISH_FRACTION));
    return lerpPreset(EARTH_TRANSITION_PRESET, USA_PRESET, panT);
  }
  if (progress < US_OVERVIEW.end) {
    const localT = localProgress(progress, US_OVERVIEW);
    if (localT < US_APPROACH_EARLY_START_FRACTION) return holdPreset(USA_PRESET);
    // anticipatory zoom-in begun during the tail of the hold, finished across rivermont-approach —
    // the same split-across-a-boundary technique as the hanoi-departure/transpacific-flight seam
    const t = smoothstep((localT - US_APPROACH_EARLY_START_FRACTION) / (1 - US_APPROACH_EARLY_START_FRACTION)) * US_APPROACH_EARLY_SPLIT;
    return lerpPreset(USA_PRESET, RIVERMONT_PRESET, t);
  }
  if (progress < RIVERMONT_APPROACH.end) {
    const t = US_APPROACH_EARLY_SPLIT + smoothstep(localProgress(progress, RIVERMONT_APPROACH)) * (1 - US_APPROACH_EARLY_SPLIT);
    return lerpPreset(USA_PRESET, RIVERMONT_PRESET, t);
  }
  if (progress < RIVERMONT_STORY.end) return holdPreset(RIVERMONT_PRESET);
  // rivermont-departure: camera holds — the actual departure motion lives in florida-flight's own
  // window below, mirroring the old system's own precedent for this exact stage
  if (progress < RIVERMONT_DEPARTURE.end) return holdPreset(RIVERMONT_PRESET);
  if (progress < FLORIDA_FLIGHT.end) {
    return lerpPreset(RIVERMONT_PRESET, GAINESVILLE_PRESET, smoothstep(localProgress(progress, FLORIDA_FLIGHT)));
  }
  if (progress < GAINESVILLE_APPROACH.end) return holdPreset(GAINESVILLE_PRESET);
  // gainesville-story, us-memories, today-ahead: holds at Gainesville through the rest of the journey
  return holdPreset(GAINESVILLE_PRESET);
}

/** discrete, non-animated states — skips every flyover, jumps straight to the correct map state */
function computeReducedJourneyCameraState(progress: number): JourneyCameraState {
  if (progress < VIETNAM_APPROACH.start) return holdPreset(EARTH_PRESET);
  if (progress < HANOI_APPROACH.start) return holdPreset(VIETNAM_PRESET);
  if (progress < HANOI_OVERVIEW.start) return holdPreset(HANOI_PRESET);
  for (let i = 0; i < HANOI_PIN_STAGES.length; i++) {
    if (progress < HANOI_PIN_STAGES[i].end) return holdPreset(hanoiPinPreset(i));
  }
  if (progress < TRANSPACIFIC_FLIGHT.start) return holdPreset(EARTH_TRANSITION_PRESET);
  if (progress < RIVERMONT_APPROACH.start) return holdPreset(USA_PRESET);
  if (progress < FLORIDA_FLIGHT.start) return holdPreset(RIVERMONT_PRESET);
  return holdPreset(GAINESVILLE_PRESET);
}
