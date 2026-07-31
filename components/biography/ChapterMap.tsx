"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Chapter } from "@/data/biography";
import { MapPin, type PinStatus } from "@/components/biography/MapPin";
import { RoutePath } from "@/components/biography/RoutePath";

const MAP_WIDTH = 640;
const MAP_HEIGHT = 560;

export function ChapterMap({
  chapter,
  completedPinIds,
  activePinId,
  onSelectPin,
}: {
  chapter: Chapter;
  completedPinIds: string[];
  activePinId: string | null;
  onSelectPin: (pinId: string) => void;
}) {
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  const statusFor = (pinId: string): PinStatus => {
    if (completedPinIds.includes(pinId)) return "completed";
    if (pinId === activePinId || pinId === hoveredPinId) return "active";
    return "unvisited";
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-[#F8F7FF]" style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}>
      <div className="absolute left-6 top-6 md:left-8 md:top-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{chapter.mapEyebrow}</p>
        <h2 className="mt-1 font-display text-xl text-surface">{chapter.mapLabel}</h2>
      </div>

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <RoutePath points={chapter.pins.map((p) => ({ x: p.x, y: p.y }))} width={MAP_WIDTH} height={MAP_HEIGHT} />
        {chapter.pins.map((pin) => (
          <div
            key={pin.id}
            onMouseEnter={() => setHoveredPinId(pin.id)}
            onMouseLeave={() => setHoveredPinId(null)}
            className="contents"
          >
            <MapPin
              number={pin.number}
              x={pin.x}
              y={pin.y}
              status={statusFor(pin.id)}
              label={`Stop ${pin.number}: ${pin.title}`}
              onClick={() => onSelectPin(pin.id)}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
