"use client";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { useReducedMotion } from "framer-motion";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeoPoint } from "@/data/biography";

function rotationFor(target: GeoPoint): [number, number, number] {
  return [-target.lon, -target.lat, 0];
}

export function GlobeHero({
  countries,
  highlightCountryIds = [],
  initialTarget,
  interactive = true,
  ambient = true,
  size = 560,
  className = "",
  ariaLabel = "Interactive globe",
}: {
  countries: FeatureCollection<Geometry> | null;
  highlightCountryIds?: string[];
  initialTarget?: GeoPoint;
  interactive?: boolean;
  ambient?: boolean;
  size?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const [rotation, setRotation] = useState<[number, number, number]>(
    initialTarget ? rotationFor(initialTarget) : [-105, -15, 0]
  );
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = useReducedMotion();
  const dragStart = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!ambient || reducedMotion || dragging || !interactive) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // low-priority: a purely decorative animation must never starve real interactions
      // (e.g. nav-link transitions) competing for React's scheduler
      startTransition(() => {
        setRotation((r) => [r[0] - dt * 0.006, r[1], r[2]]);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ambient, reducedMotion, dragging, interactive]);

  const baseScale = size / 2.6;
  const projection = useMemo(() => {
    return geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(baseScale * scale)
      .rotate(rotation)
      .clipAngle(90);
  }, [size, baseScale, scale, rotation]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, rotation };
    setDragging(true);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const [y0, p0, r0] = dragStart.current.rotation;
    const nextPitch = Math.max(-80, Math.min(80, p0 - dy * 0.3));
    setRotation([y0 + dx * 0.3, nextPitch, r0]);
  };
  const endDrag = () => {
    dragStart.current = null;
    setDragging(false);
  };

  const highlightSet = useMemo(() => new Set(highlightCountryIds), [highlightCountryIds]);

  return (
    <div className={`relative select-none ${className}`} style={{ width: size, height: size }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 blur-3xl dark:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(91, 58, 142,0.28), transparent 65%)" }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel}
        className={interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <circle cx={size / 2} cy={size / 2} r={(baseScale * scale)} className="fill-[#F1EAF7] dark:fill-[#18233F]" />
        {countries?.features.map((f, i) => {
          const id = String((f as { id?: string | number }).id ?? "");
          const isHighlighted = highlightSet.has(id);
          const d = pathGen(f) ?? undefined;
          return (
            <path
              key={`${id}-${i}`}
              d={d}
              strokeWidth={isHighlighted ? 1.2 : 0.6}
              className={
                isHighlighted
                  ? "fill-accent stroke-[#4A2F74] dark:fill-accent dark:stroke-[#9B8BB5] dark:[filter:drop-shadow(0_0_6px_rgba(91, 58, 142,0.65))]"
                  : "fill-[#E4DDED] stroke-[#C9BAD9] dark:fill-[#2B2347] dark:stroke-[#3D3560]"
              }
            />
          );
        })}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={baseScale * scale}
          fill="none"
          strokeWidth={1}
          opacity={0.5}
          className="stroke-[#C9BAD9] dark:stroke-white/10"
        />
      </svg>

      {interactive && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-full border border-accent/25 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#22264B]/90">
          <button
            aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(2, s + 0.15))}
            className="flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            +
          </button>
          <div className="h-px bg-border dark:bg-white/10" />
          <button
            aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
            className="flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            −
          </button>
          <div className="h-px bg-border dark:bg-white/10" />
          <button
            aria-label="Reset view"
            onClick={() => {
              setScale(1);
              setRotation(initialTarget ? rotationFor(initialTarget) : [-105, -15, 0]);
            }}
            className="flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
