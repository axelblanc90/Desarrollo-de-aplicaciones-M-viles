import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class DeviceModel extends Model {
  static table = 'devices';

  @field('ip') ip!: string;
  @field('mac') mac?: string;
  @field('hostname') hostname?: string;
  @field('vendor') vendor?: string;
  @field('device_type') deviceType!: string;
  @readonly @date('created_at') createdAt!: Date;
}
