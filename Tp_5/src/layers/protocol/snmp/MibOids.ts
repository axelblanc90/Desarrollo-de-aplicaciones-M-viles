/**
 * RFC 1213 / RFC 2863 MIB-II Standard Object Identifiers (OIDs)
 */
export const MibOids = {
  // System Group (1.3.6.1.2.1.1)
  sysDescr: '1.3.6.1.2.1.1.1.0',     // Descripción del hardware / SO
  sysObjectID: '1.3.6.1.2.1.1.2.0',  // OID del fabricante
  sysUpTime: '1.3.6.1.2.1.1.3.0',    // Tiempo activo en timeticks (1/100 seg)
  sysContact: '1.3.6.1.2.1.1.4.0',   // Administrador responsable
  sysName: '1.3.6.1.2.1.1.5.0',      // Hostname del equipo de red
  sysLocation: '1.3.6.1.2.1.1.6.0',  // Ubicación física (rack, sala)

  // Interfaces Group (1.3.6.1.2.1.2)
  ifNumber: '1.3.6.1.2.1.2.1.0',     // Cantidad de interfaces
  ifDescr: '1.3.6.1.2.1.2.2.1.2',    // Descripción / Nombre de interfaz (ej. GigabitEthernet0/1)
  ifType: '1.3.6.1.2.1.2.2.1.3',     // Tipo (ethernetCsmacd = 6)
  ifOperStatus: '1.3.6.1.2.1.2.2.1.8',// Estado operativo (1: up, 2: down)
  ifInOctets: '1.3.6.1.2.1.2.2.1.10', // Tráfico entrante en bytes/octetos
  ifOutOctets: '1.3.6.1.2.1.2.2.1.16' // Tráfico saliente en bytes/octetos
};
