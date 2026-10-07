import { localStore } from '../storage/watermelon/database';
import { networkMonitor } from './NetworkMonitor';
import { SyncBatchPayload } from './types';

export class SyncEngine {
  private backendSyncUrl: string = 'http://192.168.1.50:3001/api/sync';
  private isSyncing: boolean = false;
  private syncListeners: Set<(isSyncing: boolean, pendingCount: number) => void> = new Set();

  constructor() {
    // Automatically trigger sync when connectivity is restored
    networkMonitor.subscribe((state) => {
      if (state.isConnected) {
        this.triggerSync();
      }
    });
  }

  onSyncStatusChange(cb: (isSyncing: boolean, pendingCount: number) => void): () => void {
    this.syncListeners.add(cb);
    return () => this.syncListeners.delete(cb);
  }

  async getPendingCount(): Promise<number> {
    const pending = await localStore.getPendingSyncItems();
    return pending.length;
  }

  /**
   * Enqueues an entity into the offline-first sync queue
   */
  async enqueueForSync(entityType: 'DEVICE' | 'MEASUREMENT' | 'EVIDENCE', entityId: string, payload: any) {
    await localStore.enqueueSync(entityType, entityId, payload);
    const count = await this.getPendingCount();
    this.notifyListeners(this.isSyncing, count);

    // If online right now, attempt immediate sync
    if (networkMonitor.getCurrentState().isConnected) {
      this.triggerSync();
    }
  }

  /**
   * Drains the sync queue by sending batched data to backend
   */
  async triggerSync(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.isSyncing) return { success: false, syncedCount: 0 };

    const pending = await localStore.getPendingSyncItems();
    if (pending.length === 0) return { success: true, syncedCount: 0 };

    this.isSyncing = true;
    this.notifyListeners(true, pending.length);

    try {
      const batchPayload: SyncBatchPayload = {
        batchId: `batch_${Date.now()}`,
        devices: pending.filter((p) => p.entityType === 'DEVICE').map((p) => p.payload),
        measurements: pending.filter((p) => p.entityType === 'MEASUREMENT').map((p) => p.payload),
        evidence: pending.filter((p) => p.entityType === 'EVIDENCE').map((p) => p.payload),
      };

      // Send to Backend Sync API
      const res = await fetch(this.backendSyncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload),
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      // Mark all processed items as SYNCED
      for (const item of pending) {
        await localStore.markAsSynced(item.id);
      }

      this.isSyncing = false;
      const remainingCount = await this.getPendingCount();
      this.notifyListeners(false, remainingCount);

      return { success: true, syncedCount: pending.length };
    } catch (err: any) {
      console.warn('[SyncEngine] Sync failed or offline, items remain in queue:', err.message);
      this.isSyncing = false;
      const count = await this.getPendingCount();
      this.notifyListeners(false, count);
      return { success: false, syncedCount: 0 };
    }
  }

  private notifyListeners(syncing: boolean, count: number) {
    this.syncListeners.forEach((cb) => cb(syncing, count));
  }
}

export const syncEngine = new SyncEngine();
