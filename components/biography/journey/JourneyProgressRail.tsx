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
        className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 bg-gradient-to-l from-black/5 to-transparent py-8 pl-10 pr-4 dark:from-navy-deep/40 md:flex lg:pr-8"
      >
        {chapters.map((chapter, i) => {
          const isActive = chapter.id === activeChapterId;
          const isCompleted = i < activeChapterIndex;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onNavigate(chapter.id)}
              aria-current={isActive ? "step" : undefined}
              className="group flex items-center gap-2.5"
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  isActive
                    ? "text-surface dark:text-white"
                    : isCompleted
                      ? "text-accent/70 dark:text-accent-lavender/70"
                      : "text-muted/50 dark:text-white/30"
                }`}
              >
                {chapter.label}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full border transition-all ${
                  isActive
                    ? "scale-125 border-accent bg-accent dark:border-accent-lavender dark:bg-accent-lavender"
                    : isCompleted
                      ? "border-accent/70 bg-accent/70 dark:border-accent-lavender/70 dark:bg-accent-lavender/70"
                      : "border-border bg-transparent group-hover:border-accent/60 dark:border-white/30 dark:group-hover:border-white/60"
                }`}
              />
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
