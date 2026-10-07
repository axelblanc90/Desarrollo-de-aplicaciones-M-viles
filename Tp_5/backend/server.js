const express = require('express');
const cors = require('cors');
const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const SNMP_PORT = process.env.SNMP_PORT || 161;
const SNMP_FALLBACK_PORT = 1161;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// In-memory audit persistence for demonstration
const syncStore = {
  audits: [],
  measurements: [],
  devices: []
};

// -------------------------------------------------------------
// HTTP QoS & Sync API Endpoints
// -------------------------------------------------------------

// 1. Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Network QoS & Audit Reference Server',
    version: '1.0.0',
    ports: {
      http: HTTP_PORT,
      snmp: SNMP_PORT
    }
  });
});

// 2. Download Throughput Test Endpoint
// Sends exact byte chunks to allow client to calculate accurate download Mbps
app.get('/download', (req, res) => {
  const sizeBytes = parseInt(req.query.size, 10) || (2 * 1024 * 1024); // Default 2MB
  const clampedSize = Math.min(Math.max(sizeBytes, 64 * 1024), 20 * 1024 * 1024); // 64KB to 20MB

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', clampedSize);
  res.setHeader('X-Payload-Bytes', clampedSize);
  res.setHeader('X-Start-Timestamp', Date.now());

  // High performance buffer chunk streaming
  const chunkSize = 64 * 1024;
  const chunk = Buffer.alloc(chunkSize, 'A');
  let bytesWritten = 0;

  function writeChunks() {
    let ok = true;
    while (bytesWritten < clampedSize && ok) {
      const remaining = clampedSize - bytesWritten;
      const currentChunkSize = Math.min(chunkSize, remaining);
      const toSend = currentChunkSize === chunkSize ? chunk : chunk.subarray(0, currentChunkSize);
      bytesWritten += currentChunkSize;
      ok = res.write(toSend);
    }
    if (bytesWritten < clampedSize) {
      res.once('drain', writeChunks);
    } else {
      res.end();
    }
  }

  writeChunks();
});

// 3. Upload Throughput Test Endpoint
app.post('/upload', (req, res) => {
  const startTime = Date.now();
  let receivedBytes = 0;

  req.on('data', (chunk) => {
    receivedBytes += chunk.length;
  });

  req.on('end', () => {
    const elapsedMs = Math.max(Date.now() - startTime, 1);
    const mbps = ((receivedBytes * 8) / (elapsedMs / 1000)) / (1024 * 1024);
    res.json({
      receivedBytes,
      elapsedMs,
      serverCalculatedMbps: parseFloat(mbps.toFixed(2)),
      timestamp: new Date().toISOString()
    });
  });
});

// 4. Offline-First Sync Ingestion Endpoint
// Receives batched records enqueued in WatermelonDB
app.post('/api/sync', (req, res) => {
  const { batchId, devices = [], measurements = [], evidence = [] } = req.body;

  console.log(`[SYNC] Ingesting batch ${batchId || 'N/A'}: ${devices.length} devices, ${measurements.length} measurements, ${evidence.length} evidence records.`);

  devices.forEach(d => syncStore.devices.push({ ...d, syncedAt: new Date().toISOString() }));
  measurements.forEach(m => syncStore.measurements.push({ ...m, syncedAt: new Date().toISOString() }));
  evidence.forEach(e => syncStore.audits.push({ ...e, syncedAt: new Date().toISOString() }));

  res.status(200).json({
    success: true,
    batchId,
    received: {
      devicesCount: devices.length,
      measurementsCount: measurements.length,
      evidenceCount: evidence.length
    },
    message: 'Data successfully synchronized and stored on server.'
  });
});

// 5. Query Synced Reports
app.get('/api/reports', (req, res) => {
  res.json(syncStore);
});

// -------------------------------------------------------------
// Embedded SNMP UDP Agent Simulator
// Responds to SNMP v1/v2c GET queries with ASN.1 BER payloads
// -------------------------------------------------------------

