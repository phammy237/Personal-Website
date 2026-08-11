"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import type { FeatureCollection, Geometry } from "geojson";
import "@/components/biography/earth/earthMaterial";
import { useEarthTextures } from "@/components/biography/earth/textures";
import { latLonToVector3, quaternionFacingCamera } from "@/lib/three/latLon";
import { findCountry } from "@/lib/hooks/useWorldTopology";
import type { GeoPoint } from "@/data/biography";

const RADIUS = 1;
// fov=42° => half-fov≈21° => tan(21°)≈0.384; distance so the sphere fills ~78% of the frame height
const MIN_DIST = 2.1;
const MAX_DIST = 4.6;
const DEFAULT_DIST = 2.95;
const ZOOMED_DIST = 2.2;

export type GlobeMarker = { id: string; position: GeoPoint; label: string };

export type SatelliteGlobeProps = {
  countries: FeatureCollection<Geometry> | null;
  highlightCountryIds?: string[];
  initialTarget?: GeoPoint;
  interactive?: boolean;
  ambient?: boolean;
  size?: number;
  ariaLabel?: string;
  markers?: GlobeMarker[];
  arc?: { from: GeoPoint; to: GeoPoint } | null;
  /** changing this (by identity/value) smoothly rotates the globe to face the new point */
  focusTarget?: GeoPoint | null;
  /** dolly the camera in for a "zooming into the destination" beat */
  zoomedIn?: boolean;
  reducedMotion?: boolean;
  lowPower?: boolean;
  onFocusComplete?: () => void;
  onReady?: () => void;
};

function extractRings(geometry: Geometry): [number, number][][] {
  if (geometry.type === "Polygon") return geometry.coordinates as [number, number][][];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates as [number, number][][][]).flat();
  return [];
}

function arcPoints(from: GeoPoint, to: GeoPoint, segments = 72, lift = 0.32) {
  const a = latLonToVector3(from.lat, from.lon, 1).normalize();
  const b = latLonToVector3(to.lat, to.lon, 1).normalize();
  const angle = a.angleTo(b);
  const sinTotal = Math.sin(angle) || 1e-6;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const w1 = Math.sin((1 - t) * angle) / sinTotal;
    const w2 = Math.sin(t * angle) / sinTotal;
    const dir = new THREE.Vector3().addScaledVector(a, w1).addScaledVector(b, w2).normalize();
    const altitude = RADIUS * (1 + Math.sin(t * Math.PI) * lift);
    points.push(dir.multiplyScalar(altitude));
  }
  return points;
}

/** Earth sphere + night lights + specular oceans + restrained relief, via a custom day/night shader. */
function EarthSurface({
  lowPower,
  onReady,
  meshRef,
  focusPoint,
  focusGlow,
}: {
  lowPower: boolean;
  onReady?: () => void;
  meshRef: React.RefObject<THREE.Mesh>;
  focusPoint?: THREE.Vector3;
  focusGlow?: number;
}) {
  const textures = useEarthTextures(!lowPower);
  useEffect(() => {
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[RADIUS, 96, 96]} />
      <earthMaterial
        dayMap={textures.day}
        nightMap={textures.night}
        specularMap={textures.specular}
        normalMap={textures.normal}
        focusPoint={focusPoint}
        focusGlow={focusGlow ?? 0}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Static wisp layer — no independent spin, so it never reads as the globe "auto-rotating". */
function CloudLayer({ opacity }: { opacity: number }) {
  const textures = useEarthTextures(true);
  if (!textures.clouds) return null;
  return (
    <mesh>
      <sphereGeometry args={[RADIUS * 1.008, 64, 64]} />
      <meshBasicMaterial map={textures.clouds} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.035}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <atmosphereMaterial
        glowColor={new THREE.Color("#7C8CE0")}
        intensity={1.1}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function CountryBoundary({ countries, countryId }: { countries: FeatureCollection<Geometry> | null; countryId: string }) {
  const rings = useMemo(() => {
    const feature = findCountry(countries, countryId);
    if (!feature) return [];
    return extractRings(feature.geometry).map((ring) =>
      ring.map(([lon, lat]) => latLonToVector3(lat, lon, RADIUS * 1.004))
    );
  }, [countries, countryId]);

  return (
    <>
      {rings.map((ring, i) => (
        <Line key={i} points={ring} color="#E4DDF7" lineWidth={2.25} transparent opacity={0.95} />
      ))}
    </>
  );
}

function Marker({ marker, occludeBy }: { marker: GlobeMarker; occludeBy: React.RefObject<THREE.Object3D> }) {
  const position = useMemo(
    () => latLonToVector3(marker.position.lat, marker.position.lon, RADIUS * 1.006),
    [marker.position.lat, marker.position.lon]
  );
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = (clock.getElapsedTime() % 2.2) / 2.2;
    ringRef.current.scale.setScalar(1 + t * 1.8);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - t);
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.014, 16, 16]} />
        <meshBasicMaterial color="#C5A46D" />
      </mesh>
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.016, 0.02, 24]} />
        <meshBasicMaterial color="#C5A46D" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <Html occlude={[occludeBy]} distanceFactor={2.2} style={{ pointerEvents: "none" }}>
        <div className="-translate-y-6 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {marker.label}
        </div>
      </Html>
    </group>
  );
}

