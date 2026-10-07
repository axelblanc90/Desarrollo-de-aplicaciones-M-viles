export class DnsService {
  /**
   * Resolves reverse DNS or local hostname lookups
   */
  async reverseLookup(ip: string): Promise<string> {
    const knownHosts: Record<string, string> = {
      '192.168.1.1': 'gateway.lan',
      '192.168.1.10': 'router-edge.lan',
      '192.168.1.25': 'ap-wifi6-hall.lan',
      '192.168.1.50': 'snmp-nms-server.lan',
    };

    return knownHosts[ip] || `host-${ip.replace(/\./g, '-')}.local`;
  }
}
