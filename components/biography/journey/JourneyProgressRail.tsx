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
 * the sticky stage's own content.
 */
export function JourneyProgressRail({ chapters, activeChapterId, activeChapterIndex, onNavigate }: JourneyProgressRailProps) {
  return (
    <>
      <nav
        aria-label="Journey chapters"
        className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex lg:right-8"
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
                  isActive ? "text-white" : isCompleted ? "text-accent-lavender/70" : "text-white/30"
                }`}
              >
                {chapter.label}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full border transition-all ${
                  isActive
                    ? "scale-125 border-accent-lavender bg-accent-lavender"
                    : isCompleted
                      ? "border-accent-lavender/70 bg-accent-lavender/70"
                      : "border-white/30 bg-transparent group-hover:border-white/60"
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
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-navy-deep/85 px-2 py-2 backdrop-blur-sm">
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
                    ? "bg-accent-lavender text-navy"
                    : isCompleted
                      ? "text-accent-lavender/80"
                      : "text-white/40"
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
