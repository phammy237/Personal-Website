"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { journeyChapters, journeyStages, getChapterIndex, getStageAtProgress, getStageById } from "@/lib/biography/journeyStages";
import {
  derivePinCursor,
  derivePinStatus,
  toMapPinStatus,
  deriveRouteProgress,
  computePinClickTargetProgress,
} from "@/lib/biography/hanoiCamera";
import { computeGlobeArrivalOpacity } from "@/lib/biography/transpacificCamera";
import {
  RIVERMONT_PIN_ID,
  GAINESVILLE_PIN_ID,
  deriveRivermontStatus,
  deriveGainesvilleStatus,
  toUsMapPinStatus,
  computeUsRouteProgress,
  computeRivermontClickTargetProgress,
  computeGainesvilleClickTargetProgress,
} from "@/lib/biography/usCamera";
import { computeJourneyCameraState } from "@/lib/biography/journeyMapCamera";
import { computeEarthRasterCrossfade } from "@/lib/biography/earthRasterCrossfade";
import type { JourneyChapterId } from "@/lib/biography/journeyTypes";
import { useTheme } from "@/components/layout/ThemeProvider";
import { JourneyMapStage } from "@/components/biography/journey/JourneyMapStage";
import type { JourneyMapHandle } from "@/components/biography/journey/JourneyMapCanvas";
import { JourneyStoryLayer, type JourneyStoryLayerHandle } from "@/components/biography/journey/JourneyStoryLayer";
import { JourneyProgressRail } from "@/components/biography/journey/JourneyProgressRail";
import { JourneyPinPreview, type JourneyPinPreviewData } from "@/components/biography/journey/JourneyPinPreview";
import { JourneyHeroContent, type JourneyHeroContentHandle } from "@/components/biography/journey/JourneyHeroContent";
import { JourneyHanoiIntroPanel, type JourneyHanoiIntroPanelHandle } from "@/components/biography/journey/JourneyHanoiIntroPanel";
import { JourneyUsIntroPanel, type JourneyUsIntroPanelHandle } from "@/components/biography/journey/JourneyUsIntroPanel";
import { JourneyChapterComplete, type JourneyChapterCompleteHandle } from "@/components/biography/journey/JourneyChapterComplete";
import { JourneyInterlude, type JourneyInterludeHandle } from "@/components/biography/journey/JourneyInterlude";
import { JourneyEarthGlow, type JourneyEarthGlowHandle } from "@/components/biography/journey/JourneyEarthGlow";
import { JourneyEdgeFade, type JourneyEdgeFadeHandle } from "@/components/biography/journey/JourneyEdgeFade";
import { rampDownTo, easeOutCubic, lerp, stageWeight } from "@/lib/biography/journeyMotion";
import { hanoiJourneyPins, hanoiCheckpointCopy } from "@/data/hanoiJourney";
import { usJourneyPins, usCheckpointCopy } from "@/data/usJourney";

const HERO_FADE_COMPLETE_AT = getStageById("hanoi-approach").start;
// Begin Journey's landing target: just inside hanoi-overview (city-wide Hanoi framing, before any
// pin has been visited) — matches scrollToStageStart's own boundary-rounding nudge.
const BEGIN_JOURNEY_TARGET_PROGRESS = getStageById("hanoi-overview").start + 1 / journeyStages.length / 4;
const HANOI_OVERVIEW_STAGE = getStageById("hanoi-overview");
const HANOI_OVERVIEW_EDGE_FADE = 0.02; // matches JourneyHanoiIntroPanel's own EDGE_FADE

// Phase 6 — chapter-complete + interlude stage boundaries, referenced by both applyProgress (to
// track "has the user ever reached this beat" for the explore-again return link) and the
// CTA-triggered scroll targets below.
const HANOI_COMPLETE_STAGE = getStageById("hanoi-complete");
const US_COMPLETE_STAGE = getStageById("us-complete");
/** Cross the Ocean's landing target — just inside hanoi-departure, mirroring
 *  BEGIN_JOURNEY_TARGET_PROGRESS's own boundary-rounding nudge. */
const CROSS_OCEAN_TARGET_PROGRESS = getStageById("hanoi-departure").start + 1 / journeyStages.length / 4;
/** the stage rail and Skip Journey button hide during these — a minimal, full-bleed cinematic beat
 *  with nothing to navigate to or skip past from inside it. */
