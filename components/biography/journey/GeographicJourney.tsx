"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { journeyChapters, journeyStages, getChapterIndex, getStageAtProgress } from "@/lib/biography/journeyStages";
import type { JourneyChapterId, JourneyStageId } from "@/lib/biography/journeyTypes";
import { JourneyStage } from "@/components/biography/journey/JourneyStage";
import { JourneyEarthStage } from "@/components/biography/journey/JourneyEarthStage";
import { JourneyProgressRail } from "@/components/biography/journey/JourneyProgressRail";

const EARTH_INTRO_ID = "earth-intro";

/** scroll distance dedicated to each stage while the stage is pinned, in viewport-heights */
const STAGE_VH = 90;
const TOTAL_VH = STAGE_VH * journeyStages.length;
/** how far (in normalized progress) a stage fades in/out into its neighbors — the crossfade overlap */
const MOTION_FADE = (1 / journeyStages.length) * 0.6;
const REDUCED_FADE = (1 / journeyStages.length) * 0.25;

/** triangular falloff: 1 inside [start, end], ramping to 0 across `fade` on either side */
function stageWeight(progress: number, start: number, end: number, fade: number): number {
  if (progress < start - fade || progress > end + fade) return 0;
  if (progress >= start && progress <= end) return 1;
  if (progress < start) return (progress - (start - fade)) / fade;
  return 1 - (progress - end) / fade;
}