/**
 * Single source of truth for globe orientation + camera distance. Exactly one of three modes
 * drives rotation at a time — ambient auto-rotate, live user drag, or a programmatic
 * rotate-to-target transition — so they never fight over the same state.
 */
function useGlobeController({
  groupRef,
  initialTarget,
  focusTarget,
  ambient,
  interactive,
  reducedMotion,
  zoomedIn,
  onFocusComplete,
}: {
  groupRef: React.RefObject<THREE.Group>;
  initialTarget?: GeoPoint;
  focusTarget?: GeoPoint | null;
  ambient: boolean;
  interactive: boolean;
  reducedMotion: boolean;
  zoomedIn: boolean;
  onFocusComplete?: () => void;
}) {
  const { camera } = useThree();
  const modeRef = useRef<"idle" | "dragging" | "transition">("idle");
  const transitionRef = useRef<{ from: THREE.Quaternion; to: THREE.Quaternion; start: number; duration: number } | null>(null);
  const distRef = useRef(DEFAULT_DIST);
  const targetDistRef = useRef(DEFAULT_DIST);
  const dragState = useRef<{ x: number; y: number } | null>(null);
  /** active pointers by id, for single-finger drag vs. two-finger pinch disambiguation */
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDist = useRef<number | null>(null);

  // initial orientation, set once
  useEffect(() => {
    if (!groupRef.current) return;
    const target = initialTarget;
    if (target) groupRef.current.quaternion.copy(quaternionFacingCamera(target.lat, target.lon));
    camera.position.set(0, 0, DEFAULT_DIST);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    targetDistRef.current = zoomedIn ? ZOOMED_DIST : DEFAULT_DIST;
  }, [zoomedIn]);

  const lastFocusKey = useRef<string | null>(null);
  useEffect(() => {
    if (!focusTarget || !groupRef.current) return;
    const key = `${focusTarget.lat},${focusTarget.lon}`;
    if (key === lastFocusKey.current) return;
    lastFocusKey.current = key;
    const to = quaternionFacingCamera(focusTarget.lat, focusTarget.lon);
    if (reducedMotion) {
      groupRef.current.quaternion.copy(to);
      modeRef.current = "idle";
      onFocusComplete?.();
      return;
    }
    transitionRef.current = {
      from: groupRef.current.quaternion.clone(),
      to,
      start: performance.now(),
      duration: 1500,
    };
    modeRef.current = "transition";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTarget?.lat, focusTarget?.lon, reducedMotion]);

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!interactive) return;
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.current.size === 2) {
        const [p1, p2] = Array.from(activePointers.current.values());
        pinchStartDist.current = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        dragState.current = null;
        modeRef.current = "idle";
      } else {
        dragState.current = { x: e.clientX, y: e.clientY };
        modeRef.current = "dragging";
      }
    },
    [interactive]
  );
  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!activePointers.current.has(e.pointerId)) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 2 && pinchStartDist.current != null) {
      const [p1, p2] = Array.from(activePointers.current.values());
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const delta = pinchStartDist.current - dist;
      pinchStartDist.current = dist;
      targetDistRef.current = Math.max(MIN_DIST, Math.min(MAX_DIST, targetDistRef.current + delta * 0.01));
      return;
    }

    if (!dragState.current || !groupRef.current) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    dragState.current = { x: e.clientX, y: e.clientY };
    const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.006);
    const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * 0.006);
    groupRef.current.quaternion.premultiply(rotY).premultiply(rotX);
  }, []);
  const endDrag = useCallback((e: ThreeEvent<PointerEvent>) => {
    activePointers.current.delete(e.pointerId);
    pinchStartDist.current = null;
    if (activePointers.current.size === 0) {
      dragState.current = null;
      if (modeRef.current === "dragging") modeRef.current = "idle";
    }
  }, []);

  const onWheel = useCallback(
    (e: ThreeEvent<WheelEvent>) => {
      if (!interactive) return;
      targetDistRef.current = Math.max(MIN_DIST, Math.min(MAX_DIST, targetDistRef.current + e.deltaY * 0.0022));
    },
    [interactive]
  );

  const zoomBy = useCallback((delta: number) => {
    targetDistRef.current = Math.max(MIN_DIST, Math.min(MAX_DIST, targetDistRef.current + delta));
  }, []);
  const resetView = useCallback(() => {
    if (!groupRef.current || !initialTarget) return;
    groupRef.current.quaternion.copy(quaternionFacingCamera(initialTarget.lat, initialTarget.lon));
    targetDistRef.current = DEFAULT_DIST;
  }, [initialTarget]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (modeRef.current === "transition" && transitionRef.current) {
      const { from, to, start, duration } = transitionRef.current;
      const t = Math.min(1, (performance.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      groupRef.current.quaternion.copy(from).slerp(to, eased);
      if (t >= 1) {
        transitionRef.current = null;
        modeRef.current = "idle";
        onFocusComplete?.();
      }
    } else if (modeRef.current === "idle" && ambient && !reducedMotion) {
      groupRef.current.rotateY(delta * 0.028);
    }

    distRef.current += (targetDistRef.current - distRef.current) * Math.min(1, delta * 4);
    camera.position.z = distRef.current;
  });

  return { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerLeave: endDrag, onWheel, zoomBy, resetView };
}

