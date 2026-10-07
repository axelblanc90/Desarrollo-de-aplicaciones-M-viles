export * from './snmp/types';
export * from './snmp/MibOids';
export * from './snmp/SnmpPduParser';
export * from './snmp/SnmpClient';

export * from './ssh/types';
export * from './ssh/SshDiagnosticClient';

export * from './qos/types';
export * from './qos/LatencyProbeService';
export * from './qos/ThroughputService';
export * from './qos/QoSAlertService';

import { SnmpClient } from './snmp/SnmpClient';
import { SshDiagnosticClient } from './ssh/SshDiagnosticClient';
import { LatencyProbeService } from './qos/LatencyProbeService';
import { ThroughputService } from './qos/ThroughputService';
import { QoSAlertService } from './qos/QoSAlertService';

export class ProtocolLayerFacade {
  readonly snmp = new SnmpClient();
  readonly ssh = new SshDiagnosticClient();
  readonly latency = new LatencyProbeService();
  readonly throughput = new ThroughputService();
  readonly alert = QoSAlertService;
}

export const protocolLayer = new ProtocolLayerFacade();
