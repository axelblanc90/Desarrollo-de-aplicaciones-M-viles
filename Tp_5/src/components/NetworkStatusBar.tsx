import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import { Colors } from '../theme/colors';

export const NetworkStatusBar: React.FC = () => {
  const { isConnected, networkType, ipAddress, pendingSyncCount, isSyncing, toggleNetworkSimulation } =
    useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? Colors.success : Colors.danger }]} />
        <View>
          <Text style={styles.statusTitle}>
            {isConnected ? `CONECTADO (${networkType.toUpperCase()})` : 'MODO OFFLINE'}
          </Text>
          <Text style={styles.statusSubtitle}>IP: {ipAddress}</Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        {pendingSyncCount > 0 && (
          <View style={styles.queueBadge}>
            <Text style={styles.queueText}>
              {isSyncing ? 'Sincronizando...' : `${pendingSyncCount} en cola`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.simButton, { backgroundColor: isConnected ? '#334155' : Colors.primary }]}
          onPress={toggleNetworkSimulation}
        >
          <Text style={styles.simButtonText}>
            {isConnected ? 'Simular Offline' : 'Restaurar Red'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  queueBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  queueText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  simButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  simButtonText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});
