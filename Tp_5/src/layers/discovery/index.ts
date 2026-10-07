export * from './types';
export * from './ArpDiscoveryService';
export * from './BonjourDiscoveryService';
export * from './DnsService';
export * from './TelephonyBridge';

import { ArpDiscoveryService } from './ArpDiscoveryService';
import { BonjourDiscoveryService } from './BonjourDiscoveryService';
import { DnsService } from './DnsService';
import { TelephonyService } from './TelephonyBridge';

export class DiscoveryLayerFacade {
  readonly arp = new ArpDiscoveryService();
  readonly bonjour = new BonjourDiscoveryService();
  readonly dns = new DnsService();
  readonly telephony = TelephonyService;

  async performFullSubnetDiscovery(subnetPrefix: string = '192.168.1') {
    const [arpDevices, bonjourDevices] = await Promise.all([
      this.arp.scanSubnet(subnetPrefix, 1, 20),
      this.bonjour.discoverServices()
    ]);

    // Merge by IP
    const map = new Map<string, any>();
    arpDevices.forEach(d => map.set(d.ip, d));
    bonjourDevices.forEach(d => {
      if (map.has(d.ip)) {
        const existing = map.get(d.ip);
        map.set(d.ip, { ...existing, hostname: d.hostname, vendor: d.vendor || existing.vendor });
      } else {
        map.set(d.ip, d);
      }
    });

    return Array.from(map.values());
  }
}

export const discoveryLayer = new DiscoveryLayerFacade();
