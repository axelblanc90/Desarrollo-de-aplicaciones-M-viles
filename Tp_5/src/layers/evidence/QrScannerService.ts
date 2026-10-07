import { DeviceQrPayload } from './types';

export class QrScannerService {
  /**
   * Decodes equipment QR or Barcode raw string into structured device specifications
   */
  parseEquipmentCode(rawString: string): DeviceQrPayload {
    const trimmed = rawString.trim();

    // 1. Try parsing JSON sticker format
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.mac || parsed.sn || parsed.model) {
        return {
          deviceType: parsed.type || 'ROUTER',
          serialNumber: parsed.sn || parsed.serialNumber || 'SN-UNKNOWN',
          macAddress: parsed.mac || '00:00:00:00:00:00',
          defaultIp: parsed.ip || '192.168.1.1',
          model: parsed.model || 'Unknown Network Device',
          vendor: parsed.vendor || 'Cisco',
          rawCode: trimmed,
        };
      }
    } catch {
      // Not JSON, continue to delimiter parsing
    }

    // 2. Delimiter parsing: TYPE:SWITCH;MODEL:C2960;SN:FOC1234;MAC:00:1A:2B:3C:4D:5E;IP:192.168.1.1
    if (trimmed.includes(';') || trimmed.includes(',')) {
      const parts = trimmed.split(/[;,]/);
      const dict: Record<string, string> = {};
      for (const p of parts) {
        const [k, v] = p.split(/[:=]/);
        if (k && v) dict[k.trim().toUpperCase()] = v.trim();
      }

      return {
        deviceType: (dict.TYPE as any) || 'SWITCH',
        serialNumber: dict.SN || dict.SERIAL || 'SN-CAT2960-9921',
        macAddress: dict.MAC || '00:1A:2B:3C:4D:5E',
        defaultIp: dict.IP || '192.168.1.1',
        model: dict.MODEL || 'Catalyst 2960-X',
        vendor: dict.VENDOR || 'Cisco Systems',
        rawCode: trimmed,
      };
    }

    // 3. Fallback: Treat as Serial Number barcode
    return {
      deviceType: 'ROUTER',
      serialNumber: trimmed || 'SN-DEFAULT-001',
      macAddress: '00:1A:2B:AA:BB:CC',
      defaultIp: '192.168.1.1',
      model: 'EdgeRouter Pro',
      vendor: 'Ubiquiti Networks',
      rawCode: trimmed,
    };
  }

  /**
   * Generates a sample QR payload string for testing and simulation
   */
  generateSampleQr(type: 'CISCO_SWITCH' | 'MIKROTIK_ROUTER' | 'UBIQUITI_AP'): string {
    switch (type) {
      case 'CISCO_SWITCH':
        return JSON.stringify({
          type: 'SWITCH',
          model: 'Catalyst 2960-X 24P',
          vendor: 'Cisco Systems',
          sn: 'FOC2134L09A',
          mac: '00:1A:2B:3C:4D:5E',
          ip: '192.168.1.1'
        });
      case 'MIKROTIK_ROUTER':
        return 'TYPE:ROUTER;MODEL:RB4011iGS;VENDOR:MikroTik;SN:HE78921B;MAC:D4:CA:6D:88:99:AA;IP:192.168.1.10';
      case 'UBIQUITI_AP':
        return JSON.stringify({
          type: 'ACCESS_POINT',
          model: 'UniFi AP U6-Pro',
          vendor: 'Ubiquiti',
          sn: 'U6P-882194',
          mac: '74:83:C2:11:22:33',
          ip: '192.168.1.25'
        });
    }
  }
}
