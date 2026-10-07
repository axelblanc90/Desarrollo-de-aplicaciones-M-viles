import { QrScannerService } from './QrScannerService';
import { CameraService } from './CameraService';
import { GeoLocationService } from './GeoLocationService';
import { FieldEvidenceItem } from './types';

export class EvidenceManager {
  readonly qr = new QrScannerService();
  readonly camera = new CameraService();
  readonly geo = new GeoLocationService();

  /**
   * Assembles a complete georeferenced equipment audit evidence package
   */
  async buildFieldEvidence(rawQrString: string, operatorNotes?: string): Promise<FieldEvidenceItem> {
    const qrData = this.qr.parseEquipmentCode(rawQrString);
    const [gps, photo] = await Promise.all([
      this.geo.getCurrentPosition(),
      this.camera.captureEquipmentPhoto(),
    ]);

    return {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      qrData,
      photoUri: photo.uri,
      photoBase64: photo.base64,
      gps,
      capturedAt: new Date().toISOString(),
      operatorNotes: operatorNotes || 'Instalación y enlace operativo verificado en sitio.',
    };
  }
}
