import { PlotStatus, Reading } from '../types/agropulse.types';

export const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

export interface PlotStatusCalculationParams {
  latestReading?: Reading | null;
  thresholdMin?: number;
  thresholdMax?: number;
  now?: Date;
}

export function calculatePlotStatus(params: PlotStatusCalculationParams): PlotStatus {
  const { latestReading, thresholdMin = 25, thresholdMax = 45, now = new Date() } = params;

  if (!latestReading || !latestReading.measured_at) {
    return 'stale';
  }

  const measuredAt = new Date(latestReading.measured_at);
  const diffMs = now.getTime() - measuredAt.getTime();

  // Rule 1: No reading or measured_at > 15 min ago
  if (diffMs > STALE_THRESHOLD_MS) {
    return 'stale';
  }

  const moisture = latestReading.moisture_pct;

  // Rule 2: Dry (moisture < threshold_min)
  if (moisture < thresholdMin) {
    return 'dry';
  }

  // Rule 3: Optimal (threshold_min <= moisture <= threshold_max)
  if (moisture <= thresholdMax) {
    return 'optimal';
  }

  // Rule 4: Wet (moisture > threshold_max)
  return 'wet';
}

export function getPlotStatusColor(status: PlotStatus): string {
  switch (status) {
    case 'optimal':
      return '#059669'; // Vibrant Emerald
    case 'dry':
      return '#E11D48'; // Vivid Crimson Rose
    case 'wet':
      return '#0284C7'; // Deep Sky Blue
    case 'stale':
    default:
      return '#64748B'; // Slate Gray
  }
}

export function getPlotStatusLabel(status: PlotStatus): string {
  switch (status) {
    case 'optimal':
      return 'Óptimo';
    case 'dry':
      return 'Seco';
    case 'wet':
      return 'Húmedo';
    case 'stale':
    default:
      return 'Sin datos confiables (Stale)';
  }
}
