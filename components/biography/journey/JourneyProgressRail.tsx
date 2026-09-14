import type { JourneyChapterConfig, JourneyChapterId } from "@/lib/biography/journeyTypes";

type JourneyProgressRailProps = {
  chapters: JourneyChapterConfig[];
  activeChapterId: JourneyChapterId;
  activeChapterIndex: number;
  onNavigate: (chapterId: JourneyChapterId) => void;
};

/**
 * Four-chapter rail reading straight off the centralized `journeyChapters` config — desktop gets
 * a vertical rail pinned to the right edge, mobile gets a bottom bar that stays out of the way of
 * the sticky stage's own content. Fully theme-aware (site's light/dark tokens), matching the map
 * and story panels rather than assuming the page is always dark.
 */
export function JourneyProgressRail({ chapters, activeChapterId, activeChapterIndex, onNavigate }: JourneyProgressRailProps) {
  return (
    <>
      <nav
        aria-label="Journey chapters"
        className="fixed right-[48px] top-[40vh] z-40 hidden w-[100px] flex-col items-end gap-6 md:flex"
      >
        {/* faint vertical connector spanning all four stops — sits behind the dots, not a card */}
        <div
          className="pointer-events-none absolute right-[5px] top-3 bottom-3 w-px bg-[rgba(180,160,255,0.16)]"
          aria-hidden="true"
        />
        {chapters.map((chapter, i) => {
          const isActive = chapter.id === activeChapterId;
          const isCompleted = i < activeChapterIndex;
          return (
            <button key={chapter.id} type="button" onClick={() => onNavigate(chapter.id)} aria-current={isActive ? "step" : undefined} className="group relative flex items-center gap-3">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  isActive ? "text-[#F4F1FB]" : "text-[rgba(205,200,225,0.38)] group-hover:text-[rgba(205,200,225,0.6)]"
                }`}
              >
                {chapter.label}
              </span>
              <span className="relative flex h-[22px] w-[22px] items-center justify-center">
                {isActive && (
                  <span
                    className="absolute h-[22px] w-[22px] rounded-full bg-[rgba(199,186,255,0.35)]"
                    style={{ filter: "blur(5px)" }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative rounded-full transition-all ${
                    isActive
                      ? "h-3 w-3 bg-[#C7BAFF]"
                      : isCompleted
                        ? "h-2 w-2 border border-[rgba(180,160,255,0.55)] bg-[rgba(142,107,255,0.4)]"
                        : "h-2 w-2 border border-[rgba(180,160,255,0.45)] bg-transparent group-hover:border-[#A98CFF]"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </nav>

      <nav
        aria-label="Journey chapters"
        className="fixed inset-x-0 bottom-20 z-40 flex justify-center md:hidden"
      >
        <div className="flex items-center gap-1 rounded-full border border-border bg-white/85 px-2 py-2 backdrop-blur-sm dark:border-white/15 dark:bg-navy-deep/85">
          {chapters.map((chapter, i) => {
            const isActive = chapter.id === activeChapterId;
            const isCompleted = i < activeChapterIndex;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onNavigate(chapter.id)}
                aria-current={isActive ? "step" : undefined}
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? "bg-accent text-white dark:bg-accent-lavender dark:text-navy"
                    : isCompleted
                      ? "text-accent/80 dark:text-accent-lavender/80"
                      : "text-muted/60 dark:text-white/40"
                }`}
              >
                {chapter.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
