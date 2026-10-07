export interface SnmpVarBind {
  oid: string;
  type: string;
  value: string | number;
}

export interface SnmpQueryResponse {
  sysDescr?: string;
  sysUpTime?: string;
  sysName?: string;
  sysContact?: string;
  sysLocation?: string;
  interfaces?: Array<{
    index: number;
    description: string;
    inOctets: number;
    outOctets: number;
    status: 'up' | 'down';
  }>;
  rawVarbinds: SnmpVarBind[];
  responseTimeMs: number;
}
