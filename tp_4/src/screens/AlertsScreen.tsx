import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAgro } from '../context/AgroContext';
import { Alert as AlertItem } from '../types/agropulse.types';
import { colors } from '../theme/colors';

export const AlertsScreen: React.FC = () => {
  const { alerts, plots, markAlertAsRead, refreshData, isLoading } = useAgro();

  const getPlotName = (plotId: string) => {
    const p = plots.find((item) => item.id === plotId);
    return p ? `${p.name} (${p.crop})` : 'Lote Desconocido';
  };

  const getRelativeTime = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `hace ${diffSec} s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} min`;
    return `hace ${Math.floor(diffMin / 60)} h`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Centro de Notificaciones y Alertas</Text>
            <Text style={styles.headerSub}>
              Monitoreo in-app de caídas de sensores (&gt;15 min) y déficit hídrico (RF-19, RF-20).
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-check-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin alertas activas</Text>
            <Text style={styles.emptySub}>
              Todos los lotes presentan telemetría periódica normal y parámetros dentro de los umbrales.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isRead = Boolean(item.read_at);
          const isDry = item.type === 'dry';
          const isStale = item.type === 'stale';
          const badgeColor = isDry ? colors.statusDry : isStale ? colors.accentAmber : colors.accentBlue;

          return (
            <View style={[styles.alertCard, isRead && styles.alertCardRead]}>
              <View style={styles.alertHeader}>
                <View style={styles.typeBadge}>
                  <MaterialCommunityIcons
                    name={
                      isDry
                        ? 'water-alert'
                        : isStale
                        ? 'timer-off-outline'
                        : 'alert-circle-outline'
                    }
                    size={16}
                    color={badgeColor}
                  />
                  <Text
                    style={[
                      styles.typeBadgeText,
                      { color: badgeColor },
                    ]}
                  >
                    {isDry ? 'Déficit Hídrico (Seco)' : isStale ? 'Sensor Caído (Stale)' : 'Sistema'}
                  </Text>
                </View>
                <Text style={styles.timeText}>{getRelativeTime(item.created_at)}</Text>
              </View>

              <Text style={styles.plotTarget}>{getPlotName(item.plot_id)}</Text>
              <Text style={styles.messageText}>{item.payload.message}</Text>

              {!isRead && (
                <TouchableOpacity
                  style={styles.markReadBtn}
                  onPress={() => markAlertAsRead(item.id)}
                >
                  <MaterialCommunityIcons name="check" size={14} color={colors.textSecondary} />
                  <Text style={styles.markReadText}>Marcar como leída</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  alertCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  alertCardRead: {
    opacity: 0.65,
    backgroundColor: colors.bgApp,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  plotTarget: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.bgSubtle,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  markReadText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});
