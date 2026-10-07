import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import { Colors } from '../theme/colors';
import { LiveTerminal } from '../components/LiveTerminal';

export const DiagnosticScreen: React.FC = () => {
  const { activeDevice, snmpData, isDiagnosing, runSnmpQuery, runSshCommand, sshLogs } = useAppStore();
  const [selectedCmd, setSelectedCmd] = useState('uptime');

  const commands = [
    { label: 'Uptime & Carga', cmd: 'uptime' },
    { label: 'Interfaces IP', cmd: 'show ip interface brief' },
    { label: 'Versión IOS', cmd: 'show version' },
    { label: 'Memoria RAM', cmd: 'free -m' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Capa de Protocolos (Layer 2)</Text>
        <Text style={styles.subtitle}>
          Cliente SNMP (UDP 161) con Parser ASN.1 BER propio + Consola SSH de Diagnóstico
        </Text>
        <Text style={styles.targetDevice}>
          Equipo Objetivo: <Text style={{ color: Colors.accent }}>{activeDevice?.model || 'Switch Cisco'} ({activeDevice?.ip || '192.168.1.1'})</Text>
        </Text>
      </View>

      {/* SNMP Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>CONSULTA SNMP MIB-II</Text>
          <TouchableOpacity
            style={styles.actionBtnSmall}
            onPress={() => runSnmpQuery(activeDevice?.ip)}
            disabled={isDiagnosing}
          >
            {isDiagnosing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionBtnTextSmall}>CONSULTAR SNMP</Text>
            )}
          </TouchableOpacity>
        </View>

        {snmpData ? (
          <View style={styles.snmpResultsBox}>
            <View style={styles.snmpRow}>
              <Text style={styles.snmpLabel}>sysName (OID .5.0):</Text>
              <Text style={styles.snmpVal}>{snmpData.sysName || 'SW-FIELD-CAMPUS-01'}</Text>
            </View>
            <View style={styles.snmpRow}>
              <Text style={styles.snmpLabel}>sysUpTime (OID .3.0):</Text>
              <Text style={styles.snmpVal}>{snmpData.sysUpTime || '14d 6h 32m'}</Text>
            </View>
            <View style={styles.snmpRow}>
              <Text style={styles.snmpLabel}>sysLocation (OID .6.0):</Text>
              <Text style={styles.snmpVal}>{snmpData.sysLocation || 'Rack Central Piso 2'}</Text>
            </View>
            <View style={styles.snmpRow}>
              <Text style={styles.snmpLabel}>sysDescr (OID .1.0):</Text>
              <Text style={styles.snmpValSmall}>{snmpData.sysDescr}</Text>
            </View>
            <Text style={styles.snmpFooter}>
              Decodificado mediante Parser BER propio • RTT: {snmpData.responseTimeMs}ms
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>
            Presiona "Consultar SNMP" para enviar solicitud GetRequest ASN.1 BER vía UDP al puerto 161.
          </Text>
        )}
      </View>

      {/* SSH Diagnostics Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>CLIENTE SSH EMBEBIDO (COMANDOS)</Text>
        <Text style={styles.placeholderText}>
          Ejecuta diagnósticos remotos con credenciales protegidas en Keychain:
        </Text>

        <View style={styles.cmdChipsRow}>
          {commands.map((c) => (
            <TouchableOpacity
              key={c.cmd}
              style={[styles.cmdChip, selectedCmd === c.cmd && styles.cmdChipActive]}
              onPress={() => {
                setSelectedCmd(c.cmd);
                runSshCommand(c.cmd);
              }}
            >
              <Text style={[styles.cmdChipText, selectedCmd === c.cmd && styles.cmdChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <LiveTerminal logs={sshLogs} title={`SSH admin@${activeDevice?.ip || '192.168.1.1'}`} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  headerBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  targetDevice: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  actionBtnSmall: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionBtnTextSmall: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  snmpResultsBox: {
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  snmpRow: {
    marginBottom: 8,
  },
  snmpLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  snmpVal: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  snmpValSmall: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  snmpFooter: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 6,
  },
  cmdChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  cmdChip: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cmdChipActive: {
    borderColor: Colors.accent,
    backgroundColor: '#0F2338',
  },
  cmdChipText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  cmdChipTextActive: {
    color: Colors.accent,
  },
});
