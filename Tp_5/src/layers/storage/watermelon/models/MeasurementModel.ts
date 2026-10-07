import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class MeasurementModel extends Model {
  static table = 'measurements';

  @field('device_id') deviceId?: string;
  @field('rtt_min') rttMin!: number;
  @field('rtt_avg') rttAvg!: number;
  @field('rtt_max') rttMax!: number;
  @field('jitter') jitter!: number;
  @field('packet_loss') packetLoss!: number;
  @field('download_mbps') downloadMbps!: number;
  @field('upload_mbps') uploadMbps!: number;
  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @readonly @date('created_at') createdAt!: Date;
}
