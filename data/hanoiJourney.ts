export type GeoPoint = { lat: number; lon: number };

export type HanoiJourneyPin = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  coordinates: GeoPoint;
  image: string;
  preview: {
    title: string;
    description: string;
  };
};

export const hanoiJourneyCopy = {
  eyebrow: "Chapter 01 · Roots",
  heading: "Hanoi Journey",
  instruction: "Select a numbered pin to open a chapter.",
};

export const hanoiJourneyPins: HanoiJourneyPin[] = [
  {
    id: "hanoi-roots",
    number: 1,
    title: "Hanoi",
    subtitle: "family roots / where curiosity began",
    coordinates: { lat: 21.0107, lon: 105.8182 },
    image: "/headshot.jpg",
    preview: { title: "Hanoi", description: "Family roots / where curiosity began." },
  },
  {
    id: "nam-thanh-cong",
    number: 2,
    title: "Nam Thành Công Primary School",
    subtitle: "my first classroom",
    coordinates: { lat: 21.0168, lon: 105.8112 },
    image: "/IMG_3794.JPG",
    preview: { title: "Nam Thành Công Primary School", description: "My first classroom." },
  },
  {
    id: "ngoi-sao-ha-noi",
    number: 3,
    title: "Ngôi Sao Hà Nội Primary School",
    subtitle: "learning to reach higher",
    coordinates: { lat: 21.0098, lon: 105.8003 },
    image: "/IMG_4610.JPG",
    preview: { title: "Ngôi Sao Hà Nội Primary School", description: "Learning to reach higher." },
  },
  {
    id: "cau-giay-secondary",
    number: 4,
    title: "Cầu Giấy Secondary School",
    subtitle: "a bigger canvas",
    coordinates: { lat: 21.03, lon: 105.798 },
    image: "/IMG_7605.JPG",
    preview: { title: "Cầu Giấy Secondary School", description: "A bigger canvas." },
  },
  {
    id: "nguyen-hue-gifted",
    number: 5,
    title: "Nguyễn Huệ School for the Gifted",
    subtitle: "beyond the classroom",
    coordinates: { lat: 20.9637, lon: 105.7658 },
    image: "/IMG_7729.JPG",
    preview: { title: "Nguyễn Huệ School for the Gifted", description: "Beyond the classroom." },
  },
];
