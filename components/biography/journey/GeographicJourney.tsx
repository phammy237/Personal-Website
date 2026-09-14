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
import type { JourneyChapterId } from "@/lib/biography/journeyTypes";
import { useTheme } from "@/components/layout/ThemeProvider";
import { JourneyMapStage } from "@/components/biography/journey/JourneyMapStage";
import type { JourneyMapHandle } from "@/components/biography/journey/JourneyMapCanvas";
import { JourneyStoryLayer, type JourneyStoryLayerHandle } from "@/components/biography/journey/JourneyStoryLayer";
import { JourneyProgressRail } from "@/components/biography/journey/JourneyProgressRail";
import { JourneyPinPreview, type JourneyPinPreviewData } from "@/components/biography/journey/JourneyPinPreview";
import { JourneyHeroContent, type JourneyHeroContentHandle } from "@/components/biography/journey/JourneyHeroContent";
import { JourneyHanoiIntroPanel, type JourneyHanoiIntroPanelHandle } from "@/components/biography/journey/JourneyHanoiIntroPanel";
import { JourneyEarthGlow, type JourneyEarthGlowHandle } from "@/components/biography/journey/JourneyEarthGlow";
import { rampDownTo, easeOutCubic, lerp, stageWeight } from "@/lib/biography/journeyMotion";
import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { usJourneyPins } from "@/data/usJourney";

const HERO_FADE_COMPLETE_AT = getStageById("hanoi-approach").start;
// Begin Journey's landing target: just inside hanoi-overview (city-wide Hanoi framing, before any
// pin has been visited) — matches scrollToStageStart's own boundary-rounding nudge.
const BEGIN_JOURNEY_TARGET_PROGRESS = getStageById("hanoi-overview").start + 1 / journeyStages.length / 4;
const HANOI_OVERVIEW_STAGE = getStageById("hanoi-overview");
const HANOI_OVERVIEW_EDGE_FADE = 0.02; // matches JourneyHanoiIntroPanel's own EDGE_FADE

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
  const earthGlowHandleRef = useRef<JourneyEarthGlowHandle | null>(null);
  const isBeginningJourneyRef = useRef(false);
  const pulseActiveRef = useRef(false);
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
      mapHandleRef.current?.setHanoiAnchorGlowOpacity(heroWeight);
      hanoiIntroHandleRef.current?.update(progress);

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
          <JourneyStoryLayer handleRef={storyLayerHandleRef} reducedMotion={reducedMotion} />
          <JourneyHeroContent handleRef={heroHandleRef} reducedMotion={reducedMotion} onBeginJourney={beginJourneyTransition} />
          <JourneyHanoiIntroPanel
            handleRef={hanoiIntroHandleRef}
            reducedMotion={reducedMotion}
            onStart={() => scrollToPin(hanoiJourneyPins[0].id)}
            onSkip={() => navigateToChapter("us")}
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
          footer for the rest of the page. */}
      {activeStage.id !== "today-ahead" && (
        <JourneyProgressRail
          chapters={journeyChapters}
          activeChapterId={activeStage.chapter}
          activeChapterIndex={activeChapterIndex}
          onNavigate={navigateToChapter}
        />
      )}

      {activeStage.id !== "today-ahead" && (
        <button
          type="button"
          onClick={scrollToTodaySection}
          className="fixed right-4 top-[76px] z-40 flex h-10 items-center rounded-full border border-[rgba(255,255,255,0.14)] bg-transparent px-[18px] font-mono text-[11px] uppercase tracking-[0.14em] text-[rgba(205,200,225,0.46)] transition-colors hover:text-[rgba(238,236,246,0.8)] md:right-8"
        >
          Skip Journey →
        </button>
      )}

      <section
        ref={todaySectionRef}
        aria-label="Today & Ahead"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 bg-base px-6 py-24 text-center dark:bg-navy"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent dark:text-accent-lavender">Today &amp; Ahead</p>
        <h2 className="max-w-2xl font-display text-4xl text-surface dark:text-white md:text-5xl">
          This is where the story catches up to today.
        </h2>
        <p className="max-w-xl font-body text-base leading-relaxed text-muted dark:text-white/60">
          Hanoi, Rivermont, Gainesville — that&apos;s the journey so far. If any of it resonated, I&apos;d love to hear from
          you and see where our paths cross next.
        </p>
        <Link
          href="/connect"
          className="font-mono text-xs px-6 py-3 bg-accent text-white hover:bg-accent/85 transition-colors duration-200 rounded-full tracking-wider"
        >
          Let&apos;s Connect →
        </Link>
      </section>
    </div>
  );
}
