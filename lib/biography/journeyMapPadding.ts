import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, smoothstep, stageWeight } from "@/lib/biography/journeyMotion";

export type JourneyMapPadding = { top: number; bottom: number; left: number; right: number };

const ZERO_PADDING: JourneyMapPadding = { top: 0, bottom: 0, left: 0, right: 0 };

const HANOI_APPROACH = getStageById("hanoi-approach");
const HANOI_OVERVIEW = getStageById("hanoi-overview");
const HANOI_DEPARTURE = getStageById("hanoi-departure");

/** matches JourneyHeroContent's own fade window (see GeographicJourney's HERO_FADE_COMPLETE_AT) */
const EARTH_ZONE_END = HANOI_APPROACH.start; // 0.1
/** matches JourneyHanoiIntroPanel's own EDGE_FADE */
const INTRO_EDGE_FADE = 0.02;
/** how much of hanoi-pin-1's own window the story-panel padding takes to ramp in */
const STORY_PADDING_RAMP = 0.02;

const EARTH_PADDING_RIGHT = 70; // clears the right-side chapter rail — see JourneyMapCanvas Phase 1 notes
const HANOI_INTRO_PADDING_LEFT = 380; // clears the left-column Hanoi intro panel (max-w-sm)
const STORY_PADDING_RIGHT = 380; // clears the right-anchored pin story panel (md:w-[min(340px,30vw)] + margin)

/**
 * Single source of truth for every screen-space reservation the persistent map's camera needs —
 * "centralize padding states rather than sprinkling magic offsets through components" (Phase 2).
 * Pure function of (progress, isMobile); callers never compute padding themselves. Each zone ramps
 * in/out using the same fade window as the DOM panel it's clearing room for, so the camera shift and
 * the panel's own fade always resolve together.
 */
export function computeJourneyMapPadding(progress: number, isMobile: boolean): JourneyMapPadding {
  // Mobile has no persistent side column reserving space this way — panels are bottom sheets there
  // instead (see JourneyHeroContent/JourneyHanoiIntroPanel/JourneyPinStoryPanel's own md: breakpoints).
  if (isMobile) return ZERO_PADDING;

  if (progress < EARTH_ZONE_END) {
    const t = smoothstep(progress / EARTH_ZONE_END);
    return { ...ZERO_PADDING, right: lerp(EARTH_PADDING_RIGHT, 0, t) };
  }

  if (progress < HANOI_OVERVIEW.start) {
    return ZERO_PADDING; // hanoi-approach: camera panning in, no panel visible yet
  }

  if (progress < HANOI_OVERVIEW.end) {
    const weight = stageWeight(progress, HANOI_OVERVIEW.start, HANOI_OVERVIEW.end, INTRO_EDGE_FADE);
    return { ...ZERO_PADDING, left: HANOI_INTRO_PADDING_LEFT * weight };
  }

  if (progress < HANOI_DEPARTURE.start) {
    const t = smoothstep(clamp01((progress - HANOI_OVERVIEW.end) / STORY_PADDING_RAMP));
    return { ...ZERO_PADDING, right: STORY_PADDING_RIGHT * t };
  }

  return ZERO_PADDING;
}
