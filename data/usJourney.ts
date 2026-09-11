export type GeoPoint = { lat: number; lon: number };

/** One editorial "moment" inside a location's expanded story — not a map pin. */
export type StorySection = {
  id: string;
  heading: string;
  /** short placeholder paragraph — replace with real content later */
  body: string;
  /** image paths; leave empty until real photos are dropped in, components render a placeholder block instead */
  images: string[];
  captions?: string[];
  /** controls which editorial layout StorySection uses when rendered */
  layoutVariant: "hero-two-row" | "gallery" | "candid-pair";
};

export type USJourneyPin = {
  id: string;
  /** number shown on the map pin */
  number: number;
  /** short map label */
  title: string;
  /** short map subtitle */
  subtitle: string;
  /** loose placeholder era label — not a precise date range yet */
  yearRange: string;
  coordinates: GeoPoint;
  /** optional — omit until a real photo exists; UI falls back to a placeholder block */
  image?: string;
  preview: {
    title: string;
    description: string;
  };
  /** the location's expanded photo story, built from placeholder sections for now (Phase 2 renders these) */
  storySections: StorySection[];
  gallery?: string[];
};

export const usJourneyCopy = {
  eyebrow: "Chapter 02 · Becoming",
  heading: "United States",
  instruction: "Follow the main route or select a location.",
};

export const usMemoriesCopy = {
  eyebrow: "US Chapter · More to come",
  heading: "There's more to this chapter.",
  body: "Beyond Rivermont and Gainesville, there are more places and people worth marking on this map — I'm adding them next.",
};

export const usJourneyPins: USJourneyPin[] = [
  {
    id: "rivermont",
    number: 1,
    title: "Rivermont Collegiate",
    subtitle: "A new home",
    yearRange: "[Placeholder]",
    // NOTE: placeholder coordinate only — replace with Rivermont's real location.
    coordinates: { lat: 41.7, lon: -90.5 },
    preview: {
      title: "Rivermont Collegiate",
      description: "[One-line placeholder description.]",
    },
    storySections: [
      {
        id: "arrival",
        heading: "Arrival / A New Home",
        body: "[Placeholder paragraph about arriving at Rivermont.]",
        images: [],
        captions: ["[Placeholder caption]"],
        layoutVariant: "hero-two-row",
      },
      {
        id: "community",
        heading: "Creating Community",
        body: "[Placeholder paragraph — Asian Culture Club content goes here.]",
        images: [],
        layoutVariant: "gallery",
      },
      {
        id: "caring",
        heading: "Caring for a Community",
        body: "[Placeholder paragraph — Dorm Prefect content goes here.]",
        images: [],
        layoutVariant: "candid-pair",
      },
    ],
  },
  {
    id: "gainesville",
    number: 2,
    title: "Gainesville",
    subtitle: "University of Florida",
    yearRange: "[Placeholder]",
    coordinates: { lat: 29.6516, lon: -82.3248 },
    preview: {
      title: "Gainesville / University of Florida",
      description: "[One-line placeholder description.]",
    },
    storySections: [
      {
        id: "learning",
        heading: "Learning",
        body: "[Placeholder — university, academics, research, technical interests.]",
        images: [],
        layoutVariant: "hero-two-row",
      },
      {
        id: "building",
        heading: "Building",
        body: "[Placeholder — projects, products, technical work.]",
        images: [],
        layoutVariant: "gallery",
      },
      {
        id: "leading",
        heading: "Leading",
        body: "[Placeholder — organizations, events, communities.]",
        images: [],
        layoutVariant: "candid-pair",
      },
      {
        id: "connecting",
        heading: "Connecting / Returning",
        body: "[Placeholder — broader professional experiences, international connection, present direction.]",
        images: [],
        layoutVariant: "hero-two-row",
      },
    ],
  },
];

/** Secondary, non-numbered travel markers — populated later, none hardcoded yet. */
export type MemoryMarker = {
  id: string;
  coordinates: GeoPoint;
  image?: string;
  title: string;
  caption: string;
};

export const usMemoryMarkers: MemoryMarker[] = [];
