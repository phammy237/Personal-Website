import { Vector3, Quaternion } from "three";

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

/** Quaternion that rotates a group so the given lat/lon point faces the camera (+Z). */
export function quaternionFacingCamera(lat: number, lon: number): Quaternion {
  const local = latLonToVector3(lat, lon, 1).normalize();
  return new Quaternion().setFromUnitVectors(local, new Vector3(0, 0, 1));
}
