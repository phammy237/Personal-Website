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
        className="fixed right-[30px] top-[40vh] z-40 hidden flex-col items-end gap-6 md:flex"
      >
        {/* faint vertical connector spanning all four stops — sits behind the dots, not a card */}
        <div
          className="pointer-events-none absolute right-[4px] top-3 bottom-3 w-px bg-[rgba(38,49,91,0.14)] dark:bg-[rgba(180,174,205,0.12)]"
          aria-hidden="true"
        />
        {chapters.map((chapter) => {
          const isActive = chapter.id === activeChapterId;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onNavigate(chapter.id)}
              aria-current={isActive ? "step" : undefined}
              // Active/inactive are told apart by color (dark ink + filled accent dot vs. muted gray
              // + hollow dot), not by opacity — "do not make inactive states almost invisible."
              className="group relative flex items-center gap-2.5 transition-colors"
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? "text-[#1D2340] dark:text-[#F3F0F6]"
                    : "text-[#7D84A3] group-hover:text-[#4F5778] dark:text-[rgba(243,240,246,0.5)] dark:group-hover:text-[#F3F0F6]"
                }`}
              >
                {chapter.label}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-[#7C6AF2] shadow-[0_0_6px_rgba(124,106,242,0.35)] dark:bg-[#A28BE8] dark:shadow-[0_0_6px_rgba(148,128,216,0.25)]"
                    : "border border-[#B7AEF6] bg-transparent group-hover:border-[#7C6AF2] dark:border-[rgba(180,174,205,0.34)] dark:group-hover:border-[#A28BE8]"
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
        <div className="flex items-center gap-1 rounded-full border border-[rgba(38,49,91,0.12)] bg-[#FBFAFD]/90 px-2 py-2 backdrop-blur-sm dark:border-white/15 dark:bg-navy-deep/85">
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
                    ? "bg-[#7C6AF2] text-white dark:bg-accent-lavender dark:text-navy"
                    : isCompleted
                      ? "text-[#7C6AF2] dark:text-accent-lavender/80"
                      : "text-[#7D84A3] dark:text-white/40"
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
