import {
  enqueueManualReading,
  getQueuedReadings,
  removeQueuedReading,
  clearQueuedReadings,
  syncQueuedReadings,
} from '../services/offlineQueue';

// In-memory mock for AsyncStorage
const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => store[key] || null),
  setItem: jest.fn(async (key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete store[key];
  }),
}));

describe('Offline Reading Queue (RF-21 & RNF-07)', () => {
  beforeEach(async () => {
    for (const k in store) {
      delete store[k];
    }
    await clearQueuedReadings();
  });

  test('Enqueues manual readings with generated UUID client_request_id and timestamp', async () => {
    const item = await enqueueManualReading({
      station_id: 's-1',
      plot_id: 'p-1',
      moisture_pct: 21.5,
      temp_c: 24.0,
      rain_mm: 0,
      notes: 'Cabecera seca',
    });

    expect(item.client_request_id).toBeDefined();
    expect(item.client_request_id.length).toBe(36);
    expect(item.moisture_pct).toBe(21.5);
    expect(item.measured_at).toBeDefined();

    const queued = await getQueuedReadings();
    expect(queued.length).toBe(1);
    expect(queued[0].client_request_id).toBe(item.client_request_id);
  });

  test('Removes a specific queued reading by client_request_id', async () => {
    const item1 = await enqueueManualReading({
      station_id: 's-1',
      plot_id: 'p-1',
      moisture_pct: 20,
      temp_c: 22,
    });
    const item2 = await enqueueManualReading({
      station_id: 's-2',
      plot_id: 'p-2',
      moisture_pct: 35,
      temp_c: 25,
    });

    let queued = await getQueuedReadings();
    expect(queued.length).toBe(2);

    await removeQueuedReading(item1.client_request_id);

    queued = await getQueuedReadings();
    expect(queued.length).toBe(1);
    expect(queued[0].client_request_id).toBe(item2.client_request_id);
  });

  test('Clears all queued readings', async () => {
    await enqueueManualReading({
      station_id: 's-1',
      plot_id: 'p-1',
      moisture_pct: 20,
      temp_c: 22,
    });
    await clearQueuedReadings();
    const queued = await getQueuedReadings();
    expect(queued.length).toBe(0);
  });

  test('Syncs queued readings to Supabase and clears successfully synced items', async () => {
    await enqueueManualReading({
      station_id: 's-1',
      plot_id: 'p-1',
      moisture_pct: 22,
      temp_c: 23,
    });

    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        insert: mockInsert,
      }),
    } as any;

    const result = await syncQueuedReadings(mockSupabaseClient);
    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
    expect(mockInsert).toHaveBeenCalledTimes(1);

    const remaining = await getQueuedReadings();
    expect(remaining.length).toBe(0);
  });
});
