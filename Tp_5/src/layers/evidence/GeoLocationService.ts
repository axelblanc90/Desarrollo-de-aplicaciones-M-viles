import { GeoLocationPoint } from './types';

export class GeoLocationService {
  /**
   * Acquires the current device GPS coordinates with high accuracy
   */
  async getCurrentPosition(): Promise<GeoLocationPoint> {
    try {
      // In native runtime: Geolocation.getCurrentPosition(...)
      // Simulated GPS with real coordinates (e.g. Campus Universitario FCyT / Concepción del Uruguay)
      const campusLat = -32.4806;
      const campusLng = -58.2327;
      const jitterLat = (Math.random() - 0.5) * 0.001;
      const jitterLng = (Math.random() - 0.5) * 0.001;

      return {
        latitude: parseFloat((campusLat + jitterLat).toFixed(6)),
        longitude: parseFloat((campusLng + jitterLng).toFixed(6)),
        altitude: 28.5,
        accuracy: 4.2,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn('[GeoLocation] Error getting coordinates:', err.message);
      return {
        latitude: -32.4806,
        longitude: -58.2327,
        accuracy: 10,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Formats coordinates into standard geographical notation (DMS or Decimal)
   */
  formatCoords(point: GeoLocationPoint): string {
    const latDir = point.latitude >= 0 ? 'N' : 'S';
    const lngDir = point.longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(point.latitude).toFixed(4)}° ${latDir}, ${Math.abs(point.longitude).toFixed(4)}° ${lngDir} (±${point.accuracy}m)`;
  }
}
