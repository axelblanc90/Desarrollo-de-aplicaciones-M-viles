import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import { Colors } from '../theme/colors';
import { MetricCard } from '../components/MetricCard';

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { activeDevice, pingResults, throughput, auditHistory, pendingSyncCount } = useAppStore();

  const primaryPing = pingResults[0];

  return (
    <ScrollView style={styles.container}>
      {/* Active Device Quick Overview */}
      <View style={styles.deviceBanner}>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceBadge}>{activeDevice?.type || 'EQUIPO DE RED'}</Text>
          <Text style={styles.deviceIp}>{activeDevice?.ip || '192.168.1.1'}</Text>
        </View>
        <Text style={styles.deviceModel}>{activeDevice?.model || 'Cisco Catalyst 2960-X'}</Text>
        <Text style={styles.deviceMeta}>
          S/N: {activeDevice?.serialNumber || 'FOC2134L09A'} | MAC: {activeDevice?.macAddress || '00:1A:2B:3C:4D:5E'}
        </Text>
      </View>

      {/* QoS Telemetry Grid */}
      <Text style={styles.sectionHeader}>MÉTRICAS QOS EN TIEMPO REAL</Text>
      <View style={styles.kpiRow}>
        <MetricCard
          label="RTT Latencia"
          value={primaryPing ? primaryPing.avgRttMs : 18.2}
          unit="ms"
          status="good"
          subtitle={primaryPing ? `Jitter: ${primaryPing.jitterMs}ms` : 'Jitter: 2.4ms'}
        />
        <MetricCard
          label="Throughput DL"
          value={throughput ? throughput.downloadMbps : 84.5}
          unit="Mbps"
          status="good"
          subtitle="Capacidad de bajada"
        />
      </View>

      <View style={styles.kpiRow}>
        <MetricCard
          label="Throughput UL"
          value={throughput ? throughput.uploadMbps : 28.2}
          unit="Mbps"
          status="good"
          subtitle="Capacidad de subida"
        />
        <MetricCard
          label="Pérdida Paquetes"
          value={primaryPing ? primaryPing.packetLossPercentage : 0}
          unit="%"
          status="good"
          subtitle="Sockets TCP/UDP"
        />
      </View>

      {/* Quick Action Buttons */}
      <Text style={styles.sectionHeader}>FLUJO OPERATIVO DE CAMPO</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('discovery')}>
          <Text style={styles.actionTitle}>1. Escanear Red</Text>
          <Text style={styles.actionDesc}>ARP Subred & Bonjour mDNS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('evidence')}>
          <Text style={styles.actionTitle}>2. Identificar QR & GPS</Text>
          <Text style={styles.actionDesc}>Foto técnica georreferenciada</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('diagnostic')}>
          <Text style={styles.actionTitle}>3. SNMP & SSH</Text>
          <Text style={styles.actionDesc}>Telemetría de SO y comandos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('qos')}>
          <Text style={styles.actionTitle}>4. Test QoS & Mapa</Text>
          <Text style={styles.actionDesc}>RTT, Jitter, Throughput</Text>
        </TouchableOpacity>
      </View>

      {/* Status Footer */}
      <View style={styles.historyCard}>
        <Text style={styles.historyText}>
          {auditHistory.length} auditorías guardadas localmente en WatermelonDB
        </Text>
        {pendingSyncCount > 0 ? (
          <Text style={[styles.historyText, { color: Colors.warning }]}>
            {pendingSyncCount} paquetes encolados para sincronización diferida
          </Text>
        ) : (
          <Text style={[styles.historyText, { color: Colors.success }]}>
            Base local completamente sincronizada
          </Text>
        )}
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
  deviceBanner: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceBadge: {
    backgroundColor: Colors.primaryGlow,
    color: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  deviceIp: {
    color: Colors.accent,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  deviceModel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceMeta: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
    padding: 14,
    width: '48%',
  },
  actionTitle: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  actionDesc: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 30,
  },
  historyText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
});
