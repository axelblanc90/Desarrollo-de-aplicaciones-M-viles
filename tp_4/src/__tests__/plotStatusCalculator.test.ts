import {
  calculatePlotStatus,
  getPlotStatusColor,
  getPlotStatusLabel,
  STALE_THRESHOLD_MS,
} from '../lib/plotStatusCalculator';
import { Reading } from '../types/agropulse.types';

describe('Plot Status Calculator (§8 Reglas de Negocio)', () => {
  const baseReading: Reading = {
    id: 'r-1',
    station_id: 's-1',
    measured_at: new Date().toISOString(),
    moisture_pct: 30,
    temp_c: 22,
    rain_mm: 0,
    source: 'sensor',
  };

  test('Rule 1 (Stale): Returns "stale" when latest reading is null or undefined', () => {
    expect(calculatePlotStatus({ latestReading: null })).toBe('stale');
    expect(calculatePlotStatus({ latestReading: undefined })).toBe('stale');
  });

  test('Rule 1 (Stale): Returns "stale" when measured_at is older than 15 minutes', () => {
    const now = new Date();
    // 16 minutes ago
    const oldDate = new Date(now.getTime() - (STALE_THRESHOLD_MS + 60 * 1000));
    const oldReading: Reading = { ...baseReading, measured_at: oldDate.toISOString() };

    expect(calculatePlotStatus({ latestReading: oldReading, now })).toBe('stale');
  });

  test('Rule 1 (Stale): Returns active status when measured_at is within 15 minutes', () => {
    const now = new Date();
    // 10 minutes ago
    const recentDate = new Date(now.getTime() - 10 * 60 * 1000);
    const recentReading: Reading = { ...baseReading, measured_at: recentDate.toISOString(), moisture_pct: 35 };

    expect(calculatePlotStatus({ latestReading: recentReading, now })).toBe('optimal');
  });

  test('Rule 2 (Dry): Returns "dry" when moisture is below threshold_min', () => {
    const dryReading: Reading = { ...baseReading, moisture_pct: 18 };
    expect(calculatePlotStatus({ latestReading: dryReading, thresholdMin: 25, thresholdMax: 45 })).toBe('dry');
  });

  test('Rule 3 (Optimal): Returns "optimal" when moisture is exactly at threshold_min or threshold_max', () => {
    const atMinReading: Reading = { ...baseReading, moisture_pct: 25 };
    const atMaxReading: Reading = { ...baseReading, moisture_pct: 45 };
    const midReading: Reading = { ...baseReading, moisture_pct: 35 };

    expect(calculatePlotStatus({ latestReading: atMinReading, thresholdMin: 25, thresholdMax: 45 })).toBe('optimal');
    expect(calculatePlotStatus({ latestReading: atMaxReading, thresholdMin: 25, thresholdMax: 45 })).toBe('optimal');
    expect(calculatePlotStatus({ latestReading: midReading, thresholdMin: 25, thresholdMax: 45 })).toBe('optimal');
  });

  test('Rule 4 (Wet): Returns "wet" when moisture is strictly greater than threshold_max', () => {
    const wetReading: Reading = { ...baseReading, moisture_pct: 52 };
    expect(calculatePlotStatus({ latestReading: wetReading, thresholdMin: 25, thresholdMax: 45 })).toBe('wet');
  });

  test('Respects custom thresholds per plot', () => {
    // Custom thresholds: min 20, max 30
    const reading22: Reading = { ...baseReading, moisture_pct: 22 };
    const reading18: Reading = { ...baseReading, moisture_pct: 18 };
    const reading35: Reading = { ...baseReading, moisture_pct: 35 };

    expect(calculatePlotStatus({ latestReading: reading22, thresholdMin: 20, thresholdMax: 30 })).toBe('optimal');
    expect(calculatePlotStatus({ latestReading: reading18, thresholdMin: 20, thresholdMax: 30 })).toBe('dry');
    expect(calculatePlotStatus({ latestReading: reading35, thresholdMin: 20, thresholdMax: 30 })).toBe('wet');
  });

  test('Helper getPlotStatusColor returns valid hex codes for each state', () => {
    expect(getPlotStatusColor('optimal')).toBe('#059669');
    expect(getPlotStatusColor('dry')).toBe('#E11D48');
    expect(getPlotStatusColor('wet')).toBe('#0284C7');
    expect(getPlotStatusColor('stale')).toBe('#64748B');
  });

  test('Helper getPlotStatusLabel returns Spanish human-readable labels', () => {
    expect(getPlotStatusLabel('optimal')).toBe('Óptimo');
    expect(getPlotStatusLabel('dry')).toBe('Seco');
    expect(getPlotStatusLabel('wet')).toBe('Húmedo');
    expect(getPlotStatusLabel('stale')).toContain('Stale');
  });
});
