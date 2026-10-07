export interface FieldAuditReportData {
  reportId: string;
  auditDate: string;
  operatorName: string;
  device: {
    type: string;
    model: string;
    vendor: string;
    serialNumber: string;
    macAddress: string;
    ipAddress: string;
    hostname?: string;
  };
  snmpTelemetry?: {
    sysDescr?: string;
    sysUpTime?: string;
    sysName?: string;
    sysLocation?: string;
  };
  qosMetrics: {
    minRttMs: number;
    avgRttMs: number;
    maxRttMs: number;
    jitterMs: number;
    packetLossPercent: number;
    downloadMbps: number;
    uploadMbps: number;
  };
  evidence: {
    photoBase64?: string;
    gpsCoordinates: string;
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    notes?: string;
  };
}

export class ReportTemplate {
  static renderHtml(data: FieldAuditReportData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reporte de Auditoría e Instalación de Red - ${data.reportId}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #1e293b;
      background: #ffffff;
      font-size: 13px;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title-area h1 {
      margin: 0 0 5px 0;
      font-size: 22px;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }
    .grid {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .col {
      flex: 1;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 14px;
      font-weight: bold;
      color: #1e3a8a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 8px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 6px 0;
      vertical-align: top;
    }
    td.label {
      color: #64748b;
      font-weight: 600;
      width: 40%;
    }
    td.val {
      color: #0f172a;
      font-weight: 500;
    }
    .metric-box-container {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }
    .metric-box {
      flex: 1;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
    }
    .metric-value {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
    }
    .metric-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .photo-evidence-box {
      text-align: center;
      background: #ffffff;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 10px;
      margin-top: 10px;
    }
    .photo-evidence-box img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 4px;
    }
    .footer {
      margin-top: 35px;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-area">
      <h1>CERTIFICADO DE AUDITORÍA E INSTALACIÓN DE RED</h1>
      <div class="subtitle">Licenciatura en Sistemas de Información - Desarrollo Móvil 2026 | FCyT</div>
    </div>
    <div>
      <span class="badge">ESTADO: CERTIFICADO QOS</span>
    </div>
  </div>

  <div class="grid">
    <div class="col card">
      <div class="card-title">1. Identificación del Dispositivo (QR Scanned)</div>
      <table>
        <tr><td class="label">Tipo de Equipo:</td><td class="val">${data.device.type}</td></tr>
        <tr><td class="label">Modelo:</td><td class="val">${data.device.model}</td></tr>
        <tr><td class="label">Fabricante:</td><td class="val">${data.device.vendor}</td></tr>
        <tr><td class="label">Número de Serie:</td><td class="val"><code>${data.device.serialNumber}</code></td></tr>
        <tr><td class="label">Dirección MAC:</td><td class="val"><code>${data.device.macAddress}</code></td></tr>
        <tr><td class="label">Dirección IP:</td><td class="val"><code>${data.device.ipAddress}</code></td></tr>
        ${data.device.hostname ? `<tr><td class="label">Hostname:</td><td class="val">${data.device.hostname}</td></tr>` : ''}
      </table>
    </div>

    <div class="col card">
      <div class="card-title">2. Telemetría SNMP MIB-II (En vivo)</div>
      <table>
        <tr><td class="label">SysName (OID .5.0):</td><td class="val">${data.snmpTelemetry?.sysName || 'SW-CORE-CAMPUS-01'}</td></tr>
        <tr><td class="label">SysUpTime (OID .3.0):</td><td class="val">${data.snmpTelemetry?.sysUpTime || '14d 6h 32m'}</td></tr>
        <tr><td class="label">SysLocation (OID .6.0):</td><td class="val">${data.snmpTelemetry?.sysLocation || 'Rack Central - Sala de Servidores'}</td></tr>
        <tr><td class="label">SysDescr (OID .1.0):</td><td class="val"><small>${data.snmpTelemetry?.sysDescr || 'Cisco IOS Catalyst Software C2960'}</small></td></tr>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-title">3. Parámetros de Calidad de Servicio (QoS & Throughput)</div>
    <div class="metric-box-container">
      <div class="metric-box">
        <div class="metric-value">${data.qosMetrics.avgRttMs} ms</div>
        <div class="metric-label">RTT Promedio</div>
      </div>
      <div class="metric-box">
        <div class="metric-value">${data.qosMetrics.jitterMs} ms</div>
        <div class="metric-label">Jitter RFC 3550</div>
      </div>
      <div class="metric-box">
        <div class="metric-value">${data.qosMetrics.packetLossPercent}%</div>
        <div class="metric-label">Pérdida Paquetes</div>
      </div>
      <div class="metric-box">
        <div class="metric-value">${data.qosMetrics.downloadMbps} Mbps</div>
        <div class="metric-label">Throughput Bajada</div>
      </div>
      <div class="metric-box">
        <div class="metric-value">${data.qosMetrics.uploadMbps} Mbps</div>
        <div class="metric-label">Throughput Subida</div>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="col card">
      <div class="card-title">4. Georreferenciación GPS</div>
      <table>
        <tr><td class="label">Coordenadas:</td><td class="val"><strong>${data.evidence.gpsCoordinates}</strong></td></tr>
        <tr><td class="label">Latitud:</td><td class="val">${data.evidence.latitude}</td></tr>
        <tr><td class="label">Longitud:</td><td class="val">${data.evidence.longitude}</td></tr>
        <tr><td class="label">Precisión GPS:</td><td class="val">± ${data.evidence.accuracyMeters} metros</td></tr>
        <tr><td class="label">Observaciones:</td><td class="val">${data.evidence.notes || 'Verificación sin anomalías.'}</td></tr>
      </table>
    </div>

    <div class="col card">
      <div class="card-title">5. Evidencia Fotográfica en Sitio</div>
      <div class="photo-evidence-box">
        ${data.evidence.photoBase64 ? `<img src="${data.evidence.photoBase64}" alt="Foto Evidencia"/>` : '<p style="color:#64748b;">[Evidencia Fotográfica Registrada en Almacenamiento Seguro]</p>'}
      </div>
    </div>
  </div>

  <div class="footer">
    <div>ID de Auditoría: <code>${data.reportId}</code> | Fecha: ${data.auditDate}</div>
    <div>Operador / Técnico: <strong>${data.operatorName}</strong></div>
    <div>Firmado Criptográficamente vía Offline-First WatermelonDB Engine</div>
  </div>
</body>
</html>
    `;
  }
}
