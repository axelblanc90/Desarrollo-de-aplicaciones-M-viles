export * from './types';
export * from './QrScannerService';
export * from './CameraService';
export * from './GeoLocationService';
export * from './EvidenceManager';

import { EvidenceManager } from './EvidenceManager';

export const evidenceLayer = new EvidenceManager();
