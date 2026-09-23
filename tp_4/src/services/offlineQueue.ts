import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseClient } from '@supabase/supabase-js';
import { generateUUID } from '../lib/idempotency';

const OFFLINE_QUEUE_STORAGE_KEY = '@agropulse:offline_readings_queue';

export interface QueuedManualReading {
  client_request_id: string;
  station_id: string;
  plot_id: string;
  moisture_pct: number;
  temp_c: number;
  rain_mm?: number;
  notes?: string;
  lat?: number;
  lng?: number;
  measured_at: string;
}

export async function getQueuedReadings(): Promise<QueuedManualReading[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('[OFFLINE QUEUE] Error reading queue:', err);
    return [];
  }
}

export async function enqueueManualReading(
  reading: Omit<QueuedManualReading, 'client_request_id' | 'measured_at'>
): Promise<QueuedManualReading> {
  const newItem: QueuedManualReading = {
    ...reading,
    client_request_id: generateUUID(),
    measured_at: new Date().toISOString(),
  };

  try {
    const current = await getQueuedReadings();
    const updated = [...current, newItem];
    await AsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(updated));
    console.log('[OFFLINE QUEUE] Enqueued manual reading:', newItem.client_request_id);
    return newItem;
  } catch (err) {
    console.error('[OFFLINE QUEUE] Error enqueuing item:', err);
    throw err;
  }
}

export async function removeQueuedReading(clientRequestId: string): Promise<void> {
  try {
    const current = await getQueuedReadings();
    const filtered = current.filter((item) => item.client_request_id !== clientRequestId);
    await AsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('[OFFLINE QUEUE] Error removing item from queue:', err);
  }
}

export async function clearQueuedReadings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_STORAGE_KEY);
  } catch (err) {
    console.error('[OFFLINE QUEUE] Error clearing queue:', err);
  }
}

export async function syncQueuedReadings(supabaseClient: SupabaseClient): Promise<{
  synced: number;
  failed: number;
}> {
  const queue = await getQueuedReadings();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const { error } = await supabaseClient.from('readings').insert({
        station_id: item.station_id,
        moisture_pct: item.moisture_pct,
        temp_c: item.temp_c,
        rain_mm: item.rain_mm || 0,
        source: 'manual',
        measured_at: item.measured_at,
      });

      if (!error) {
        await removeQueuedReading(item.client_request_id);
        synced++;
      } else {
        console.warn(`[OFFLINE QUEUE] Sync error for ${item.client_request_id}:`, error.message);
        failed++;
      }
    } catch (err) {
      console.error(`[OFFLINE QUEUE] Exception during sync for ${item.client_request_id}:`, err);
      failed++;
    }
  }

  return { synced, failed };
}
