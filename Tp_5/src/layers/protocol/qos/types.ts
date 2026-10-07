export interface PingResult {
  host: string;
  rttSamplesMs: number[];
  minRttMs: number;
  avgRttMs: number;
  maxRttMs: number;
  jitterMs: number;
  packetLossPercentage: number;
  timestamp: string;
}

export interface ThroughputResult {
  downloadMbps: number;
  uploadMbps: number;
  downloadBytes: number;
  uploadBytes: number;
  downloadDurationMs: number;
  uploadDurationMs: number;
  timestamp: string;
}

export interface QoSAssessment {
  score: 'EXCELLENT' | 'GOOD' | 'DEGRADED' | 'CRITICAL';
  ratingPercent: number;
  summary: string;
}
