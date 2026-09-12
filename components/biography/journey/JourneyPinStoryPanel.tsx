"use client";
import { forwardRef } from "react";
import { StoryMedia } from "@/components/biography/StoryMedia";
import type { HanoiJourneyPin } from "@/data/hanoiJourney";

/**
 * One pin's story, in the same purple/white visual language as PinPreviewCard/ChapterStoryModal
 * but shaped for a persistent, non-modal, scroll-driven panel: the full existing backstory (not
 * the short "Learn more" teaser), reused verbatim. JourneyStoryLayer owns this element's
 * opacity/transform via the forwarded ref — nothing here animates on its own.
 *
 * Aria-hidden/inert are applied imperatively by JourneyStoryLayer's scroll-tick loop (the same
 * place opacity/pointer-events are set) rather than as a React prop here — React 18 doesn't treat
 * `inert` as a recognized boolean attribute, so setting it via `element.inert = …` directly on the
 * forwarded ref is both simpler and avoids a console warning for a value that's functionally fine
 * either way. `loadMedia` gates whether real media actually loads — only the current and
 * immediately adjacent stories load media, matching the "don't eagerly load every image" rule.
 */
export const JourneyPinStoryPanel = forwardRef<HTMLDivElement, { pin: HanoiJourneyPin; loadMedia: boolean }>(
  function JourneyPinStoryPanel({ pin, loadMedia }, ref) {
    const gallery = pin.gallery && pin.gallery.length > 0 ? pin.gallery : pin.image ? [pin.image] : [];

    return (
      // Outer wrapper handles ALL layout positioning via flexbox (mobile: bottom-anchored;
      // desktop: right-anchored + vertically centered) — deliberately NOT via a CSS transform,
      // because the inner (ref'd) element's `transform` is owned entirely by the imperative
      // slide-in animation below. Combining the two in one element made the animation's
      // `translateY(px)` silently replace Tailwind's `-translate-y-1/2` centering (inline styles
      // win over classes on the same property), pushing the panel hundreds of pixels off-screen.
      //
      // Desktop offset is deliberately generous (right-32/40, not right-6) — the progress rail is
      // also fixed + right-aligned + vertically centered at right-4/lg:right-8, so the panel needs
      // enough clearance to never overlap it (verified against the rail's measured position).
      //
      // Mobile bottom offset (pb-36) similarly clears the mobile chapter rail, which sits fixed at
      // bottom-20 with its own ~45px pill height — the sheet would otherwise render underneath it.
      <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-4 pb-36 md:items-center md:justify-end md:px-0 md:pb-0 md:pr-32 lg:pr-40">
        <div
          ref={ref}
          id={`hanoi-story-${pin.id}`}
          role="region"
          aria-label={`Story: ${pin.preview.title}`}
          aria-hidden="true"
          style={{ opacity: 0, pointerEvents: "none" }}
          // mobile max-height (32vh, not a taller value) is deliberately short: combined with the
          // pb-36 rail clearance above, this keeps the sheet's top edge below the active pin's
          // rendered bottom edge at Phase 5's mobile focus point (y: 0.36) AND its own bottom edge
          // above the mobile rail — verified by measuring all three rects directly, not eyeballing
          className="flex max-h-[32vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white/97 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-navy-mid/97 md:max-h-[70vh] md:w-[min(340px,30vw)] md:rounded-2xl"
        >
          <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 pb-3 pt-4 dark:border-white/10 md:px-5 md:pt-5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-medium text-white">
              {String(pin.number).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg leading-tight text-surface dark:text-white">{pin.preview.title}</h2>
              <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-accent">
                Hanoi · Ages {pin.ageRange}
              </p>
            </div>
          </div>

          {/* overscroll-behavior stays at its default ("auto"), not "contain" — contain would
              block wheel/touch scroll from chaining to the page once this reaches its own scroll
              limit, which is exactly the trapping the journey must never do. Natural scroll
              chaining (the browser default) is what lets scrolling over the story keep advancing
              the page once the story text itself can't scroll any further. */}
          <div
            className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mb-4">
              {/* "gallery" (not hero-two-row) — this represents the whole location's photo set, not
                  one narrative beat, so a richer capped grid serves pins with many real photos
                  (e.g. Nguyễn Huệ's 20) better than a single dominant hero shot would. */}
              <StoryMedia images={gallery} alt={pin.preview.title} variant="gallery" loadMedia={loadMedia} />
            </div>

            <div className="flex flex-col gap-3">
              {pin.backstory.map((paragraph, i) => (
                <p key={i} className="font-body text-sm leading-relaxed text-muted dark:text-white/65">
                  {paragraph}
                </p>
              ))}
            </div>

            {pin.subsections && (
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 dark:border-white/10">
                {pin.subsections.map((s) => (
                  <div key={s.title}>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{s.title}</p>
                    <p className="mt-1 font-body text-xs leading-relaxed text-muted dark:text-white/50">{s.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
