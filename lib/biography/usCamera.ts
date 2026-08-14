import { usJourneyPins } from "@/data/usJourney";
import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, rampDownTo, rampUpFrom, smoothstep } from "@/lib/biography/journeyMotion";
import { toMapPinStatus, type JourneyPinStatus } from "@/lib/biography/hanoiCamera";
import type { JourneyStageId } from "@/lib/biography/journeyTypes";
import type { PinStatus } from "@/components/biography/MapPin";

/**
 * Externally controlled U.S. map viewport — the persistent-map analog of HanoiMapViewport (see
 * hanoiCamera.ts). Phase 8 only ever resolves two named targets (`overview`/`rivermont`); later
 * phases add more without changing this shape.
 */
export type UsMapViewport = {
  center: [longitude: number, latitude: number];
  zoom: number;
};

export type UsCameraTargetId = "overview" | "rivermont";

/** Rivermont — usJourneyPins[0], confirmed by inspection: id "rivermont", stored coordinates
 *  reused verbatim, never re-guessed. Gainesville (usJourneyPins[1]) stays untouched by Phase 8. */
const RIVERMONT_PIN = usJourneyPins[0];
export const RIVERMONT_PIN_ID = RIVERMONT_PIN.id;

export const RIVERMONT_APPROACH = getStageById("rivermont-approach");
export const RIVERMONT_STORY = getStageById("rivermont-story");

/** the two stage slots this module owns end to end — GeographicJourney excludes these from both
 *  the generic per-stage placeholder crossfade and the generic placeholder render loop, the same
 *  way transpacificCamera's TRANSPACIFIC_STAGE_IDS already excludes hanoi-departure/.../us-overview */
export const US_JOURNEY_STAGE_IDS: ReadonlySet<string> = new Set<JourneyStageId>([
  RIVERMONT_APPROACH.id,
  RIVERMONT_STORY.id,
]);

/** presentation-only values — centralized here, not duplicated at each call site */
const RIVERMONT_ZOOM = 2.2;
/** much smaller than RIVERMONT_ZOOM — reduced motion gets a restrained, near-static shift rather
 *  than a full pan/zoom (see computeUsCameraFrame's reducedMotion branch) */
const RIVERMONT_ZOOM_REDUCED = 1.15;
/** slightly left of center on desktop, reserving the right side for the story panel */
const RIVERMONT_DESKTOP_FOCUS = { x: 0.4, y: 0.46 };
/** above vertical center on mobile, reserving the lower area for the bottom sheet */
const RIVERMONT_MOBILE_FOCUS = { x: 0.5, y: 0.34 };

/** camera reaches Rivermont and holds by this fraction of rivermont-approach's local progress —
 *  mirrors hanoiCamera's own SETTLE_FRACTION so the two chapters read consistently */
const SETTLE_FRACTION = 0.35;

export type UsCameraFrame = {
  fromId: UsCameraTargetId;
  toId: UsCameraTargetId;
  /** eased local blend from fromId to toId, 0–1 */
  t: number;
  /** -1 = before rivermont-approach (neutral overview), 0 = at/after Rivermont */
  cursor: -1 | 0;
};

/** -1 before rivermont-approach, 0 from rivermont-approach onward — holds at 0 through
 *  rivermont-story and every later (not-yet-implemented) stage, since nothing in Phase 8 ever
 *  begins leaving Rivermont for Florida yet. */
export function deriveUsCursor(progress: number): -1 | 0 {
  return progress < RIVERMONT_APPROACH.start ? -1 : 0;
}

/** Continuous camera frame for any overall scroll progress — pure, deterministic, matching at
 *  every stage boundary (t=1 on one side, t=0 on the other) so there's never a visible snap. */
export function computeUsCameraFrame(progress: number): UsCameraFrame {
  const cursor = deriveUsCursor(progress);
  if (cursor === -1) return { fromId: "overview", toId: "overview", t: 1, cursor };
  if (progress < RIVERMONT_APPROACH.end) {
    const raw = localProgress(progress, RIVERMONT_APPROACH);
    const t = smoothstep(clamp01(raw / SETTLE_FRACTION));
    return { fromId: "overview", toId: "rivermont", t, cursor };
  }
  return { fromId: "rivermont", toId: "rivermont", t: 1, cursor };
}

