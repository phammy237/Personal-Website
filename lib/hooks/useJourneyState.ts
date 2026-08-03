"use client";
import { useCallback, useState } from "react";
import { hanoiJourneyPins } from "@/data/hanoiJourney";

export type JourneyPinStatus = "unvisited" | "active" | "completed";

/** Active pin + completion state for a pin journey. Kept separate from rendering. */
export function useJourneyState() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const activePin = hanoiJourneyPins[activeIndex];
  const total = hanoiJourneyPins.length;

  const selectById = useCallback((id: string) => {
    const idx = hanoiJourneyPins.findIndex((p) => p.id === id);
    if (idx !== -1) setActiveIndex(idx);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  const prev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const markActiveCompleted = useCallback(() => {
    setCompletedIds((ids) => (ids.includes(activePin.id) ? ids : [...ids, activePin.id]));
  }, [activePin.id]);

  const statusFor = useCallback(
    (id: string): JourneyPinStatus => {
      if (id === activePin.id) return "active";
      if (completedIds.includes(id)) return "completed";
      return "unvisited";
    },
    [activePin.id, completedIds]
  );

  return {
    pins: hanoiJourneyPins,
    activePin,
    activeIndex,
    total,
    completedIds,
    selectById,
    next,
    prev,
    markActiveCompleted,
    statusFor,
    canPrev: activeIndex > 0,
    canNext: activeIndex < total - 1,
  };
}
