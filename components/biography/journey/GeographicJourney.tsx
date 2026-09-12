"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { journeyChapters, journeyStages, getChapterIndex, getStageAtProgress } from "@/lib/biography/journeyStages";
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
import { hanoiJourneyPins } from "@/data/hanoiJourney";
import { usJourneyPins } from "@/data/usJourney";

/** scroll distance dedicated to each stage while the stage is pinned, in viewport-heights */
const STAGE_VH = 90;
const TOTAL_VH = STAGE_VH * journeyStages.length;

export function GeographicJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const todaySectionRef = useRef<HTMLDivElement>(null);
  const mapHandleRef = useRef<JourneyMapHandle | null>(null);
  const storyLayerHandleRef = useRef<JourneyStoryLayerHandle | null>(null);
  const gsapRef = useRef<{ gsap: typeof import("gsap").gsap; trigger: import("gsap/ScrollTrigger").ScrollTrigger } | null>(
    null
  );

  const [activeStageId, setActiveStageId] = useState(journeyStages[0].id);
  const activeStageIdRef = useRef(activeStageId);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  const reducedMotion = !!useReducedMotion();
  const { theme } = useTheme();

  const applyProgress = useCallback(
    (progress: number, gsapInstance?: typeof import("gsap").gsap) => {
      void gsapInstance; // no generic per-stage DOM crossfade remains — every stage is now owned by
      // either the persistent map or the story layer, both driven imperatively below
      const current = getStageAtProgress(progress);
      const previousStageId = activeStageIdRef.current;

      // the persistent map's whole camera choreography — one continuous progress→state function
      // spanning Earth → Vietnam → Hanoi → back out → United States → Rivermont → Gainesville.
      mapHandleRef.current?.setCamera(computeJourneyCameraState(progress, reducedMotion));

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

      if (current.id !== previousStageId) {
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

  // centralized boundary-safe scroll: converts a target progress (0–1) into a scrollY and scrolls
  // there — every programmatic navigation (chapter rail, pin clicks) goes through this one helper
  // instead of each computing its own scrollY math
  const scrollToProgress = useCallback(
    (targetProgress: number) => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const wrapperTop = rect.top + window.scrollY;
      const scrollableRange = root.offsetHeight - window.innerHeight;
      const clamped = Math.min(1, Math.max(0, targetProgress));
      const targetY = wrapperTop + Math.max(0, scrollableRange) * clamped;
      window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion]
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
          />
          <JourneyStoryLayer handleRef={storyLayerHandleRef} reducedMotion={reducedMotion} />
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
          className="fixed right-4 top-20 z-40 rounded-full border border-border bg-white/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-surface dark:border-white/20 dark:bg-navy-deep/80 dark:text-white/70 dark:hover:border-accent-lavender/60 dark:hover:text-white md:right-8"
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
