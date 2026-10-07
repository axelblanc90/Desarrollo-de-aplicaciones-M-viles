import { create } from 'zustand';
import { discoveryLayer } from '../layers/discovery';
import { protocolLayer } from '../layers/protocol';
import { evidenceLayer } from '../layers/evidence';
import { storageLayer } from '../layers/storage';
import { syncLayer } from '../layers/sync';
import { reportingLayer, FieldAuditReportData } from '../layers/reporting';

export interface AppState {
  // Network & Sync status
  isConnected: boolean;
  networkType: string;
  ipAddress: string;
  ssid: string;
  pendingSyncCount: number;
  isSyncing: boolean;

  // Active Audit Data
  activeDevice: any | null;
  discoveredDevices: any[];
  isScanning: boolean;
  scanProgress: number;

  // Diagnostics
  snmpData: any | null;
  sshLogs: string[];
  isDiagnosing: boolean;

  // QoS
  pingResults: any[];
  throughput: any | null;
  isTestingQos: boolean;

  // Evidence
  currentEvidence: any | null;
  capturedPhotosCount: number;

  // History & Reports
  auditHistory: any[];
  latestPdfResult: any | null;

  // Actions
  toggleNetworkSimulation: () => void;
  runDiscovery: () => Promise<void>;
  scanDeviceQr: (sampleType?: 'CISCO_SWITCH' | 'MIKROTIK_ROUTER' | 'UBIQUITI_AP') => Promise<void>;
  runSnmpQuery: (host?: string) => Promise<void>;
  runSshCommand: (command: string) => Promise<void>;
  runQoSTest: (backendUrl?: string) => Promise<void>;
  captureFieldEvidence: (notes?: string) => Promise<void>;
  saveAuditRecord: () => Promise<void>;
  generatePdf: () => Promise<any>;
  triggerManualSync: () => Promise<void>;
  selectDevice: (device: any) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  // Setup real-time listeners for network and sync layers
  syncLayer.monitor.subscribe((state) => {
    set({
      isConnected: state.isConnected,
      networkType: state.connectionType,
      ipAddress: state.details.ipAddress || '192.168.1.105',
      ssid: state.details.ssid || 'WiFi-LAN',
    });
  });

  syncLayer.engine.onSyncStatusChange((isSyncing, pendingCount) => {
    set({ isSyncing, pendingSyncCount: pendingCount });
  });

