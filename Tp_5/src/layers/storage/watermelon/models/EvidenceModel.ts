import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class EvidenceModel extends Model {
  static table = 'evidence_records';

  @field('device_id') deviceId?: string;
  @field('serial_number') serialNumber!: string;
  @field('mac_address') macAddress!: string;
  @field('photo_uri') photoUri!: string;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @field('notes') notes?: string;
  @readonly @date('created_at') createdAt!: Date;
}
