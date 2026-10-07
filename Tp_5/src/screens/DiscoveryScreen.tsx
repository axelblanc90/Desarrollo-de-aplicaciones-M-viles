import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import { Colors } from '../theme/colors';

export const DiscoveryScreen: React.FC = () => {
  const { discoveredDevices, isScanning, runDiscovery, selectDevice, activeDevice } = useAppStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Capa de Descubrimiento (Layer 1)</Text>
        <Text style={styles.subtitle}>
          Escaneo activo ARP en subred local /24 + Descubrimiento de servicios mDNS/Bonjour
        </Text>

        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          onPress={runDiscovery}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.scanButtonText}>INICIAR ESCANEO DE SUBRED (ARP & BONJOUR)</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>
        DISPOSITIVOS DETECTADOS EN LA RED ({discoveredDevices.length})
      </Text>

      {discoveredDevices.length === 0 && !isScanning ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No hay dispositivos escaneados aún. Presiona el botón para descubrir equipos activos en la red LAN.
          </Text>
        </View>
      ) : null}

      {discoveredDevices.map((dev) => {
        const isSelected = activeDevice?.ip === dev.ip;
        return (
          <TouchableOpacity
            key={dev.id}
            style={[styles.deviceCard, isSelected && styles.deviceCardSelected]}
            onPress={() => selectDevice(dev)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.deviceIp}>{dev.ip}</Text>
              <View style={styles.badgeRow}>
                <Text style={styles.methodBadge}>{dev.discoveryMethod}</Text>
                <Text style={[styles.statusBadge, { color: Colors.success }]}>ACTIVO</Text>
              </View>
            </View>

            <Text style={styles.deviceVendor}>{dev.vendor || 'Dispositivo de Red'}</Text>
            {dev.hostname && <Text style={styles.deviceHost}>Host: {dev.hostname}</Text>}
            {dev.mac && <Text style={styles.deviceMac}>MAC: {dev.mac}</Text>}

            <View style={styles.cardBottom}>
              <Text style={styles.pingText}>Latencia RTT: {dev.responseTimeMs || 4}ms</Text>
              <Text style={styles.selectText}>{isSelected ? '✓ SELECCIONADO' : 'Seleccionar para Auditar'}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
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
    marginBottom: 14,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  deviceCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
  },
  deviceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1E293B',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceIp: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodBadge: {
    backgroundColor: '#0F172A',
    color: Colors.textSecondary,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  deviceVendor: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  deviceHost: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  deviceMac: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 8,
  },
  pingText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  selectText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