  return {
    isConnected: true,
    networkType: 'wifi',
    ipAddress: '192.168.1.105',
    ssid: 'FCyT-LabRedes-5G',
    pendingSyncCount: 0,
    isSyncing: false,

    activeDevice: {
      type: 'SWITCH',
      model: 'Catalyst 2960-X 24P',
      vendor: 'Cisco Systems',
      serialNumber: 'FOC2134L09A',
      macAddress: '00:1A:2B:3C:4D:5E',
      ip: '192.168.1.1',
    },
    discoveredDevices: [],
    isScanning: false,
    scanProgress: 0,

    snmpData: null,
    sshLogs: [
      '[SYSTEM INITIALIZED] SshDiagnosticClient listo para conexión segura.',
      '[AUTH] Credenciales resueltas desde Keychain Vault.',
    ],
    isDiagnosing: false,

    pingResults: [],
    throughput: null,
    isTestingQos: false,

    currentEvidence: null,
    capturedPhotosCount: 0,

    auditHistory: [],
    latestPdfResult: null,

    toggleNetworkSimulation: () => {
      const next = !get().isConnected;
      syncLayer.monitor.setSimulatedConnectivity(next);
    },

    runDiscovery: async () => {
      set({ isScanning: true, scanProgress: 0 });
      try {
        const devices = await discoveryLayer.performFullSubnetDiscovery();
        set({ discoveredDevices: devices, isScanning: false, scanProgress: 100 });
      } catch {
        set({ isScanning: false });
      }
    },

    selectDevice: (device: any) => {
      set({ activeDevice: device });
    },

    scanDeviceQr: async (sampleType = 'CISCO_SWITCH') => {
      const qrRaw = evidenceLayer.qr.generateSampleQr(sampleType);
      const parsed = evidenceLayer.qr.parseEquipmentCode(qrRaw);
      set({ activeDevice: parsed });
    },

    runSnmpQuery: async (host?: string) => {
      const targetIp = host || get().activeDevice?.ip || '192.168.1.1';
      set({ isDiagnosing: true });
      try {
        const data = await protocolLayer.snmp.querySystemInfo(targetIp);
        set({ snmpData: data, isDiagnosing: false });
      } catch {
        set({ isDiagnosing: false });
      }
    },

    runSshCommand: async (cmd: string) => {
      const host = get().activeDevice?.ip || '192.168.1.1';
      const prevLogs = get().sshLogs;
      set({ sshLogs: [...prevLogs, `> ${cmd}`] });

      await protocolLayer.ssh.connect({
        host,
        port: 22,
        username: 'admin',
      });

      const res = await protocolLayer.ssh.executeCommand(cmd);
      set({
        sshLogs: [...get().sshLogs, res.output, `[Comando completado en ${res.executionTimeMs}ms]`],
      });
    },

    runQoSTest: async (backendUrl?: string) => {
      set({ isTestingQos: true });
      try {
        const [pings, tp] = await Promise.all([
          protocolLayer.latency.probeMultipleHosts(['1.1.1.1', '8.8.8.8', '192.168.1.1']),
          protocolLayer.throughput.runFullThroughputTest(backendUrl),
        ]);
        set({ pingResults: pings, throughput: tp, isTestingQos: false });
      } catch {
        set({ isTestingQos: false });
      }
    },

    captureFieldEvidence: async (notes?: string) => {
      const device = get().activeDevice;
      const rawCode = device?.rawCode || `TYPE:${device?.type || 'SWITCH'};SN:${device?.serialNumber || 'SN101'};MAC:${device?.macAddress || '00:1A:2B:3C:4D:5E'};IP:${device?.ip || '192.168.1.1'}`;
      const ev = await evidenceLayer.buildFieldEvidence(rawCode, notes);
      set({
        currentEvidence: ev,
        capturedPhotosCount: get().capturedPhotosCount + 1,
      });
    },

    saveAuditRecord: async () => {
      const { activeDevice, currentEvidence, pingResults, throughput, snmpData } = get();

      const record = {
        id: `audit_${Date.now()}`,
        device: activeDevice,
        evidence: currentEvidence,
        qos: {
          pings: pingResults,
          throughput,
        },
        snmp: snmpData,
        createdAt: new Date().toISOString(),
      };

      // 1. Save in local WatermelonDB
      await storageLayer.db.saveEvidence(record);

      // 2. Enqueue for offline sync
      await syncLayer.engine.enqueueForSync('EVIDENCE', record.id, record);

      set({
        auditHistory: [record, ...get().auditHistory],
      });
    },

    generatePdf: async () => {
      const { activeDevice, currentEvidence, pingResults, throughput, snmpData } = get();

      const avgPing = pingResults[0]?.avgRttMs || 18.4;
      const jitter = pingResults[0]?.jitterMs || 3.2;
      const loss = pingResults[0]?.packetLossPercentage || 0;

      const reportData: FieldAuditReportData = {
        reportId: `AUD-${Date.now().toString().slice(-6)}`,
        auditDate: new Date().toLocaleString(),
        operatorName: 'Ing. Telecomunicaciones / Alumno FCyT',
        device: {
          type: activeDevice?.type || 'ROUTER / SWITCH',
          model: activeDevice?.model || 'Catalyst 2960-X',
          vendor: activeDevice?.vendor || 'Cisco Systems',
          serialNumber: activeDevice?.serialNumber || 'FOC2134L09A',
          macAddress: activeDevice?.macAddress || '00:1A:2B:3C:4D:5E',
          ipAddress: activeDevice?.ip || '192.168.1.1',
          hostname: activeDevice?.hostname || 'sw-core-01.lan',
        },
        snmpTelemetry: {
          sysDescr: snmpData?.sysDescr || 'Cisco IOS Software C2960',
          sysUpTime: snmpData?.sysUpTime || '14d 6h 32m',
          sysName: snmpData?.sysName || 'SW-FIELD-CAMPUS-01',
          sysLocation: snmpData?.sysLocation || 'Rack Central Sala de Telecomunicaciones',
        },
        qosMetrics: {
          minRttMs: pingResults[0]?.minRttMs || 14.1,
          avgRttMs: avgPing,
          maxRttMs: pingResults[0]?.maxRttMs || 25.8,
          jitterMs: jitter,
          packetLossPercent: loss,
          downloadMbps: throughput?.downloadMbps || 84.5,
          uploadMbps: throughput?.uploadMbps || 28.2,
        },
        evidence: {
          photoBase64: currentEvidence?.photoBase64,
          gpsCoordinates: currentEvidence ? evidenceLayer.geo.formatCoords(currentEvidence.gps) : '-32.4806° S, -58.2327° W (±4.2m)',
          latitude: currentEvidence?.gps.latitude || -32.4806,
          longitude: currentEvidence?.gps.longitude || -58.2327,
          accuracyMeters: currentEvidence?.gps.accuracy || 4.2,
          notes: currentEvidence?.operatorNotes || 'Certificación completa de nodo y QoS realizada con éxito.',
        },
      };

      const result = await reportingLayer.pdf.generateAuditPdf(reportData);
      set({ latestPdfResult: result });
      return result;
    },

    triggerManualSync: async () => {
      await syncLayer.engine.triggerSync();
    },
  };
});
