export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Checks if a given GPS coordinate is inside a polygon using the ray-casting algorithm.
 * Coordinates in GeoJSON are [longitude, latitude].
 */
export function isPointInPolygon(point: Coordinate, polygonCoords: [number, number][]): boolean {
  if (!polygonCoords || polygonCoords.length < 3) {
    return false;
  }

  const { latitude: lat, longitude: lng } = point;
  let inside = false;

  for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
    const xi = polygonCoords[i][0]; // lng
    const yi = polygonCoords[i][1]; // lat
    const xj = polygonCoords[j][0]; // lng
    const yj = polygonCoords[j][1]; // lat

    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
