import { Vector3, Quaternion, Matrix4 } from "three";

/**
 * Standard equirectangular lat/lon → sphere position convention (matches the UV layout of the
 * bundled NASA-derived Earth textures: image left edge = -180° lon, top edge = north pole).
 */
export function latLonToVector3(lat: number, lon: number, radius = 1): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const WORLD_UP = new Vector3(0, 1, 0);
const NORTH_POLE_FALLBACK_EAST = new Vector3(1, 0, 0);

/**
 * Quaternion that rotates a group so the given lat/lon point faces the camera (+Z) with local
 * north kept pointing to screen-up (+Y). `setFromUnitVectors` alone (shortest arc to +Z) leaves
 * an unconstrained twist around the view axis, which rolls the map at an arbitrary, disorienting
 * angle — recognizable coastlines end up sideways even though the lat/lon math is correct. This
 * builds a proper look-at basis (east/north/target) instead, so the globe always reads north-up.
 */
export function quaternionFacingCamera(lat: number, lon: number): Quaternion {
  const target = latLonToVector3(lat, lon, 1).normalize();
  const east = new Vector3().crossVectors(WORLD_UP, target);
  if (east.lengthSq() < 1e-6) east.copy(NORTH_POLE_FALLBACK_EAST);
  east.normalize();
  const north = new Vector3().crossVectors(target, east).normalize();
  const basis = new Matrix4().makeBasis(east, north, target);
  return new Quaternion().setFromRotationMatrix(basis).invert();
}
