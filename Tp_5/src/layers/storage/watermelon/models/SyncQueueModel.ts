import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class SyncQueueModel extends Model {
  static table = 'sync_queue';

  @field('entity_type') entityType!: string;
  @field('entity_id') entityId!: string;
  @field('payload_json') payloadJson!: string;
  @field('status') status!: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
  @field('attempts') attempts!: number;
  @readonly @date('created_at') createdAt!: Date;
}
