"use client";
import { forwardRef } from "react";
import { StoryMedia } from "@/components/biography/StoryMedia";
import { usMemoriesCopy, type MemoryMarker } from "@/data/usJourney";

/**
 * The us-memories overlay — not anchored to a numbered pin, so it's a lighter sibling of
 * JourneyUsStoryPanel rather than a forced reuse of that pin-shaped component. Renders the
 * tasteful "more to come" copy while `markers` is empty (today's case); once real markers exist,
 * each renders as a small photo + caption secondary memory — deliberately never promoted into a
 * full numbered geographic pin, since that's not what these are.
 *
 * JourneyStoryLayer owns this element's opacity/transform via the forwarded ref, the same
 * imperative pattern as JourneyUsStoryPanel — nothing here animates on its own.
 */
export const JourneyUsMemoriesPanel = forwardRef<HTMLDivElement, { markers: MemoryMarker[]; loadMedia: boolean }>(
  function JourneyUsMemoriesPanel({ markers, loadMedia }, ref) {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-20">
        <div
          ref={ref}
          role="region"
          aria-label="More U.S. memories"
          aria-hidden="true"
          style={{ opacity: 0, pointerEvents: "none" }}
          className="max-w-sm rounded-2xl border border-border bg-white/97 px-6 py-5 text-center shadow-2xl backdrop-blur dark:border-white/10 dark:bg-navy-mid/97"
        >
          {markers.length === 0 ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">{usMemoriesCopy.eyebrow}</p>
              <h2 className="mt-1.5 font-display text-lg leading-tight text-surface dark:text-white">
                {usMemoriesCopy.heading}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted dark:text-white/65">
                {usMemoriesCopy.body}
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-5 text-left">
              {markers.map((marker) => (
                <div key={marker.id}>
                  {marker.image && (
                    <div className="mb-2">
                      <StoryMedia images={[marker.image]} alt={marker.title} loadMedia={loadMedia} />
                    </div>
                  )}
                  <p className="font-display text-sm text-surface dark:text-white">{marker.title}</p>
                  <p className="mt-0.5 font-body text-xs leading-relaxed text-muted dark:text-white/60">{marker.caption}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
