/**
 * Single canonical color source for the biography journey's dark AND light modes — the map style,
 * route/pin/anchor layers (MapLibre paint, drawn in JS), the Earth atmosphere, and the edge
 * vignette all read from here instead of each hand-rolling its own theme branch. Dark values are
 * the existing, approved reference composition, copied verbatim from wherever they used to live
 * (mapStyle.ts, JourneyMapCanvas.tsx, JourneyEarthGlow.tsx, JourneyEdgeFade.tsx) — dark mode must
 * look effectively unchanged. Light values are new: "editorial atlas in daylight" — soft ivory/mist
 * background, cool slate map lines, lavender journey accents, never a pale/washed-out default
 * MapLibre light theme.
 *
 * React DOM text (headings, body copy, panel chrome) is NOT centralized here — those already have
 * an established canonical source of their own (tailwind.config.ts's text-surface/text-muted/
 * text-accent tokens + Tailwind's `dark:` variant), and stay that way. This file exists specifically
 * for values that have no Tailwind/CSS-class equivalent: colors baked into MapLibre paint
 * expressions and canvas-drawn pin icons, which only a plain JS object can serve.
 *
 * Light theme design direction: a NEUTRAL canvas + cool map tones, with purple reserved as an
 * accent (route, active pin, active states) — never a hue that tints the whole background, map, or
 * atmosphere. The earlier light pass leaned lavender across almost every token (background, water,
 * atmosphere, vignette all in the same purple-gray family with too little land/water lightness
 * contrast), which is what produced a washed-out "dark mode faded with white/purple" globe/map
 * instead of a deliberately-lit daytime one.
 */

export type BiographyJourneyThemeMode = "light" | "dark";

type RouteBand = { completed: string; current: string; future: string };

type BiographyJourneyTheme = {
  map: {
    background: string;
    water: string;
    waterway: string;
    waterLabel: string;
    boundaryCountry: string;
    boundaryState: string;
    roadMinor: string;
    roadMedium: string;
    roadMajor: string;
    cityLabel: string;
    majorGeoLabel: string;
    labelHalo: string;
    skyColor: string;
    horizonColor: string;
    /** the three curated Hanoi labels (districts, West Lake, Red River) — one shared tone */
    curatedLabel: string;
  };
  route: { core: RouteBand; glow: RouteBand };
  transpacific: {
    core: { current: string; transparent: string };
    glow: { current: string; transparent: string };
  };
  pin: {
    activeFill: string;
    activeStroke: string;
    activeHalo: string;
    activeNumberText: string;
    inactiveFill: string;
    inactiveStroke: string;
    inactiveNumberText: string;
    titleText: string;
    subtitleText: string;
    /** text-halo behind the map-drawn pin title/subtitle/number — matches the map's own background */
    labelHalo: string;
  };
  anchor: { glow: string; ring: string; dot: string };
  travelPoint: { dot: string; glow: string };
  /** JourneyEarthGlow's radial atmosphere ring — inner bright edge, outer soft falloff */
  atmosphere: { inner: string; outer: string; outerFade: string };
  /** JourneyEdgeFade's two vignette layers */
  edgeFade: { radial: string; side: string };
};

const dark: BiographyJourneyTheme = {
  map: {
    background: "#080D1B",
    water: "#0A1020",
    waterway: "rgba(170,175,200,0.12)",
    waterLabel: "rgba(190,190,210,0.24)",
    boundaryCountry: "rgba(160,160,180,0.10)",
    boundaryState: "rgba(160,160,180,0.08)",
    roadMinor: "rgba(170,170,195,0.10)",
    roadMedium: "rgba(190,188,210,0.15)",
    roadMajor: "rgba(210,205,225,0.23)",
    cityLabel: "rgba(225,220,235,0.32)",
    majorGeoLabel: "rgba(235,230,242,0.48)",
    labelHalo: "#080D1B",
    // Deliberately darker than `background` — the globe's sphere and the void around it (MapLibre's
    // "sky" in globe projection) must never share a color, or the sphere's edge disappears.
    skyColor: "#03050D",
    horizonColor: "#9480D8",
    curatedLabel: "rgba(199,186,255,0.52)",
  },
  route: {
    core: { completed: "rgba(176,157,242,0.26)", current: "rgba(176,157,242,0.92)", future: "rgba(176,157,242,0.10)" },
    glow: { completed: "rgba(142,115,230,0.05)", current: "rgba(142,115,230,0.20)", future: "rgba(142,115,230,0)" },
  },
  transpacific: {
    core: { current: "rgba(176,157,242,0.72)", transparent: "rgba(176,157,242,0)" },
    glow: { current: "rgba(142,115,230,0.12)", transparent: "rgba(142,115,230,0)" },
  },
  pin: {
    activeFill: "#9A82E8",
    activeStroke: "rgba(235,228,255,0.88)",
    activeHalo: "rgba(154,130,232,0.18)",
    activeNumberText: "#FFFFFF",
    inactiveFill: "#1B2340",
    inactiveStroke: "rgba(180,165,225,0.56)",
    inactiveNumberText: "rgba(235,230,245,0.76)",
    titleText: "#F4F1FB",
    subtitleText: "rgba(205,200,225,0.7)",
    labelHalo: "#121A33",
  },
  anchor: { glow: "#8E6BFF", ring: "#A98CFF", dot: "#F4F1FB" },
  travelPoint: { dot: "#C3B2FF", glow: "rgba(163,138,255,0.40)" },
  atmosphere: { inner: "rgba(210,225,255,0.42)", outer: "rgba(175,160,235,0.24)", outerFade: "rgba(135,110,225,0)" },
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(4,7,18,0) 50%, rgba(4,7,18,0.10) 66%, rgba(4,7,18,0.30) 82%, rgba(3,5,14,0.58) 100%)",
    side: "linear-gradient(to right, rgba(3,5,14,0.20) 0%, transparent 13%, transparent 87%, rgba(3,5,14,0.26) 100%)",
  },
};

