import { PingResult } from './types';

export class LatencyProbeService {
  private defaultTargets: string[] = ['1.1.1.1', '8.8.8.8', '192.168.1.1'];

  /**
   * Performs an RTT & Jitter probe against multiple hosts (RF-02)
   */
  async probeMultipleHosts(
    hosts: string[] = this.defaultTargets,
    samplesPerHost: number = 5
  ): Promise<PingResult[]> {
    const results: PingResult[] = [];
    for (const host of hosts) {
      const res = await this.probeHost(host, samplesPerHost);
      results.push(res);
    }
    return results;
  }

  /**
   * Sends multiple probes to a single host calculating RTT min, avg, max, and jitter
   */
  async probeHost(host: string, samplesCount: number = 5): Promise<PingResult> {
    const samples: number[] = [];
    let lostPackets = 0;

    for (let i = 0; i < samplesCount; i++) {
      try {
        const rtt = await this.singleProbe(host);
        samples.push(rtt);
      } catch {
        lostPackets++;
      }
      // Small spacing between probes
      await new Promise((r) => setTimeout(r, 60));
    }

    if (samples.length === 0) {
      return {
        host,
        rttSamplesMs: [],
        minRttMs: 0,
        avgRttMs: 0,
        maxRttMs: 0,
        jitterMs: 0,
        packetLossPercentage: 100,
        timestamp: new Date().toISOString(),
      };
    }

    const minRtt = Math.min(...samples);
    const maxRtt = Math.max(...samples);
    const avgRtt = parseFloat((samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2));
    const jitter = this.calculateJitter(samples);
    const packetLoss = parseFloat(((lostPackets / samplesCount) * 100).toFixed(1));

    return {
      host,
      rttSamplesMs: samples,
      minRttMs: minRtt,
      avgRttMs: avgRtt,
      maxRttMs: maxRtt,
      jitterMs: jitter,
      packetLossPercentage: packetLoss,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * RFC 3550 / RFC 2544 Jitter calculation
   * Mean absolute difference of consecutive RTT samples
   */
  private calculateJitter(samples: number[]): number {
    if (samples.length < 2) return 0;
    let sumDiff = 0;
    for (let i = 0; i < samples.length - 1; i++) {
      sumDiff += Math.abs(samples[i + 1] - samples[i]);
    }
    return parseFloat((sumDiff / (samples.length - 1)).toFixed(2));
  }

  private singleProbe(host: string): Promise<number> {
    const start = Date.now();
    // Simulate real TCP socket probe to port 80/443
    return new Promise((resolve) => {
      const baseDelay = host.startsWith('192.168.') ? 4 : 22;
      const jitterNoise = Math.floor(Math.random() * 8) - 4;
      const simulatedRtt = Math.max(2, baseDelay + jitterNoise);

      setTimeout(() => {
        resolve(simulatedRtt);
      }, simulatedRtt);
    });
  }
}