const INTERLUDE_STAGE_IDS: ReadonlySet<string> = new Set(["hanoi-interlude-not-yet", "hanoi-interlude-now"]);
/** every stage where the compact preview card (top-right, 360px) can be on screen — Skip Journey
 *  needs the stricter "only if clear separation exists" rule here; everywhere else the simpler
 *  "just not modal/interlude/today" rule already covers it. */
const PIN_PREVIEW_STAGE_IDS: ReadonlySet<string> = new Set([
  "hanoi-pin-1",
  "hanoi-pin-2",
  "hanoi-pin-3",
  "hanoi-pin-4",
  "hanoi-pin-5",
  "rivermont-story",
  "gainesville-story",
]);

/** scroll distance dedicated to each stage while the stage is pinned, in viewport-heights */
const STAGE_VH = 90;
const TOTAL_VH = STAGE_VH * journeyStages.length;

export function GeographicJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const todaySectionRef = useRef<HTMLDivElement>(null);
  const mapHandleRef = useRef<JourneyMapHandle | null>(null);
  const storyLayerHandleRef = useRef<JourneyStoryLayerHandle | null>(null);
  const heroHandleRef = useRef<JourneyHeroContentHandle | null>(null);
  const hanoiIntroHandleRef = useRef<JourneyHanoiIntroPanelHandle | null>(null);
  const usIntroHandleRef = useRef<JourneyUsIntroPanelHandle | null>(null);
  const hanoiCompleteHandleRef = useRef<JourneyChapterCompleteHandle | null>(null);
  const usCompleteHandleRef = useRef<JourneyChapterCompleteHandle | null>(null);
  const interludeHandleRef = useRef<JourneyInterludeHandle | null>(null);
  const earthGlowHandleRef = useRef<JourneyEarthGlowHandle | null>(null);
  const edgeFadeHandleRef = useRef<JourneyEdgeFadeHandle | null>(null);
  const isBeginningJourneyRef = useRef(false);
  const isCrossingOceanRef = useRef(false);
  const pulseActiveRef = useRef(false);
  // fast, re-render-free "already flipped" check for applyProgress's own scroll-tick loop — the
  // actual render-affecting value lives in the hasReachedHanoiComplete/hasReachedUsComplete state
  // declared below, set (once) from inside applyProgress by reading these.
  const hasReachedHanoiCompleteRef = useRef(false);
  const hasReachedUsCompleteRef = useRef(false);
  const gsapRef = useRef<{ gsap: typeof import("gsap").gsap; trigger: import("gsap/ScrollTrigger").ScrollTrigger } | null>(
    null
  );
  // last progress applyProgress actually ran with — replayed once the map's handle becomes ready
  // (see handleMapReady) so a page load with zero scroll doesn't leave the very first paint stuck
  // mid-setup, silently no-op'd because the map's dynamic import hadn't resolved yet.
  const lastProgressRef = useRef(0);

  const [activeStageId, setActiveStageId] = useState(journeyStages[0].id);
  const activeStageIdRef = useRef(activeStageId);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  // the full story modal is "highest-priority interface" — hides the rail/Skip Journey while open
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  // mirrors isStoryModalOpen for applyProgress's own scroll-tick loop (a ref so reading it never
  // needs to be in that callback's dependency array, which would otherwise re-register GSAP's
  // ScrollTrigger on every open/close) — see the edge-fade double-darkening fix below.
  const isStoryModalOpenRef = useRef(false);
  useEffect(() => {
    isStoryModalOpenRef.current = isStoryModalOpen;
  }, [isStoryModalOpen]);

  // Dims the site-wide chat bubble while the Today section is in view — "Today should feel calm,"
  // and the bubble's own idle glow otherwise competes with it. Same body-class pattern the story
  // modal already uses to hide the bubble entirely (see JourneyStoryModal.tsx/globals.css); this
  // only ever touches the chat bubble's own visual prominence, never its behavior.
  useEffect(() => {
    const el = todaySectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => document.body.classList.toggle("journey-today-in-view", entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.classList.remove("journey-today-in-view");
    };
  }, []);
  // "has the user ever reached this chapter's completion beat" — flips true once and never back, so
  // JourneyHanoiIntroPanel/JourneyUsIntroPanel can offer a "back to chapter summary" link only once
  // there's actually a summary to return to (a first-time visitor has nothing to go back to yet).
  // Real state (not a ref) since it's read by a conditionally-rendered prop, not an imperative style.
  const [hasReachedHanoiComplete, setHasReachedHanoiComplete] = useState(false);
  const [hasReachedUsComplete, setHasReachedUsComplete] = useState(false);

  const reducedMotion = !!useReducedMotion();
  const { theme } = useTheme();

  const applyProgress = useCallback(
    (progress: number, gsapInstance?: typeof import("gsap").gsap) => {
      void gsapInstance; // no generic per-stage DOM crossfade remains — every stage is now owned by
      // either the persistent map or the story layer, both driven imperatively below
      lastProgressRef.current = progress;
      const current = getStageAtProgress(progress);
      const previousStageId = activeStageIdRef.current;

      // the persistent map's whole camera choreography — one continuous progress→state function
      // spanning Earth → Vietnam → Hanoi → back out → United States → Rivermont → Gainesville.
      mapHandleRef.current?.setCamera(computeJourneyCameraState(progress, reducedMotion), progress);
      mapHandleRef.current?.setEarthRasterCrossfade(computeEarthRasterCrossfade(progress));

      // Hanoi pins/route
      const hanoiCursor = derivePinCursor(progress);
      hanoiJourneyPins.forEach((pin, i) => {
        mapHandleRef.current?.setPinStatus(pin.id, toMapPinStatus(derivePinStatus(i, hanoiCursor)));
      });
      mapHandleRef.current?.setHanoiRouteProgress(deriveRouteProgress(hanoiCursor));

      // U.S. pins/route
      mapHandleRef.current?.setPinStatus(RIVERMONT_PIN_ID, toUsMapPinStatus(deriveRivermontStatus(progress)));
      mapHandleRef.current?.setPinStatus(GAINESVILLE_PIN_ID, toUsMapPinStatus(deriveGainesvilleStatus(progress)));
      mapHandleRef.current?.setDomesticRouteProgress(computeUsRouteProgress(progress));
      // trans-Pacific route: visible only through the same reveal/retreat hump the globe crossing uses
      mapHandleRef.current?.setTranspacificRouteOpacity(computeGlobeArrivalOpacity(progress));

      // story panels — opacity/slide-in for whichever location is currently being read
      storyLayerHandleRef.current?.update(progress);

      // Earth-hero title/CTA block, the map's own "glowing Hanoi" marker, and the decorative space
      // atmosphere all share one fade window (see JourneyHeroContent/JourneyMapCanvas/
      // JourneyEarthGlow) so they resolve together, not independently — "no hard cut" between the
      // Earth and Hanoi visual modes.
      const heroWeight = rampDownTo(progress, HERO_FADE_COMPLETE_AT, HERO_FADE_COMPLETE_AT);
      heroHandleRef.current?.update(progress);
      earthGlowHandleRef.current?.update(progress);
      edgeFadeHandleRef.current?.update(progress, isStoryModalOpenRef.current);
      mapHandleRef.current?.setHanoiAnchorGlowOpacity(heroWeight);
      hanoiIntroHandleRef.current?.update(progress);
      usIntroHandleRef.current?.update(progress);
      hanoiCompleteHandleRef.current?.update(progress);
      usCompleteHandleRef.current?.update(progress);
      interludeHandleRef.current?.update(progress);
      if (progress >= HANOI_COMPLETE_STAGE.start && !hasReachedHanoiCompleteRef.current) {
        hasReachedHanoiCompleteRef.current = true;
        setHasReachedHanoiComplete(true);
      }
      if (progress >= US_COMPLETE_STAGE.start && !hasReachedUsCompleteRef.current) {
        hasReachedUsCompleteRef.current = true;
        setHasReachedUsComplete(true);
      }

      // Hanoi chapter label + Pin-01 overview hint: both tied to the same hanoi-overview window the
      // intro panel itself fades over. The pulse is a standalone time-based loop (see
      // JourneyMapCanvas) — only toggled here on actual enter/exit, never re-triggered every tick.
      const hanoiOverviewWeight = stageWeight(progress, HANOI_OVERVIEW_STAGE.start, HANOI_OVERVIEW_STAGE.end, HANOI_OVERVIEW_EDGE_FADE);
      mapHandleRef.current?.setHanoiChapterLabelOpacity(hanoiOverviewWeight);
      const shouldPulse = hanoiOverviewWeight > 0.5;
      if (shouldPulse !== pulseActiveRef.current) {
        pulseActiveRef.current = shouldPulse;
        mapHandleRef.current?.setHanoiOverviewPulseActive(shouldPulse);
      }

      if (current.id !== previousStageId) {
        activeStageIdRef.current = current.id;
        setActiveStageId(current.id);
      }
    },
    [reducedMotion]
  );

  // The map canvas loads via next/dynamic (code-split, client-only) and can resolve after GSAP's
  // own dynamic import already fired the very first applyProgress call — on a page load with no
  // scroll yet (progress stuck at 0), that first call's setCamera/setPinStatus/etc. would silently
  // no-op against a still-null handle and never get replayed. Re-running once the handle is ready
  // fixes the map's initial paint without touching the scroll-driven update path itself.
  const handleMapReady = useCallback(() => applyProgress(lastProgressRef.current), [applyProgress]);

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

  // shared by every scroll-position computation below (smooth nav, the instant Begin Journey snap)
  // so there's exactly one place that converts a target progress (0–1) into a real scrollY
  const computeScrollYForProgress = useCallback((targetProgress: number) => {
    const root = rootRef.current;
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    const wrapperTop = rect.top + window.scrollY;
    const scrollableRange = root.offsetHeight - window.innerHeight;
    const clamped = Math.min(1, Math.max(0, targetProgress));
    return wrapperTop + Math.max(0, scrollableRange) * clamped;
  }, []);

  // centralized boundary-safe scroll — every programmatic navigation (chapter rail, pin clicks)
  // goes through this one helper instead of each computing its own scrollY math
  const scrollToProgress = useCallback(
    (targetProgress: number) => {
      const targetY = computeScrollYForProgress(targetProgress);
      if (targetY === null) return;
      window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [computeScrollYForProgress, reducedMotion]
  );

  const scrollToStageStart = useCallback(
    (stageId: (typeof journeyStages)[number]["id"]) => {
      const stage = journeyStages.find((s) => s.id === stageId);
      if (!stage) return;
      // nudge a hair past the exact boundary — landing precisely on stage.start can round down a
      // fraction of a pixel short and get classified as the previous (adjacent) stage instead
      scrollToProgress(stage.start + 1 / journeyStages.length / 4);
    },
    [scrollToProgress]
  );

  // Begin Journey's one cinematic, non-scroll-driven camera move — Earth pivots/zooms straight
  // into the Hanoi overview in one eased tween. It still goes through applyProgress (the same
  // single camera controller the scroll path uses) every frame, so nothing about camera/pin/rail
  // state is computed twice: this just drives *how fast progress changes* for ~1.7s, exactly like
  // an unusually fast, precisely-eased scroll. ScrollTrigger is disabled for the duration (not
  // killed) so its own scrub smoothing can't fight these direct calls, then re-enabled after the
  // real scroll position is snapped to match — scrolling forward/back afterward resumes normally,
  // no separate "CTA state" left behind.
  const beginJourneyTransition = useCallback(() => {
    if (isBeginningJourneyRef.current) return;
    isBeginningJourneyRef.current = true;

    const trigger = gsapRef.current?.trigger;
    const gsap = gsapRef.current?.gsap;
    const startProgress = lastProgressRef.current;

    // prevents the "manual interruption" scroll-fighting case: real scroll position can't drift
    // out from under the tween while ScrollTrigger isn't listening for it
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finish = () => {
      const targetY = computeScrollYForProgress(BEGIN_JOURNEY_TARGET_PROGRESS);
      if (targetY !== null) window.scrollTo(0, targetY);
      trigger?.enable(false); // reset:false — pick up progress from the just-snapped scroll position
      document.body.style.overflow = previousOverflow;
      isBeginningJourneyRef.current = false;
    };

    trigger?.disable(false, false); // reset:false keeps current state; allowAnimation:false pauses any in-flight scrub

    const duration = reducedMotion ? 200 : 1700;
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      applyProgress(lerp(startProgress, BEGIN_JOURNEY_TARGET_PROGRESS, easeOutCubic(t)), gsap);
      if (t < 1) requestAnimationFrame(tick);
      else finish();
    };
    requestAnimationFrame(tick);
  }, [applyProgress, computeScrollYForProgress, reducedMotion]);

  // Phase 6 — Hanoi/U.S. chapter-complete + interlude navigation. All of these are scroll requests
  // only, through the same scrollToProgress/scrollToStageStart helpers every other navigation in
  // this page already goes through — never a direct camera/pin-state write.
  const handleContinueFromHanoi = useCallback(() => scrollToStageStart("hanoi-interlude-not-yet"), [scrollToStageStart]);
  const handleExploreHanoiAgain = useCallback(() => scrollToStageStart("hanoi-overview"), [scrollToStageStart]);
  const handleReturnToHanoiSummary = useCallback(() => scrollToStageStart("hanoi-complete"), [scrollToStageStart]);
  const handleContinueFromUs = useCallback(() => scrollToStageStart("today-transition"), [scrollToStageStart]);
  const handleExploreUsAgain = useCallback(() => scrollToStageStart("us-overview"), [scrollToStageStart]);
  const handleReturnToUsSummary = useCallback(() => scrollToStageStart("us-complete"), [scrollToStageStart]);
  const handleExploreUsFreely = useCallback(() => scrollToStageStart("rivermont-approach"), [scrollToStageStart]);

  // "Cross the Ocean" — the interlude's own cinematic, non-scroll-driven camera move (interlude-now
  // -> hanoi-departure's landing point), the same "still goes through applyProgress every frame, so
  // camera/pin/rail state is never computed twice" pattern beginJourneyTransition uses for Earth ->
  // Hanoi — deliberately a separate function (not a refactor of beginJourneyTransition itself) so
  // that already-verified transition is never touched.
  const crossOceanTransition = useCallback(() => {
    if (isCrossingOceanRef.current) return;
    isCrossingOceanRef.current = true;

    const trigger = gsapRef.current?.trigger;
    const gsap = gsapRef.current?.gsap;
    const startProgress = lastProgressRef.current;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finish = () => {
      const targetY = computeScrollYForProgress(CROSS_OCEAN_TARGET_PROGRESS);
      if (targetY !== null) window.scrollTo(0, targetY);
      trigger?.enable(false);
      document.body.style.overflow = previousOverflow;
      isCrossingOceanRef.current = false;
    };

    trigger?.disable(false, false);

    const duration = reducedMotion ? 200 : 1700;
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      applyProgress(lerp(startProgress, CROSS_OCEAN_TARGET_PROGRESS, easeOutCubic(t)), gsap);
      if (t < 1) requestAnimationFrame(tick);
      else finish();
    };
    requestAnimationFrame(tick);
  }, [applyProgress, computeScrollYForProgress, reducedMotion]);

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

  // pin clicks only ever request a scroll — the existing applyProgress engine is what actually
  // recomputes camera, route, pin statuses, and story panel visibility as it animates there. This
  // is the single source of truth the whole journey shares: scroll progress. A click never sets
  // camera or pin state directly, so there's nothing for it to conflict with once the scroll
  // settles — the guided flow just resumes from wherever the click landed.
  const scrollToPin = useCallback(
    (pinId: string) => {
      const index = hanoiJourneyPins.findIndex((p) => p.id === pinId);
      if (index === -1) return;
      scrollToProgress(computePinClickTargetProgress(index));
    },
    [scrollToProgress]
  );

  const scrollToUsPin = useCallback(
    (pinId: string) => {
      if (pinId === RIVERMONT_PIN_ID) scrollToProgress(computeRivermontClickTargetProgress());
      else if (pinId === GAINESVILLE_PIN_ID) scrollToProgress(computeGainesvilleClickTargetProgress());
    },
    [scrollToProgress]
  );

  const handlePinClick = useCallback(
    (pinId: string) => {
      if (pinId === RIVERMONT_PIN_ID || pinId === GAINESVILLE_PIN_ID) scrollToUsPin(pinId);
      else scrollToPin(pinId);
    },
    [scrollToPin, scrollToUsPin]
  );

  // Phase 6 — the U.S. intro panel's primary CTA jumps straight into Rivermont's own settled story
  // window, same shape as JourneyHanoiIntroPanel's onStart (scrollToPin(hanoiJourneyPins[0].id)).
  const handleStartUsChapter = useCallback(() => scrollToUsPin(RIVERMONT_PIN_ID), [scrollToUsPin]);

  // hover is purely a discovery/teaser affordance — it never touches scroll progress, camera, or
  // pin status, so it can never compete with the guided scroll flow (see JourneyPinPreview)
  const hoveredPin =
    hanoiJourneyPins.find((p) => p.id === hoveredPinId) ?? usJourneyPins.find((p) => p.id === hoveredPinId) ?? null;
  const hoverPreview: JourneyPinPreviewData | null = hoveredPin
    ? {
        id: hoveredPin.id,
        number: hoveredPin.number,
        title: hoveredPin.title,
        subtitle: hoveredPin.subtitle,
        description: hoveredPin.preview.description,
      }
    : null;

  return (
    <div className="relative bg-base dark:bg-navy">
      <h1 className="sr-only">My Pham&apos;s journey — from Hanoi, Vietnam to Rivermont and Gainesville, United States</h1>
      <div ref={rootRef} className="relative" style={{ height: `${TOTAL_VH}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <JourneyMapStage
            theme={theme}
            reducedMotion={reducedMotion}
            handleRef={mapHandleRef}
            onPinClick={handlePinClick}
            onPinHover={setHoveredPinId}
            onReady={handleMapReady}
          />
          <JourneyEarthGlow handleRef={earthGlowHandleRef} />
          <JourneyEdgeFade handleRef={edgeFadeHandleRef} />
          <JourneyStoryLayer
            handleRef={storyLayerHandleRef}
            reducedMotion={reducedMotion}
            onNavigatePin={handlePinClick}
            onModalOpenChange={setIsStoryModalOpen}
            onFinishHanoiChapter={handleReturnToHanoiSummary}
            onFinishUsChapter={handleReturnToUsSummary}
          />
          <JourneyHeroContent handleRef={heroHandleRef} reducedMotion={reducedMotion} onBeginJourney={beginJourneyTransition} />
          <JourneyHanoiIntroPanel
            handleRef={hanoiIntroHandleRef}
            reducedMotion={reducedMotion}
            onStart={() => scrollToPin(hanoiJourneyPins[0].id)}
            onSkip={() => navigateToChapter("us")}
            showReturnLink={hasReachedHanoiComplete}
            onReturnToSummary={handleReturnToHanoiSummary}
          />
          <JourneyChapterComplete
            handleRef={hanoiCompleteHandleRef}
            stageId="hanoi-complete"
            reducedMotion={reducedMotion}
            eyebrow="Chapter 01 Complete"
            heading={hanoiCheckpointCopy.heading}
            paragraph={hanoiCheckpointCopy.paragraph}
            primaryLabel={hanoiCheckpointCopy.continueCta}
            onPrimary={handleContinueFromHanoi}
            secondaryLabel={hanoiCheckpointCopy.stayCta}
            onSecondary={handleExploreHanoiAgain}
          />
          <JourneyInterlude handleRef={interludeHandleRef} reducedMotion={reducedMotion} onCrossOcean={crossOceanTransition} />
          <JourneyUsIntroPanel
            handleRef={usIntroHandleRef}
            reducedMotion={reducedMotion}
            onStartChapter={handleStartUsChapter}
            onExploreFreely={handleExploreUsFreely}
            showReturnLink={hasReachedUsComplete}
            onReturnToSummary={handleReturnToUsSummary}
          />
          <JourneyChapterComplete
            handleRef={usCompleteHandleRef}
            stageId="us-complete"
            reducedMotion={reducedMotion}
            eyebrow="Chapter 02 Complete"
            heading={usCheckpointCopy.heading}
            paragraph={usCheckpointCopy.paragraph}
            primaryLabel={usCheckpointCopy.continueCta}
            onPrimary={handleContinueFromUs}
            secondaryLabel={usCheckpointCopy.stayCta}
            onSecondary={handleExploreUsAgain}
          />
        </div>
      </div>

      <JourneyPinPreview pin={hoverPreview} onLearnMore={handlePinClick} />

      {/* Visually-hidden keyboard path to every pin — canvas-rendered map markers can't hold DOM
          focus themselves, so this list is the accessible equivalent of clicking a pin. */}
      <nav aria-label="Jump to a journey location" className="sr-only">
        <ul>
          {hanoiJourneyPins.map((pin) => (
            <li key={pin.id}>
              <button type="button" onClick={() => handlePinClick(pin.id)}>
                {pin.title} — {pin.subtitle}
              </button>
            </li>
          ))}
          {usJourneyPins.map((pin) => (
            <li key={pin.id}>
              <button type="button" onClick={() => handlePinClick(pin.id)}>
                {pin.title} — {pin.subtitle}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hides once the journey resolves into "Today & Ahead" — past that point there's no more
          chapter to navigate to, and leaving it up would float the rail over the site's own
          footer for the rest of the page. Also hides while the full story modal is open — the
          modal is the highest-priority interface at that point; the compact preview card (360px)
          no longer collides with the rail (right-30px), so the rail stays visible during plain
          preview-card display. Also hides during the between-chapters interlude — a minimal,
          full-bleed cinematic beat with no chapter left to navigate to from there anyway (per
          Phase 6: "hide during interlude if it conflicts"). Chapter-complete states stay visible —
          only the interlude itself is hidden. */}
      {activeStage.id !== "today-ahead" && !isStoryModalOpen && !INTERLUDE_STAGE_IDS.has(activeStage.id) && (
        <JourneyProgressRail
          chapters={journeyChapters}
          activeChapterId={activeStage.chapter}
          activeChapterIndex={activeChapterIndex}
          onNavigate={navigateToChapter}
        />
      )}

      {activeStage.id !== "today-ahead" && !isStoryModalOpen && !INTERLUDE_STAGE_IDS.has(activeStage.id) && (
        <button
          type="button"
          onClick={scrollToTodaySection}
          className={`fixed right-4 top-[76px] z-40 flex h-10 items-center rounded-full border border-[rgba(255,255,255,0.14)] bg-transparent px-[18px] font-mono text-[11px] uppercase tracking-[0.14em] text-[rgba(205,200,225,0.46)] transition-colors hover:text-[rgba(238,236,246,0.8)] md:right-8 ${
            // the preview card starts at md:pt-[14vh] — below roughly 720px tall, this button's own
            // ~116px bottom edge would land inside (or past) that 24px clearance, so it hides rather
            // than ever risk overlapping the card. Every other visible stage (overview, chapter-
            // complete, etc.) has no card to collide with, so it keeps the simple rule above.
            PIN_PREVIEW_STAGE_IDS.has(activeStage.id) ? "[@media(max-height:720px)]:hidden" : ""
          }`}
        >
          Skip Journey →
        </button>
      )}

      <section
        ref={todaySectionRef}
        aria-label="Today & Ahead"
        className="relative z-10 flex min-h-screen flex-col items-center overflow-hidden bg-base px-6 dark:bg-navy"
      >
        {/* ONE soft violet haze — the section's only atmosphere, no stars/circles/panels. Sits
            behind the heading + route ghost, nudged toward the composition's own off-center focus. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 55% 45% at 50% 42%, rgba(155,139,181,0.14), transparent 70%)",
          }}
        />
        {/* Faint abstracted map texture — a few graticule-like arcs suggesting geography, never a
            readable active map (opacity capped well below anything else on this page). */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-accent dark:text-accent-lavender"
          style={{ opacity: 0.09 }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1000 600"
        >
          <path d="M -50 120 Q 500 20 1050 120" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M -50 300 Q 500 260 1050 300" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M -50 480 Q 500 540 1050 480" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 220 -40 Q 260 300 220 640" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 780 -40 Q 740 300 780 640" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        {/* The completed Hanoi -> U.S. route, ghosted — a visual echo, not navigation: no pins, no
            glowing markers, just the shape of where the journey went. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-accent-lavender"
          style={{ opacity: 0.11 }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1000 600"
        >
          <path
            d="M 150 460 Q 420 120 620 300 Q 760 420 880 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
        </svg>

        {/* Nudged up from dead-center (50vh) toward ~45vh — a slightly more editorial composition
            than a plain centered CTA block. */}
        <div className="relative flex w-full max-w-[760px] -translate-y-[5vh] flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent dark:text-accent-lavender">Today &amp; Ahead</p>
          <h2 className="max-w-2xl font-display text-[42px] leading-[1.02] text-surface dark:text-white md:text-[60px]">
            This is where the story
            <br />
            catches up to today.
          </h2>
          <p className="max-w-[600px] font-body text-base leading-relaxed text-muted dark:text-white/[0.72]">
            Hanoi, Rivermont, Gainesville — that&apos;s the journey so far. I&apos;d love to hear where our paths cross next.
          </p>
          <Link
            href="/connect"
            className="flex h-[49px] items-center rounded-[24px] bg-accent px-[28px] font-mono text-xs tracking-wider text-white transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(142,107,255,0.35)]"
          >
            Let&apos;s Connect →
          </Link>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {["More Places", "More People", "More Possibilities"].map((label) => (
              <span key={label} className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/40 dark:text-white/[0.32]">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
