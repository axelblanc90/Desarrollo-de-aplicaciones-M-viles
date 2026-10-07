import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const AppDatabaseSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'devices',
      columns: [
        { name: 'ip', type: 'string' },
        { name: 'mac', type: 'string', isOptional: true },
        { name: 'hostname', type: 'string', isOptional: true },
        { name: 'vendor', type: 'string', isOptional: true },
        { name: 'device_type', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'measurements',
      columns: [
        { name: 'device_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'rtt_min', type: 'number' },
        { name: 'rtt_avg', type: 'number' },
        { name: 'rtt_max', type: 'number' },
        { name: 'jitter', type: 'number' },
        { name: 'packet_loss', type: 'number' },
        { name: 'download_mbps', type: 'number' },
        { name: 'upload_mbps', type: 'number' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'evidence_records',
      columns: [
        { name: 'device_id', type: 'string', isOptional: true },
        { name: 'serial_number', type: 'string' },
        { name: 'mac_address', type: 'string' },
        { name: 'photo_uri', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'entity_type', type: 'string' },
        { name: 'entity_id', type: 'string' },
        { name: 'payload_json', type: 'string' },
        { name: 'status', type: 'string' }, // PENDING, SYNCING, FAILED, SYNCED
        { name: 'attempts', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
