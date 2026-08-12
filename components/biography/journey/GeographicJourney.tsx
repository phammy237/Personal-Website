"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { journeyChapters, journeyStages, getChapterIndex, getStageAtProgress } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import { APPROACH_STAGE_IDS, computeApproachViewState, computeGlobeOpacity, computeMapOpacity } from "@/lib/biography/journeyCamera";
import { HANOI_PIN_STAGE_IDS_SET, type HanoiMapStageHandle } from "@/lib/biography/hanoiCamera";
import type { JourneyChapterId, JourneyStageId } from "@/lib/biography/journeyTypes";
import type { SatelliteGlobeHandle } from "@/components/biography/SatelliteGlobeCanvas";
import { JourneyStage } from "@/components/biography/journey/JourneyStage";
import { JourneyEarthStage } from "@/components/biography/journey/JourneyEarthStage";
import { JourneyHanoiMapStage } from "@/components/biography/journey/JourneyHanoiMapStage";
import { JourneyProgressRail } from "@/components/biography/journey/JourneyProgressRail";

const EARTH_INTRO_ID: JourneyStageId = "earth-intro";

/** scroll distance dedicated to each stage while the stage is pinned, in viewport-heights */
const STAGE_VH = 90;
const TOTAL_VH = STAGE_VH * journeyStages.length;
/** how far (in normalized progress) a stage fades in/out into its neighbors — the crossfade overlap */
const MOTION_FADE = (1 / journeyStages.length) * 0.6;
const REDUCED_FADE = (1 / journeyStages.length) * 0.25;

export function GeographicJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const todaySectionRef = useRef<HTMLDivElement>(null);
  const stageElsRef = useRef(new Map<JourneyStageId, HTMLDivElement>());
  const earthContainerRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const globeHandleRef = useRef<SatelliteGlobeHandle | null>(null);
  const hanoiMapHandleRef = useRef<HanoiMapStageHandle | null>(null);
  const gsapRef = useRef<{ gsap: typeof import("gsap").gsap; trigger: import("gsap/ScrollTrigger").ScrollTrigger } | null>(
    null
  );

  const [activeStageId, setActiveStageId] = useState<JourneyStageId>(journeyStages[0].id);
  const activeStageIdRef = useRef(activeStageId);
  // edge-triggered (only flips when the globe's own opacity crosses ~0), not a per-frame value —
  // this is what lets the globe's Canvas pause its render loop instead of re-rendering every tick
  const [earthVisible, setEarthVisible] = useState(true);
  const earthVisibleRef = useRef(true);
  // the very first applyProgress call (right after ScrollTrigger mounts) must never trigger an
  // animated camera transition, even on a mid-journey refresh where activeStageIdRef's hardcoded
  // default ("earth-intro") doesn't yet match the real stage — see applyProgress below
  const initialSyncRef = useRef(true);

  const reducedMotion = !!useReducedMotion();

  const setStageRef = useCallback((id: JourneyStageId) => (el: HTMLDivElement | null) => {
    if (el) stageElsRef.current.set(id, el);
    else stageElsRef.current.delete(id);
  }, []);

  const applyProgress = useCallback(
    (progress: number, gsapInstance?: typeof import("gsap").gsap) => {
      const fade = reducedMotion ? REDUCED_FADE : MOTION_FADE;
      const current = getStageAtProgress(progress);
      const previousStageId = activeStageIdRef.current;

      // generic per-stage crossfade for every stage except the ones absorbed into the combined
      // Earth → Vietnam → Hanoi map block below (that block needs to stay solid across several
      // stage boundaries instead of fading at each one, so it can't use this per-stage weight)
      for (const stage of journeyStages) {
        if (APPROACH_STAGE_IDS.has(stage.id) || HANOI_PIN_STAGE_IDS_SET.has(stage.id)) continue;
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
      }

      // combined approach: one continuous globe camera move, crossfading into the Hanoi map
      const globeOpacity = computeGlobeOpacity(progress, fade);
      const mapOpacity = computeMapOpacity(progress, fade);
      const viewState = computeApproachViewState(progress, reducedMotion);

      const crossingEarthIntroBoundary =
        !initialSyncRef.current &&
        !reducedMotion &&
        (previousStageId === EARTH_INTRO_ID) !== (current.id === EARTH_INTRO_ID);
      globeHandleRef.current?.setViewState(viewState, { animate: crossingEarthIntroBoundary });
      hanoiMapHandleRef.current?.updateCamera(progress);

      const earthEl = earthContainerRef.current;
      if (earthEl) {
        if (gsapInstance) {
          if (reducedMotion) gsapInstance.set(earthEl, { opacity: globeOpacity, scale: 1, y: 0 });
          else gsapInstance.set(earthEl, { opacity: globeOpacity, scale: 0.97 + 0.03 * globeOpacity });
        } else {
          earthEl.style.opacity = String(globeOpacity);
        }
        earthEl.style.pointerEvents = globeOpacity > 0.5 ? "auto" : "none";
        earthEl.setAttribute("aria-hidden", globeOpacity > 0.5 ? "false" : "true");
      }

      const mapEl = mapContainerRef.current;
      if (mapEl) {
        if (gsapInstance) {
          if (reducedMotion) gsapInstance.set(mapEl, { opacity: mapOpacity, scale: 1, y: 0 });
          else gsapInstance.set(mapEl, { opacity: mapOpacity, scale: 0.92 + 0.08 * mapOpacity });
        } else {
          mapEl.style.opacity = String(mapOpacity);
        }
        mapEl.style.pointerEvents = mapOpacity > 0.5 ? "auto" : "none";
        mapEl.setAttribute("aria-hidden", mapOpacity > 0.5 ? "false" : "true");
      }

      const nextEarthVisible = globeOpacity > 0.01;
      if (nextEarthVisible !== earthVisibleRef.current) {
        earthVisibleRef.current = nextEarthVisible;
        setEarthVisible(nextEarthVisible);
      }

      if (current.id !== previousStageId) {
        activeStageIdRef.current = current.id;
        setActiveStageId(current.id);
      }
      initialSyncRef.current = false;
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
        initialSyncRef.current = true;
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
  const earthInteractive = activeStageId === EARTH_INTRO_ID;

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
          {journeyStages.map((stage, index) => {
            if (stage.id === EARTH_INTRO_ID) {
              return (
                <Fragment key="earth-approach">
                  <JourneyEarthStage
                    ref={(el) => {
                      earthContainerRef.current = el;
                    }}
                    handleRef={globeHandleRef}
                    visible={earthVisible}
                    interactive={earthInteractive}
                  />
                  <JourneyHanoiMapStage
                    ref={(el) => {
                      mapContainerRef.current = el;
                    }}
                    handleRef={hanoiMapHandleRef}
                    reducedMotion={reducedMotion}
                  />
                </Fragment>
              );
            }
            if (APPROACH_STAGE_IDS.has(stage.id) || HANOI_PIN_STAGE_IDS_SET.has(stage.id)) return null; // absorbed above
            return (
              <JourneyStage
                key={stage.id}
                ref={setStageRef(stage.id)}
                stage={stage}
                index={index}
                total={journeyStages.length}
                initiallyActive={index === 0}
              />
            );
          })}
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
