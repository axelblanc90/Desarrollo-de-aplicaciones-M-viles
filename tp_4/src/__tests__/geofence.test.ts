import { Coordinate, isPointInPolygon } from '../lib/geofence';

describe('Geofencing & Ray-Casting Algorithm (RF-06 & OA-2)', () => {
  // Costa 1 polygon coordinates from seed.sql: [[lng, lat], ...]
  const costa1Polygon: [number, number][] = [
    [-58.0250, -31.3920],
    [-58.0200, -31.3920],
    [-58.0200, -31.3960],
    [-58.0250, -31.3960],
    [-58.0250, -31.3920],
  ];

  test('Correctly detects when a device GPS coordinate is inside Costa 1', () => {
    // Center of Costa 1
    const insidePoint: Coordinate = {
      latitude: -31.3940,
      longitude: -58.0225,
    };

    expect(isPointInPolygon(insidePoint, costa1Polygon)).toBe(true);
  });

  test('Correctly detects when a GPS coordinate is outside Costa 1', () => {
    // Point in Costa 2
    const costa2Point: Coordinate = {
      latitude: -31.3940,
      longitude: -58.0165,
    };
    expect(isPointInPolygon(costa2Point, costa1Polygon)).toBe(false);

    // Completely outside point (e.g. Buenos Aires)
    const outsideCity: Coordinate = {
      latitude: -34.6037,
      longitude: -58.3816,
    };
    expect(isPointInPolygon(outsideCity, costa1Polygon)).toBe(false);
  });

  test('Handles edge cases and degenerated polygons gracefully without crashing', () => {
    const point: Coordinate = { latitude: -31.3940, longitude: -58.0225 };
    expect(isPointInPolygon(point, [])).toBe(false);
    expect(isPointInPolygon(point, [[-58.0, -31.0]])).toBe(false);
  });
});
