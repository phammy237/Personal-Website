"use client";
import { forwardRef } from "react";
import { JourneyPinPreviewCard } from "@/components/biography/journey/JourneyPinPreviewCard";
import type { HanoiJourneyPin } from "@/data/hanoiJourney";

/**
 * One Hanoi pin's compact preview card — small, map-first, a teaser only. This is NOT the full
 * story: "Learn More" opens a completely separate JourneyStoryModal (see JourneyStoryLayer), it
 * never morphs this panel in place. JourneyStoryLayer owns this element's opacity/transform via
 * the forwarded ref — nothing here animates on its own; prev/next only request a scroll (through
 * onPrev/onNext, wired to the existing scrollToPin path in GeographicJourney), never touch camera
 * or pin state directly, matching every other navigation affordance in this page.
 *
 * Aria-hidden/inert are applied imperatively by JourneyStoryLayer's scroll-tick loop (the same
 * place opacity/pointer-events are set) rather than as a React prop here — React 18 doesn't treat
 * `inert` as a recognized boolean attribute, so setting it via `element.inert = …` directly on the
 * forwarded ref is both simpler and avoids a console warning for a value that's functionally fine
 * either way. `loadMedia` gates whether real media actually loads — only the current and
 * immediately adjacent stories load media, matching the "don't eagerly load every image" rule.
 */
export const JourneyPinStoryPanel = forwardRef<
  HTMLDivElement,
  {
    pin: HanoiJourneyPin;
    loadMedia: boolean;
    index: number;
    total: number;
    /** true while the story modal is open for this location — "hide preview while modal is open,"
     *  applied on this static outer wrapper so it never fights the ref'd inner element's own
     *  scroll-weight-driven opacity/transform. */
    hidden?: boolean;
    onLearnMore: () => void;
    onPrev: () => void;
    onNext: () => void;
  }
>(function JourneyPinStoryPanel({ pin, loadMedia, index, total, hidden, onLearnMore, onPrev, onNext }, ref) {
  return (
    // Outer wrapper handles ALL layout positioning (mobile: bottom sheet; desktop: a fixed
    // right-edge column, not a floating card) — deliberately NOT via a CSS transform, because the
    // inner (ref'd) element's `transform` is owned entirely by the imperative slide-in animation
    // below. Combining the two in one element made the animation's `translateY(px)` silently
    // replace Tailwind's positioning (inline styles win over classes on the same property).
    //
    // Mobile bottom offset (pb-32) clears the mobile chapter rail, which sits fixed at bottom-20
    // with its own ~45px pill height — the sheet would otherwise render underneath it.
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-end justify-center px-3 pb-32 md:block md:px-0 md:pb-0 ${hidden ? "invisible" : ""}`}
    >
      <div
        ref={ref}
        id={`hanoi-story-${pin.id}`}
        role="region"
        aria-label={`Preview: ${pin.preview.title}`}
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: "none" }}
        // "an editorial column attached to the composition," not a floating card: flat background,
        // border-left only, no radius, no shadow, no blur, no gradient. Desktop: fixed to the right
        // edge, running from below nav to near the bottom, 440px preferred (400-30vw). Mobile
        // (<md): a bottom sheet.
        className="relative flex max-h-[56vh] w-full flex-col overflow-y-auto overflow-x-hidden border-t border-[rgba(73,82,110,0.12)] bg-[rgba(250,248,252,0.94)] dark:border-[rgba(180,174,205,0.14)] dark:bg-[rgba(8,13,27,0.94)] md:fixed md:right-0 md:top-[80px] md:bottom-6 md:max-h-none md:w-[440px] md:min-w-[400px] md:max-w-[30vw] md:border-t-0 md:border-l"
      >
        <JourneyPinPreviewCard
          number={pin.number}
          title={pin.preview.title}
          description={pin.preview.description}
          image={pin.image}
          mediaPlaceholder={pin.mediaPlaceholder}
          metaLabel={`Hanoi · Ages ${pin.ageRange}`}
          index={index}
          total={total}
          loadMedia={loadMedia}
          onLearnMore={onLearnMore}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
    </div>
  );
});
