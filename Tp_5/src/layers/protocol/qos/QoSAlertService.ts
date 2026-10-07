export interface QoSDegradationAlert {
  metric: 'RTT' | 'JITTER' | 'PACKET_LOSS' | 'THROUGHPUT';
  observedValue: number;
  thresholdValue: number;
  message: string;
  timestamp: string;
}

export class QoSAlertService {
  // Umbrales tolerables para una conexión de red industrial/móvil
  private static readonly MAX_TOLERABLE_RTT_MS = 150;
  private static readonly MAX_TOLERABLE_JITTER_MS = 25;
  private static readonly MAX_PACKET_LOSS_PCT = 5.0;
  private static readonly MIN_TOLERABLE_THROUGHPUT_MBPS = 5.0;

  /**
   * Evalúa las métricas y notifica al usuario si existe una degradación severa (RF-07)
   */
  static evaluateQuality(
    rttAvg: number,
    jitter: number,
    packetLoss: number,
    downloadMbps: number
  ): QoSDegradationAlert | null {
    if (packetLoss > this.MAX_PACKET_LOSS_PCT) {
      return {
        metric: 'PACKET_LOSS',
        observedValue: packetLoss,
        thresholdValue: this.MAX_PACKET_LOSS_PCT,
        message: `ALERTA CRÍTICA: Pérdida de paquetes elevada (${packetLoss}% > ${this.MAX_PACKET_LOSS_PCT}%). Posible congestión en el enlace.`,
        timestamp: new Date().toISOString(),
      };
    }

    if (rttAvg > this.MAX_TOLERABLE_RTT_MS) {
      return {
        metric: 'RTT',
        observedValue: rttAvg,
        thresholdValue: this.MAX_TOLERABLE_RTT_MS,
        message: `ALERTA: Latencia excesiva detectada (RTT ${rttAvg}ms > ${this.MAX_TOLERABLE_RTT_MS}ms).`,
        timestamp: new Date().toISOString(),
      };
    }

    if (jitter > this.MAX_TOLERABLE_JITTER_MS) {
      return {
        metric: 'JITTER',
        observedValue: jitter,
        thresholdValue: this.MAX_TOLERABLE_JITTER_MS,
        message: `ALERTA: Jitter fuera de norma (RFC 3550: ${jitter}ms > ${this.MAX_TOLERABLE_JITTER_MS}ms). Afectación en tráfico en tiempo real.`,
        timestamp: new Date().toISOString(),
      };
    }

    if (downloadMbps < this.MIN_TOLERABLE_THROUGHPUT_MBPS && downloadMbps > 0) {
      return {
        metric: 'THROUGHPUT',
        observedValue: downloadMbps,
        thresholdValue: this.MIN_TOLERABLE_THROUGHPUT_MBPS,
        message: `ALERTA: Throughput de bajada degradado (${downloadMbps} Mbps < ${this.MIN_TOLERABLE_THROUGHPUT_MBPS} Mbps).`,
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }
}
