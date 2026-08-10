"use client";
import { ImagePlaceholder } from "@/components/biography/ImagePlaceholder";
import type { StorySection as StorySectionData } from "@/data/usJourney";

function SectionImage({
  src,
  caption,
  className,
}: {
  src?: string;
  caption?: string;
  className: string;
}) {
  return src ? (
    <div className={`relative overflow-hidden rounded-xl bg-accent-light dark:bg-white/5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption ?? ""} className="h-full w-full object-cover" />
    </div>
  ) : (
    <ImagePlaceholder className={className} caption={caption} />
  );
}

/**
 * One editorial "moment" inside a location's expanded story. Three layout
 * variants give the story visual rhythm without needing per-section custom code;
 * every image slot renders a placeholder block when no real photo exists yet.
 */
export function StorySection({ section, index }: { section: StorySectionData; index: number }) {
  const [img0, img1, img2, img3] = section.images;
  const [cap0, cap1] = section.captions ?? [];

  return (
    <div className="border-t border-border py-8 first:border-t-0 first:pt-0 dark:border-white/10 md:py-10">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-accent/60">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="font-display text-xl text-surface dark:text-white md:text-2xl">{section.heading}</h3>
      </div>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-muted dark:text-white/60">{section.body}</p>

      {section.layoutVariant === "hero-two-row" && (
        <div className="mt-6 space-y-3">
          <SectionImage src={img0} caption={cap0} className="aspect-[16/9] w-full" />
          <div className="grid grid-cols-2 gap-3">
            <SectionImage src={img1} caption={cap1} className="aspect-[4/3] w-full" />
            <SectionImage src={img2} className="aspect-[4/3] w-full" />
          </div>
        </div>
      )}

      {section.layoutVariant === "gallery" && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SectionImage src={img0} className="aspect-square w-full" />
          <SectionImage src={img1} className="aspect-square w-full" />
          <SectionImage src={img2} className="aspect-square w-full" />
          <SectionImage src={img3} className="hidden aspect-square w-full sm:block" />
        </div>
      )}

      {section.layoutVariant === "candid-pair" && (
        <div className="mt-6 space-y-3">
          <SectionImage src={img0} caption={cap0} className="aspect-[16/9] w-full" />
          <div className="grid grid-cols-2 gap-3 sm:w-2/3">
            <SectionImage src={img1} className="aspect-[4/3] w-full" />
            <SectionImage src={img2} className="aspect-[4/3] w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
