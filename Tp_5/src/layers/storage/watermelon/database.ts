import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { AppDatabaseSchema } from './schema';
import { DeviceModel } from './models/DeviceModel';
import { MeasurementModel } from './models/MeasurementModel';
import { EvidenceModel } from './models/EvidenceModel';
import { SyncQueueModel } from './models/SyncQueueModel';

// In-memory fallback repository when running in environments without compiled SQLite native drivers
class LocalStorageRepository {
  private devices: any[] = [];
  private measurements: any[] = [];
  private evidence: any[] = [];
  private syncQueue: any[] = [];

  async saveDevice(dev: any) {
    const item = { id: dev.id || `dev_${Date.now()}`, ...dev, createdAt: new Date() };
    this.devices.push(item);
    return item;
  }

  async getAllDevices() {
    return [...this.devices];
  }

  async saveMeasurement(meas: any) {
    const item = { id: `meas_${Date.now()}`, ...meas, createdAt: new Date() };
    this.measurements.push(item);
    return item;
  }

  async getAllMeasurements() {
    return [...this.measurements];
  }

  async saveEvidence(ev: any) {
    const item = { id: ev.id || `ev_${Date.now()}`, ...ev, createdAt: new Date() };
    this.evidence.push(item);
    return item;
  }

  async getAllEvidence() {
    return [...this.evidence];
  }

  async enqueueSync(entityType: string, entityId: string, payload: any) {
    const item = {
      id: `sync_${Date.now()}`,
      entityType,
      entityId,
      payload,
      status: 'PENDING' as const,
      attempts: 0,
      createdAt: new Date(),
    };
    this.syncQueue.push(item);
    return item;
  }

  async getPendingSyncItems() {
    return this.syncQueue.filter((s) => s.status === 'PENDING' || s.status === 'FAILED');
  }

  async markAsSynced(id: string) {
    const found = this.syncQueue.find((s) => s.id === id);
    if (found) found.status = 'SYNCED';
  }
}

let databaseInstance: Database | null = null;
export const localStore = new LocalStorageRepository();

export function getWatermelonDatabase(): Database | LocalStorageRepository {
  try {
    if (!databaseInstance) {
      const adapter = new SQLiteAdapter({
        schema: AppDatabaseSchema,
        jsi: true,
        onSetUpError: (error) => {
          console.warn('[WatermelonDB] Setup error, falling back to local memory repo:', error);
        },
      });

      databaseInstance = new Database({
        adapter,
        modelClasses: [DeviceModel, MeasurementModel, EvidenceModel, SyncQueueModel],
      });
    }
    return databaseInstance;
  } catch (e) {
    console.warn('[WatermelonDB] SQLite Native unavailable in current runner, using LocalStorageRepository');
    return localStore;
  }
}
