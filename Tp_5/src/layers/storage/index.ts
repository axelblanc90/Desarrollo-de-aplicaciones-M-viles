export * from './watermelon/schema';
export * from './watermelon/database';
export * from './watermelon/models/DeviceModel';
export * from './watermelon/models/MeasurementModel';
export * from './watermelon/models/EvidenceModel';
export * from './watermelon/models/SyncQueueModel';
export * from './keychain/CredentialStore';

import { localStore } from './watermelon/database';
import { credentialStore } from './keychain/CredentialStore';

export class StorageLayerFacade {
  readonly db = localStore;
  readonly keychain = credentialStore;
}

export const storageLayer = new StorageLayerFacade();