function GlobeScene({
  countries,
  highlightCountryIds = [],
  initialTarget,
  interactive = true,
  ambient = true,
  markers = [],
  arc,
  focusTarget,
  zoomedIn = false,
  reducedMotion = false,
  lowPower = false,
  onFocusComplete,
  onReady,
  controllerRef,
}: SatelliteGlobeProps & { controllerRef: React.MutableRefObject<{ zoomBy: (d: number) => void; resetView: () => void } | null> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const earthMeshRef = useRef<THREE.Mesh>(null!);
  const [earthReady, setEarthReady] = useState(false);
  const handleEarthReady = useCallback(() => {
    setEarthReady(true);
    onReady?.();
  }, [onReady]);
  const controller = useGlobeController({
    groupRef,
    initialTarget,
    focusTarget,
    ambient,
    interactive,
    reducedMotion,
    zoomedIn,
    onFocusComplete,
  });

  useEffect(() => {
    controllerRef.current = { zoomBy: controller.zoomBy, resetView: controller.resetView };
  }, [controller.zoomBy, controller.resetView, controllerRef]);

  const arcSegments = useMemo(() => (arc ? arcPoints(arc.from, arc.to) : null), [arc]);
  const focusMarker = markers[0];
  const focusPoint = useMemo(
    () => (focusMarker ? latLonToVector3(focusMarker.position.lat, focusMarker.position.lon, 1) : undefined),
    [focusMarker]
  );

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 1, 2]} intensity={1.4} />
      {/* transparent (not `visible=false`) so it still receives raycasts — this is the drag/wheel/pinch hit target */}
      <mesh
        onPointerDown={controller.onPointerDown}
        onPointerMove={controller.onPointerMove}
        onPointerUp={controller.onPointerUp}
        onPointerLeave={controller.onPointerLeave}
        onWheel={controller.onWheel}
      >
        <sphereGeometry args={[RADIUS * 1.3, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={groupRef}>
        <Suspense fallback={null}>
          <EarthSurface
            lowPower={lowPower}
            onReady={handleEarthReady}
            meshRef={earthMeshRef}
            focusPoint={focusPoint}
            focusGlow={focusPoint ? 1 : 0}
          />
          {!lowPower && <CloudLayer opacity={0.35} />}
        </Suspense>
        {highlightCountryIds.map((id) => (
          <CountryBoundary key={id} countries={countries} countryId={id} />
        ))}
        {/* wait for the Earth mesh to actually mount (past Suspense) before rendering Html-occluded
            markers — drei's occlude raycast throws if the target ref is still null */}
        {earthReady && markers.map((m) => (
          <Marker key={m.id} marker={m} occludeBy={earthMeshRef} />
        ))}
        {arcSegments && <Line points={arcSegments} color="#C9BAD9" dashed dashSize={0.022} gapSize={0.016} transparent opacity={0.75} />}
      </group>
      <Atmosphere />
    </>
  );
}

export function SatelliteGlobeCanvas({
  size = 520,
  ariaLabel = "Interactive photorealistic globe",
  interactive = true,
  lowPower,
  onReady,
  ...props
}: SatelliteGlobeProps) {
  const [ready, setReady] = useState(false);
  const controllerRef = useRef<{ zoomBy: (d: number) => void; resetView: () => void } | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const effectiveLowPower = lowPower ?? isMobile;

  const handleReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  return (
    <div
      className="relative select-none"
      style={{ width: size, height: size, touchAction: interactive ? "none" : undefined }}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-[#0B1024] transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-accent-lavender" />
      </div>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 42, near: 0.1, far: 10, position: [0, 0, DEFAULT_DIST] }}
        style={{ width: size, height: size, cursor: interactive ? "grab" : "default", touchAction: "none" }}
      >
        <GlobeScene
          {...props}
          interactive={interactive}
          lowPower={effectiveLowPower}
          onReady={handleReady}
          controllerRef={controllerRef}
        />
      </Canvas>

      {interactive && (
        <div className="pointer-events-none absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-full border border-accent/25 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-navy-mid/90">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => controllerRef.current?.zoomBy(-0.3)}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            +
          </button>
          <div className="h-px bg-border dark:bg-white/10" />
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => controllerRef.current?.zoomBy(0.3)}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            −
          </button>
          <div className="h-px bg-border dark:bg-white/10" />
          <button
            type="button"
            aria-label="Reset view"
            onClick={() => controllerRef.current?.resetView()}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
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