export function GeographicJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const todaySectionRef = useRef<HTMLDivElement>(null);
  const stageElsRef = useRef(new Map<JourneyStageId, HTMLDivElement>());
  const gsapRef = useRef<{ gsap: typeof import("gsap").gsap; trigger: import("gsap/ScrollTrigger").ScrollTrigger } | null>(
    null
  );

  const [activeStageId, setActiveStageId] = useState<JourneyStageId>(journeyStages[0].id);
  const activeStageIdRef = useRef(activeStageId);
  // edge-triggered (only flips at the earth-intro stage's fade boundary), not a per-frame value —
  // this is what lets the globe's Canvas pause its render loop instead of re-rendering every tick
  const [earthVisible, setEarthVisible] = useState(true);
  const earthVisibleRef = useRef(true);

  const reducedMotion = !!useReducedMotion();

  const setStageRef = useCallback((id: JourneyStageId) => (el: HTMLDivElement | null) => {
    if (el) stageElsRef.current.set(id, el);
    else stageElsRef.current.delete(id);
  }, []);

  const applyProgress = useCallback(
    (progress: number, gsapInstance?: typeof import("gsap").gsap) => {
      const fade = reducedMotion ? REDUCED_FADE : MOTION_FADE;
      for (const stage of journeyStages) {
        const el = stageElsRef.current.get(stage.id);
        if (!el) continue;
        const weight = stageWeight(progress, stage.start, stage.end, fade);
        if (gsapInstance) {
          if (reducedMotion) {
            gsapInstance.set(el, { opacity: weight, scale: 1, y: 0 });
          } else {
            gsapInstance.set(el, { opacity: weight, scale: 0.94 + 0.06 * weight, y: (1 - weight) * 28 });
          }
        } else {
          el.style.opacity = String(weight);
        }
        el.style.pointerEvents = weight > 0.5 ? "auto" : "none";
        el.setAttribute("aria-hidden", weight > 0.5 ? "false" : "true");

        if (stage.id === EARTH_INTRO_ID) {
          const nextVisible = weight > 0.01;
          if (nextVisible !== earthVisibleRef.current) {
            earthVisibleRef.current = nextVisible;
            setEarthVisible(nextVisible);
          }
        }
      }

      const current = getStageAtProgress(progress);
      if (current.id !== activeStageIdRef.current) {
        activeStageIdRef.current = current.id;
        setActiveStageId(current.id);
      }
    },
    [reducedMotion]
  );

  useEffect(() => {
    let cancelled = false;
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout>;

    (async () => {
      // Client-only: gsap/ScrollTrigger must never register or touch the DOM during SSR.
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const trigger = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyProgress(self.progress, gsap),
        });
        gsapRef.current = { gsap, trigger };
        // reflect whatever scroll position we already have (e.g. a mid-journey page refresh)
        applyProgress(trigger.progress, gsap);
      }, rootRef);

      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      };
      window.addEventListener("resize", onResize);
      (ctx as unknown as { __onResize?: () => void }).__onResize = onResize;
    })();

    return () => {
      cancelled = true;
      const onResize = (ctx as unknown as { __onResize?: () => void } | null)?.__onResize;
      if (onResize) window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      ctx?.revert();
      gsapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const activeStage = journeyStages.find((s) => s.id === activeStageId) ?? journeyStages[0];
  const activeChapterIndex = getChapterIndex(activeStage.chapter);

  const scrollToStageStart = useCallback((stageId: JourneyStageId) => {
    const stage = journeyStages.find((s) => s.id === stageId);
    const root = rootRef.current;
    if (!stage || !root) return;
    const rect = root.getBoundingClientRect();
    const wrapperTop = rect.top + window.scrollY;
    const scrollableRange = root.offsetHeight - window.innerHeight;
    // nudge a hair past the exact boundary — landing precisely on stage.start can round down a
    // fraction of a pixel short and get classified as the previous (adjacent) stage instead
    const targetProgress = Math.min(1, stage.start + 1 / journeyStages.length / 4);
    const targetY = wrapperTop + Math.max(0, scrollableRange) * targetProgress;
    window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const scrollToTodaySection = useCallback(() => {
    const el = todaySectionRef.current;
    if (!el) return;
    const targetY = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const navigateToChapter = useCallback(
    (chapterId: JourneyChapterId) => {
      if (chapterId === "today") {
        scrollToTodaySection();
        return;
      }
      const chapter = journeyChapters.find((c) => c.id === chapterId);
      if (chapter) scrollToStageStart(chapter.firstStageId);
    },
    [scrollToStageStart, scrollToTodaySection]
  );

  return (
    <div className="relative bg-navy">
      <div ref={rootRef} className="relative" style={{ height: `${TOTAL_VH}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {journeyStages.map((stage, index) =>
            stage.id === EARTH_INTRO_ID ? (
              <JourneyEarthStage
                key={stage.id}
                ref={setStageRef(stage.id)}
                stage={stage}
                initiallyActive={index === 0}
                visible={earthVisible}
              />
            ) : (
              <JourneyStage
                key={stage.id}
                ref={setStageRef(stage.id)}
                stage={stage}
                index={index}
                total={journeyStages.length}
                initiallyActive={index === 0}
              />
            )
          )}
        </div>
      </div>

      <JourneyProgressRail
        chapters={journeyChapters}
        activeChapterId={activeStage.chapter}
        activeChapterIndex={activeChapterIndex}
        onNavigate={navigateToChapter}
      />

      {activeStage.id !== "today-ahead" && (
        <button
          type="button"
          onClick={scrollToTodaySection}
          className="fixed right-4 top-20 z-40 rounded-full border border-white/20 bg-navy-deep/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm transition-colors hover:border-accent-lavender/60 hover:text-white md:right-8"
        >
          Skip Journey →
        </button>
      )}

      <section
        ref={todaySectionRef}
        aria-label="Today & Ahead"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 bg-navy px-6 py-24 text-center"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-lavender">Today &amp; Ahead</p>
        <h2 className="max-w-2xl font-display text-4xl text-white md:text-5xl">The journey continues here.</h2>
        <p className="max-w-xl font-body text-base leading-relaxed text-white/60">
          This is the landing point for the full story — where the real narrative, photos, and what comes next will
          live once the journey is fully connected.
        </p>
      </section>
    </div>
  );
}
