import type { GeoCoordinates } from '../types/weather.types.js';

// Earth radius in kilometres (WGS-84 mean)
const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculate the great-circle distance between two WGS-84 coordinate pairs
 * using the Haversine formula.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate the forward bearing (in degrees, 0-360) from the first point
 * to the second point along a great-circle path.
 */
export function bearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const fromRad = (rad: number) => (rad * 180) / Math.PI;
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(rLat2);
  const x =
    Math.cos(rLat1) * Math.sin(rLat2) -
    Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);
  return normalizeAngle(fromRad(Math.atan2(y, x)));
}

/**
 * Compute the destination coordinates given a starting point, bearing (degrees),
 * and distance (km).
 */
export function destinationPoint(
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceKm: number,
): GeoCoordinates {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const fromRad = (rad: number) => (rad * 180) / Math.PI;
  const d = distanceKm / EARTH_RADIUS_KM; // angular distance
  const brng = toRad(bearingDeg);
  const latR = toRad(lat);
  const lonR = toRad(lon);
  const lat2 = Math.asin(
    Math.sin(latR) * Math.cos(d) +
      Math.cos(latR) * Math.sin(d) * Math.cos(brng),
  );
  const lon2 =
    lonR +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(latR),
      Math.cos(d) - Math.sin(latR) * Math.sin(lat2),
    );
  return {
    latitude: fromRad(lat2),
    longitude: fromRad(lon2),
  };
}

/**
 * Point-in-polygon test (ray-casting algorithm).
 * `point` is `[lat, lon]`, and `polygon` is an array of `[lat, lon]` vertices.
 */
export function pointInPolygon(
  point: [number, number],
  polygon: Array<[number, number]>,
): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Normalise any angle in degrees to the range [0, 360).
 */
export function normalizeAngle(angle: number): number {
  const mod = 360;
  let result = ((angle % mod) + mod) % mod;
  if (result === 0) return 0;
  return result;
}

/**
 * Clamp a numeric value to the range [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