const light: BiographyJourneyTheme = {
  map: {
    // Neutral, barely-cool off-white — NOT lavender-tinted. Land reads as "map surface, subtle gray"
    // rather than another purple-tinted layer; the page chrome around it stays the site's own
    // separate `base` token, so the map still reads as its own surface without matching hue.
    background: "#EDEEF1",
    // Materially darker/cooler than `background` on purpose — real land/water contrast is what
    // makes a pale vector globe/map read as "Earth," not just a flat disc. Previously land and
    // water were within a few units of each other in both hue and lightness, which is the actual
    // cause of the "blank pale circle" globe and "washed-out" flat map.
    water: "#D2DBE6",
    waterway: "rgba(70,90,120,0.30)",
    waterLabel: "rgba(55,75,105,0.55)",
    boundaryCountry: "rgba(55,64,88,0.32)",
    boundaryState: "rgba(55,64,88,0.18)",
    roadMinor: "rgba(85,94,112,0.16)",
    roadMedium: "rgba(75,85,106,0.22)",
    roadMajor: "rgba(65,76,98,0.36)",
    // Medium muted gray/slate — visible at a glance without competing with the story typography's
    // own much darker ink, and without the purple tint the previous values carried.
    cityLabel: "rgba(48,55,72,0.55)",
    majorGeoLabel: "rgba(28,32,46,0.76)",
    labelHalo: "#F2F3F5",
    // Deliberately a plain cool blue-gray, not lavender — this is the void behind the sphere, not
    // an accent moment, so it stays neutral. `horizonColor` alone carries the rim's subtle color.
    skyColor: "#EEF0F3",
    horizonColor: "#A9BEDD",
    // Curated labels are informational (Hanoi district/lake/river names), not a brand accent moment
    // — same neutral-slate family as the other map labels rather than a purple tint on top of them.
    curatedLabel: "rgba(58,66,86,0.62)",
  },
  route: {
    // Purple stays the route's own accent — brand hue at real opacity for completed/active — but the
    // future/inactive band shifts toward a cool gray-purple at low opacity instead of a dim version
    // of the same saturated brand purple, so it never reads as "more purple painted on the map."
    core: { completed: "rgba(143,121,232,0.32)", current: "rgba(143,121,232,0.92)", future: "rgba(150,152,168,0.14)" },
    glow: { completed: "rgba(168,149,242,0.06)", current: "rgba(168,149,242,0.18)", future: "rgba(150,152,168,0)" },
  },
  transpacific: {
    core: { current: "rgba(143,121,232,0.80)", transparent: "rgba(143,121,232,0)" },
    glow: { current: "rgba(168,149,242,0.16)", transparent: "rgba(168,149,242,0)" },
  },
  pin: {
    activeFill: "#8E74E4",
    activeStroke: "rgba(255,255,255,0.92)",
    activeHalo: "rgba(143,121,232,0.16)",
    activeNumberText: "#FFFFFF",
    // A bit more saturated than before — "still visible," not a pale circle that nearly disappears
    // into the (now also more dimensional) map surface.
    inactiveFill: "#B7ADD1",
    inactiveStroke: "rgba(90,82,130,0.56)",
    inactiveNumberText: "rgba(40,34,68,0.76)",
    titleText: "#1A1F33",
    subtitleText: "rgba(40,46,70,0.58)",
    labelHalo: "#F2F3F5",
  },
  anchor: { glow: "#8E74E4", ring: "#8F79E8", dot: "#3D2E7C" },
  travelPoint: { dot: "#7A63D6", glow: "rgba(143,121,232,0.35)" },
  // A quiet cool-blue edge, not a bright white/lavender halo — "separates from the page," never a
  // glowing ring. Both stops trend toward the same neutral-blue family as the vignette below.
  atmosphere: { inner: "rgba(150,178,220,0.22)", outer: "rgba(120,140,175,0.10)", outerFade: "rgba(120,140,175,0)" },
  // Neutral cool gray-blue, never purple — "barely noticed," providing depth at the frame's edges
  // without visibly tinting the viewport.
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(198,204,214,0) 52%, rgba(198,204,214,0.16) 78%, rgba(188,195,207,0.32) 100%)",
    side: "linear-gradient(to right, rgba(198,204,214,0.10) 0%, transparent 13%, transparent 87%, rgba(198,204,214,0.14) 100%)",
  },
};

export const biographyJourneyTheme: Record<BiographyJourneyThemeMode, BiographyJourneyTheme> = { dark, light };

export function getBiographyJourneyTheme(mode: BiographyJourneyThemeMode): BiographyJourneyTheme {
  return biographyJourneyTheme[mode];
}
