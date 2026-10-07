export interface DeviceQrPayload {
  deviceType: 'ROUTER' | 'SWITCH' | 'ACCESS_POINT' | 'ANTENNA' | 'SERVER';
  serialNumber: string;
  macAddress: string;
  defaultIp: string;
  model: string;
  vendor: string;
  rawCode: string;
}

export interface GeoLocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: string;
}

export interface FieldEvidenceItem {
  id: string;
  qrData: DeviceQrPayload;
  photoUri: string;
  photoBase64?: string;
  gps: GeoLocationPoint;
  capturedAt: string;
  operatorNotes?: string;
}
