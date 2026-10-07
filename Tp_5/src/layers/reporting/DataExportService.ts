export interface ExportFilterOptions {
  networkType?: string;
  startDate?: Date;
  endDate?: Date;
}

export class DataExportService {
  /**
   * Exporta mediciones a formato JSON estructurado (RF-08)
   */
  static exportToJson(records: any[], filters?: ExportFilterOptions): string {
    const filtered = this.applyFilters(records, filters);
    return JSON.stringify(filtered, null, 2);
  }

  /**
   * Exporta mediciones a formato CSV tabular delimitado por comas (RF-08)
   */
  static exportToCsv(records: any[], filters?: ExportFilterOptions): string {
    const filtered = this.applyFilters(records, filters);

    const headers = [
      'ID_AUDITORIA',
      'TIMESTAMP',
      'TIPO_EQUIPO',
      'MODELO',
      'SERIAL_NUMBER',
      'IP',
      'MAC',
      'RTT_AVG_MS',
      'JITTER_MS',
      'PACKET_LOSS_PCT',
      'DOWNLOAD_MBPS',
      'UPLOAD_MBPS',
      'GPS_LATITUD',
      'GPS_LONGITUD',
      'GPS_PRECISION_M',
    ];

    const rows = filtered.map((r) => {
      const dev = r.device || {};
      const qos = r.qos || {};
      const ping = (qos.pings && qos.pings[0]) || {};
      const tp = qos.throughput || {};
      const ev = r.evidence || {};
      const gps = ev.gps || {};

      return [
        `"${r.id || ''}"`,
        `"${r.createdAt || ''}"`,
        `"${dev.type || ''}"`,
        `"${dev.model || ''}"`,
        `"${dev.serialNumber || ''}"`,
        `"${dev.ip || ''}"`,
        `"${dev.macAddress || ''}"`,
        ping.avgRttMs || 0,
        ping.jitterMs || 0,
        ping.packetLossPercentage || 0,
        tp.downloadMbps || 0,
        tp.uploadMbps || 0,
        gps.latitude || 0,
        gps.longitude || 0,
        gps.accuracy || 0,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Filtra registros por tipo de red y rango de fechas (RF-09)
   */
  private static applyFilters(records: any[], filters?: ExportFilterOptions): any[] {
    if (!filters) return records;

    return records.filter((r) => {
      if (filters.networkType && r.device?.type !== filters.networkType) {
        return false;
      }
      if (filters.startDate && new Date(r.createdAt) < filters.startDate) {
        return false;
      }
      if (filters.endDate && new Date(r.createdAt) > filters.endDate) {
        return false;
      }
      return true;
    });
  }
}
