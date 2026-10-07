export * from './types';
export * from './NetworkMonitor';
export * from './SyncEngine';

import { networkMonitor } from './NetworkMonitor';
import { syncEngine } from './SyncEngine';

export class SyncLayerFacade {
  readonly monitor = networkMonitor;
  readonly engine = syncEngine;
}

export const syncLayer = new SyncLayerFacade();
