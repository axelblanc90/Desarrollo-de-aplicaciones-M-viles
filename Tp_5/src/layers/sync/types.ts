export interface NetworkStateSnapshot {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
  details: {
    ssid?: string;
    bssid?: string;
    ipAddress?: string;
    subnet?: string;
    carrier?: string;
    cellularGeneration?: '2g' | '3g' | '4g' | '5g' | null;
    isConnectionExpensive?: boolean;
  };
}

export interface SyncBatchPayload {
  batchId: string;
  devices: any[];
  measurements: any[];
  evidence: any[];
}