type ProjectedPinLike = { id: string; x: number; y: number };
type ContainerSize = { width: number; height: number };
type Composition = { dx: number; dy: number; scale: number };

const IDENTITY: Composition = { dx: 0, dy: 0, scale: 1 };

/**
 * Resolves a named target to a pixel-space translate+scale for a wrapper placed around the whole
 * (untouched) HanoiMap render — same technique hanoiCamera's resolveHanoiComposition uses, kept
 * as a local copy rather than a shared import so a future change to one map's geometry can never
 * accidentally perturb the other's. "overview" is always the identity transform (the map's own
 * default fitted view, matching the verified Phase 7 U.S. framing).
 */
export function resolveUsComposition(
  targetId: UsCameraTargetId,
  projectedPins: ProjectedPinLike[],
  size: ContainerSize,
  isMobile: boolean,
  zoomOverride?: number
): Composition {
  if (targetId === "overview") return IDENTITY;
  const pin = projectedPins.find((p) => p.id === RIVERMONT_PIN.id);
  if (!pin || size.width <= 0 || size.height <= 0) return IDENTITY;
  const focus = isMobile ? RIVERMONT_MOBILE_FOCUS : RIVERMONT_DESKTOP_FOCUS;
  const scale = zoomOverride ?? RIVERMONT_ZOOM;
  const dx = size.width * (focus.x - 0.5 - scale * (pin.x / 100 - 0.5));
  const dy = size.height * (focus.y - 0.5 - scale * (pin.y / 100 - 0.5));
  return { dx, dy, scale };
}

export function lerpComposition(a: Composition, b: Composition, t: number): Composition {
  return { dx: lerp(a.dx, b.dx, t), dy: lerp(a.dy, b.dy, t), scale: lerp(a.scale, b.scale, t) };
}

/** Reduced-motion camera: a discrete (non-animated) switch between overview and a restrained,
 *  smaller-amplitude Rivermont composition — "near-static", never a continuous scroll-driven pan. */
export function resolveUsReducedComposition(
  cursor: -1 | 0,
  projectedPins: ProjectedPinLike[],
  size: ContainerSize,
  isMobile: boolean
): Composition {
  if (cursor === -1) return IDENTITY;
  return resolveUsComposition("rivermont", projectedPins, size, isMobile, RIVERMONT_ZOOM_REDUCED);
}

/** — pin visual state — */

/** Rivermont: "upcoming" before rivermont-approach, "active" from rivermont-approach onward.
 *  Never "completed" in Phase 8 — that only begins once a later phase starts leaving Rivermont
 *  for Florida. Gainesville has no derivation here: it stays neutral/"unvisited" unconditionally,
 *  wired directly in JourneyUsMapStage. */
export function deriveRivermontStatus(cursor: -1 | 0): JourneyPinStatus {
  return cursor === -1 ? "upcoming" : "active";
}

export function toUsMapPinStatus(cursor: -1 | 0): PinStatus {
  return toMapPinStatus(deriveRivermontStatus(cursor));
}

/**
 * Rivermont story-panel opacity — a pure function of overall progress, independent of the camera
 * frame above (so a future camera tuning tweak can never desync it from the story). Enters late in
 * rivermont-approach (well after the camera's own SETTLE_FRACTION hold point), finishes entering
 * exactly at the rivermont-approach → rivermont-story boundary, then holds through most of
 * rivermont-story before retracting over its final stretch — deliberately not the Phase 5 Pin-5
 * mistake of only becoming readable right before its own exit.
 */
const STORY_ENTER_AT = RIVERMONT_APPROACH.end;
const STORY_ENTER_WIDTH = (RIVERMONT_APPROACH.end - RIVERMONT_APPROACH.start) * 0.35;
const STORY_EXIT_AT = RIVERMONT_STORY.end;
const STORY_EXIT_WIDTH = (RIVERMONT_STORY.end - RIVERMONT_STORY.start) * 0.2;

export function deriveRivermontStoryWeight(progress: number): number {
  return Math.min(rampUpFrom(progress, STORY_ENTER_AT, STORY_ENTER_WIDTH), rampDownTo(progress, STORY_EXIT_AT, STORY_EXIT_WIDTH));
}

export type UsMapStageHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  updateCamera: (progress: number) => void;
};
