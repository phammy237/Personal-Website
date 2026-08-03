"use client";
import type { HanoiJourneyPin } from "@/data/hanoiJourney";
import { MapPin, type PinStatus } from "@/components/biography/MapPin";
import { RoutePath } from "@/components/biography/RoutePath";
import { PinLabel } from "@/components/biography/PinLabel";

export const HANOI_MAP_WIDTH = 900;
export const HANOI_MAP_HEIGHT = 680;

export type ProjectedPin = HanoiJourneyPin & { x: number; y: number };

export function HanoiMap({
  pins,
  activePinId,
  statusFor,
  onSelectPin,
  riverPathD,
  lakePathD,
  reducedMotion,
}: {
  pins: ProjectedPin[];
  activePinId: string;
  statusFor: (id: string) => PinStatus;
  onSelectPin: (id: string) => void;
  riverPathD?: string;
  lakePathD?: string;
  reducedMotion: boolean;
}) {
  const activeIndex = pins.findIndex((p) => p.id === activePinId);
  const progress = pins.length > 1 ? activeIndex / (pins.length - 1) : 1;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-[#F8F7FF] dark:border-white/10 dark:bg-[#0D0B1F]"
      style={{ aspectRatio: `${HANOI_MAP_WIDTH} / ${HANOI_MAP_HEIGHT}` }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-0 blur-3xl dark:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)" }}
      />

      {/* water backdrop: real Red River + West Lake geometry, low-contrast */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${HANOI_MAP_WIDTH} ${HANOI_MAP_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {lakePathD && (
          <path d={lakePathD} className="fill-[#D9E4FA] stroke-[#B9CBF0] dark:fill-[#16233F] dark:stroke-[#233457]" strokeWidth={1} />
        )}
        {riverPathD && (
          <path d={riverPathD} fill="none" strokeWidth={16} strokeLinecap="round" className="stroke-[#D9E4FA] dark:stroke-[#16233F]" />
        )}
      </svg>

      <RoutePath
        points={pins.map((p) => ({ x: p.x, y: p.y }))}
        width={HANOI_MAP_WIDTH}
        height={HANOI_MAP_HEIGHT}
        progress={progress}
        reducedMotion={reducedMotion}
      />

      {pins.map((pin) => {
        const side = pin.x > 45 ? "left" : "right";
        const status = statusFor(pin.id);
        return (
          <div key={pin.id}>
            <PinLabel
              title={pin.title}
              subtitle={pin.subtitle}
              x={pin.x}
              y={pin.y}
              side={side}
              active={pin.id === activePinId}
              onClick={() => onSelectPin(pin.id)}
            />
            <MapPin
              number={pin.number}
              x={pin.x}
              y={pin.y}
              status={status}
              label={`Stop ${pin.number}: ${pin.title}`}
              onClick={() => onSelectPin(pin.id)}
              reducedMotion={reducedMotion}
            />
          </div>
        );
      })}
    </div>
  );
}