function startSnmpServer(port) {
  const socket = dgram.createSocket('udp4');

  socket.on('error', (err) => {
    console.warn(`[SNMP AGENT] Warning on port ${port}: ${err.message}`);
    socket.close();
    if (port === SNMP_PORT) {
      console.log(`[SNMP AGENT] Reintentando en puerto alternativo ${SNMP_FALLBACK_PORT}...`);
      startSnmpServer(SNMP_FALLBACK_PORT);
    }
  });

  socket.on('message', (msg, rinfo) => {
    console.log(`[SNMP AGENT] Datagrama recibido (${msg.length} bytes) de ${rinfo.address}:${rinfo.port}`);

    // Create a mock SNMP response packet (ASN.1 BER encoded)
    // Responding with sysDescr, sysUpTime and sysName
    try {
      const response = buildSnmpResponse(msg);
      socket.send(response, 0, response.length, rinfo.port, rinfo.address, (sendErr) => {
        if (sendErr) {
          console.error('[SNMP AGENT] Error al enviar respuesta:', sendErr);
        } else {
          console.log(`[SNMP AGENT] Respuesta SNMP enviada con éxito a ${rinfo.address}:${rinfo.port}`);
        }
      });
    } catch (parseErr) {
      console.warn('[SNMP AGENT] No se pudo parsear el paquete SNMP:', parseErr.message);
    }
  });

  socket.on('listening', () => {
    const addr = socket.address();
    console.log(`[SNMP AGENT] Agente SNMP activo escuchando en UDP ${addr.address}:${addr.port}`);
  });

  try {
    socket.bind(port);
  } catch (bindErr) {
    if (port === SNMP_PORT) {
      startSnmpServer(SNMP_FALLBACK_PORT);
    }
  }
}

// Simple ASN.1 BER serializer helper for mock SNMP response
function buildSnmpResponse(requestBuffer) {
  // Extract Request ID if available (typically around byte index 8-15)
  let requestId = 1001;
  if (requestBuffer.length > 15) {
    requestId = requestBuffer.readInt32BE(Math.min(13, requestBuffer.length - 4));
  }

  // Pre-built standard SNMPv2c GetResponse containing sysDescr & sysUpTime
  // 1.3.6.1.2.1.1.1.0 -> Cisco Catalyst 2960 Switch IOS 15.0(2)
  // 1.3.6.1.2.1.1.3.0 -> Timeticks 842100 (9.7 días uptime)
  // 1.3.6.1.2.1.1.5.0 -> SW-CORE-PISO-3
  const sysDescr = "Cisco Catalyst 2960-X Switch - IOS 15.2(4)E7 - Field Audit Node";
  const sysName = "SW-FIELD-CAMPUS-01";
  const uptimeSeconds = Math.floor(process.uptime() + 3600);

  // Return a synthetic valid SNMP v2c packet buffer
  const payload = Buffer.concat([
    Buffer.from([0x30, 0x82]), // SEQUENCE header
    Buffer.from([0x00, 0x60]), // Length placeholder
    Buffer.from([0x02, 0x01, 0x01]), // SNMP version: v2c (1)
    Buffer.from([0x04, 0x06, 0x70, 0x75, 0x62, 0x6c, 0x69, 0x63]), // Community: "public"
    Buffer.from([0xa2]), // GetResponse PDU
    Buffer.from([0x50]), // PDU length
    Buffer.from([0x02, 0x04]), // Request ID tag + length
    Buffer.alloc(4), // Request ID value
    Buffer.from([0x02, 0x01, 0x00]), // error-status: 0 (noError)
    Buffer.from([0x02, 0x01, 0x00]), // error-index: 0
    Buffer.from([0x30, 0x40]), // Varbind list SEQUENCE
    // Varbind 1: sysName
    Buffer.from([0x30, 0x1e, 0x06, 0x08, 0x2b, 0x06, 0x01, 0x02, 0x01, 0x01, 0x05, 0x00]), // OID 1.3.6.1.2.1.1.5.0
    Buffer.from([0x04, sysName.length]), Buffer.from(sysName),
    // Varbind 2: sysDescr
    Buffer.from([0x30, 0x20, 0x06, 0x08, 0x2b, 0x06, 0x01, 0x02, 0x01, 0x01, 0x01, 0x00]), // OID 1.3.6.1.2.1.1.1.0
    Buffer.from([0x04, Math.min(sysDescr.length, 20)]), Buffer.from(sysDescr.substring(0, 20))
  ]);

  return payload;
}

// Start HTTP Server
app.listen(HTTP_PORT, () => {
  console.log(`[HTTP QoS SERVER] Servidor escuchando en http://0.0.0.0:${HTTP_PORT}`);
  console.log(`  - Throughput Download: http://localhost:${HTTP_PORT}/download?size=2097152`);
  console.log(`  - Throughput Upload:   http://localhost:${HTTP_PORT}/upload`);
  console.log(`  - Offline Sync:        http://localhost:${HTTP_PORT}/api/sync`);
  console.log(`  - Health:              http://localhost:${HTTP_PORT}/health`);
});

// Start UDP SNMP Server
startSnmpServer(SNMP_PORT);
