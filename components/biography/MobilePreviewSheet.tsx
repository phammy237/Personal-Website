"use client";
import type { HanoiJourneyPin } from "@/data/hanoiJourney";
import { PinPreviewCard } from "@/components/biography/PinPreviewCard";

export function MobilePreviewSheet({
  pin,
  index,
  total,
  onLearnMore,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  pin: HanoiJourneyPin;
  index: number;
  total: number;
  onLearnMore: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      <PinPreviewCard
        pin={pin}
        index={index}
        total={total}
        onLearnMore={onLearnMore}
        onPrev={onPrev}
        onNext={onNext}
        canPrev={canPrev}
        canNext={canNext}
        className="rounded-b-none rounded-t-2xl border-b-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
      />
    </div>
  );
}
