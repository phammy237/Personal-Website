"use client";
import { forwardRef } from "react";
import { StorySection } from "@/components/biography/StorySection";
import type { USJourneyPin } from "@/data/usJourney";

/**
 * One U.S. location's story, in the same purple/white persistent-panel language as Phase 6's
 * JourneyPinStoryPanel (Hanoi), but shaped for `USJourneyPin`'s richer, multi-section story shape
 * (`storySections` with per-section layout variants and images) rather than Hanoi's flat backstory
 * paragraph array — the two data shapes differ materially, so this is a small sibling component
 * rather than a forced generalization, per Phase 8's story-panel guidance. Section bodies reuse the
 * existing `StorySection` renderer verbatim (three layout variants, placeholder-image handling)
 * instead of re-implementing that layout logic here.
 *
 * JourneyStoryLayer owns this element's opacity/transform via the forwarded ref — nothing here
 * animates on its own. Aria-hidden/inert are likewise applied imperatively by the caller's
 * scroll-tick loop, matching JourneyPinStoryPanel's own established pattern. `loadMedia` gates
 * whether real media actually loads — only the current and immediately adjacent stories load
 * media, matching JourneyPinStoryPanel's own perf gate.
 */
export const JourneyUsStoryPanel = forwardRef<HTMLDivElement, { pin: USJourneyPin; loadMedia: boolean }>(
  function JourneyUsStoryPanel({ pin, loadMedia }, ref) {
    return (
    // Same outer-wrapper/inner-ref split as JourneyPinStoryPanel, for the same reason: layout
    // positioning (mobile bottom sheet vs. desktop right panel) lives on this static wrapper via
    // flexbox, never as a transform, so it never fights with the inner element's own imperative
    // slide-in transform. Desktop right offset (pr-32/40) and mobile bottom offset (pb-36) match
    // the Hanoi panel's verified clearance from the progress rail and mobile chapter rail.
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-4 pb-36 md:items-center md:justify-end md:px-0 md:pb-0 md:pr-32 lg:pr-40">
      <div
        ref={ref}
        id={`us-story-${pin.id}`}
        role="region"
        aria-label={`Story: ${pin.preview.title}`}
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: "none" }}
        className="flex max-h-[32vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white/97 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-navy-mid/97 md:max-h-[70vh] md:w-[min(340px,30vw)] md:rounded-2xl"
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 pb-3 pt-4 dark:border-white/10 md:px-5 md:pt-5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-medium text-white">
            {String(pin.number).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg leading-tight text-surface dark:text-white">{pin.preview.title}</h2>
            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-accent">
              {pin.subtitle} · {pin.yearRange}
            </p>
          </div>
        </div>

        {/* overscroll-behavior stays at its default ("auto") — see JourneyPinStoryPanel's identical
            comment: this is what lets wheel/touch scrolling chain back to the page once the panel's
            own content reaches its scroll limit, instead of trapping the gesture. */}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <p className="font-body text-sm leading-relaxed text-muted dark:text-white/65">{pin.preview.description}</p>

          {pin.storySections.map((section, i) => (
            <StorySection key={section.id} section={section} index={i} loadMedia={loadMedia} />
          ))}
        </div>
      </div>
    </div>
    );
  }
);
