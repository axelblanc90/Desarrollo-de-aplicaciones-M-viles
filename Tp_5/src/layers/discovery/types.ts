export interface DiscoveredDevice {
  id: string;
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
  discoveryMethod: 'ARP' | 'BONJOUR_MDNS' | 'DNS' | 'MANUAL';
  isAlive: boolean;
  responseTimeMs?: number;
  openPorts?: number[];
  discoveredAt: string;
}

export interface ArpScanProgress {
  scannedIps: number;
  totalIps: number;
  percentage: number;
  currentIp: string;
  foundDevices: number;
}
