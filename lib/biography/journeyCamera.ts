import { chapters } from "@/data/biography";
import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, rampDownTo, smoothstep, stageWeight } from "@/lib/biography/journeyMotion";
import { GLOBE_DEFAULT_DISTANCE, GLOBE_ZOOMED_DISTANCE, type GlobeViewState } from "@/components/biography/SatelliteGlobeCanvas";

/** Hanoi — the one verified coordinate this whole approach is built around, reused verbatim. */
const HANOI = chapters[0].globeTarget;

const EARTH_INTRO = getStageById("earth-intro");
const VIETNAM_APPROACH = getStageById("vietnam-approach");
const HANOI_APPROACH = getStageById("hanoi-approach");
const HANOI_OVERVIEW = getStageById("hanoi-overview");
const HANOI_PIN_5 = getStageById("hanoi-pin-5");

export const APPROACH_STAGE_IDS: ReadonlySet<string> = new Set([
  EARTH_INTRO.id,
  VIETNAM_APPROACH.id,
  HANOI_APPROACH.id,
  HANOI_OVERVIEW.id,
]);

/**
 * Named camera keyframes — the single centralized structure every interpolation below reads
 * from, instead of scattering distance numbers through components. Orientation is locked on
 * Hanoi throughout: earth-intro already faces it (Phase 3), so "rotate to center Vietnam" is a
 * no-op and the entire approach reads as a straight zoom toward a fixed point. Distances reuse
 * the already-tuned `GLOBE_DEFAULT_DISTANCE`/`GLOBE_ZOOMED_DISTANCE` constants from the globe
 * itself rather than guessing new numbers.
 */
export const APPROACH_CAMERA_KEYFRAMES: Record<"earth-intro" | "vietnam-approach" | "hanoi-approach", GlobeViewState> = {
  "earth-intro": { latitude: HANOI.lat, longitude: HANOI.lon, distance: GLOBE_DEFAULT_DISTANCE },
  // roughly midway between the full-Earth and closest-safe distances — close enough to read as
  // "approaching Southeast Asia" while the globe's curvature stays clearly visible
  "vietnam-approach": { latitude: HANOI.lat, longitude: HANOI.lon, distance: (GLOBE_DEFAULT_DISTANCE + GLOBE_ZOOMED_DISTANCE) / 2 },
  // the globe's own verified zoom limit — any closer starts showing texture blur, so the rest of
  // the "getting closer" feeling is carried by the map crossfade/scale instead
  "hanoi-approach": { latitude: HANOI.lat, longitude: HANOI.lon, distance: GLOBE_ZOOMED_DISTANCE },
};

function lerpViewState(a: GlobeViewState, b: GlobeViewState, t: number): GlobeViewState {
  return {
    latitude: lerp(a.latitude, b.latitude, t),
    longitude: lerp(a.longitude, b.longitude, t),
    distance: lerp(a.distance, b.distance, t),
  };
}

/**
 * Continuous globe camera for any overall scroll progress. A pure function of `progress` — at
 * every stage boundary the two adjacent branches evaluate to the exact same keyframe (t=1 on one
 * side, t=0 on the other), so there's never a visible snap between them.
 */
export function computeApproachViewState(progress: number, reducedMotion: boolean): GlobeViewState {
  if (reducedMotion) return APPROACH_CAMERA_KEYFRAMES["earth-intro"];
  if (progress <= VIETNAM_APPROACH.start) return APPROACH_CAMERA_KEYFRAMES["earth-intro"];
  if (progress <= VIETNAM_APPROACH.end) {
    const t = smoothstep(localProgress(progress, VIETNAM_APPROACH));
    return lerpViewState(APPROACH_CAMERA_KEYFRAMES["earth-intro"], APPROACH_CAMERA_KEYFRAMES["vietnam-approach"], t);
  }
  const t = smoothstep(localProgress(progress, HANOI_APPROACH));
  return lerpViewState(APPROACH_CAMERA_KEYFRAMES["vietnam-approach"], APPROACH_CAMERA_KEYFRAMES["hanoi-approach"], t);
}

/**
 * Globe opacity: solid through earth-intro and vietnam-approach, ramping to 0 across the final
 * portion of hanoi-approach so it's fully hidden by the moment hanoi-overview begins — never
 * ramps back up past that point. The caller passes a much smaller `fade` under reduced motion
 * (REDUCED_FADE vs MOTION_FADE), which is what turns this into "a short window right at the
 * hanoi-overview boundary" instead of a fade spread across the tail of hanoi-approach.
 */
export function computeGlobeOpacity(progress: number, fade: number): number {
  return rampDownTo(progress, HANOI_OVERVIEW.start, fade);
}

/**
 * Map opacity: fades in over the same window the globe fades out (mirroring it exactly), stays
 * solid across hanoi-overview and all five pin stages (Phase 5 absorbs those into the same
 * persistent map), and fades out into hanoi-departure using the same triangular-falloff formula
 * that stage's own (still-generic) fade-in already uses — so the two match precisely.
 */
export function computeMapOpacity(progress: number, fade: number): number {
  return stageWeight(progress, HANOI_OVERVIEW.start, HANOI_PIN_5.end, fade);
}

/** container opacity for the combined 4-stage approach block — solid throughout, fading only at
 *  the very start (irrelevant, progress can't go below 0) and at the hanoi-overview→pin-1 edge */
export function computeApproachContainerOpacity(progress: number, fade: number): number {
  return stageWeight(progress, EARTH_INTRO.start, HANOI_OVERVIEW.end, fade);
}

export { EARTH_INTRO, VIETNAM_APPROACH, HANOI_APPROACH, HANOI_OVERVIEW, clamp01 };
