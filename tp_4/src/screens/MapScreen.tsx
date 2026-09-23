import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAgro } from '../context/AgroContext';
import { PolygonMap } from '../components/PolygonMap';
import { StatusBadge } from '../components/StatusBadge';
import { OfflineBanner } from '../components/OfflineBanner';
import { PlotWithTelemetry } from '../types/agropulse.types';
import { colors } from '../theme/colors';

interface MapScreenProps {
  onOpenPlotDetail: (plot: PlotWithTelemetry) => void;
  onOpenManualReading: (plot?: PlotWithTelemetry) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  onOpenPlotDetail,
  onOpenManualReading,
}) => {
  const { organization, user } = useAuth();
  const { plots, isLoading, refreshData, lastTickTime } = useAgro();
  const [selectedPlot, setSelectedPlot] = useState<PlotWithTelemetry | null>(null);

  const handleSelectPlot = (plot: PlotWithTelemetry) => {
    setSelectedPlot(plot);
    onOpenPlotDetail(plot);
  };

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Sin datos';
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `hace ${diffSec} s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    return `hace ${diffHours} h`;
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {/* Establishment Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.orgLabel}>Establecimiento Activo</Text>
          <View style={styles.orgRow}>
            <MaterialCommunityIcons name="domain" size={18} color={colors.primary} />
            <Text style={styles.orgName}>{organization?.name || 'Estancia Didáctica'}</Text>
          </View>
          <Text style={styles.orgRegion}>{organization?.region || 'Concordia, Entre Ríos'}</Text>
        </View>

        <TouchableOpacity
          style={styles.manualReadingBtn}
          onPress={() => onOpenManualReading(selectedPlot || plots[0])}
          accessibilityLabel="Cargar lectura manual de campo"
        >
          <MaterialCommunityIcons name="clipboard-edit-outline" size={18} color="#FFFFFF" />
          <Text style={styles.manualReadingBtnText}>Lectura Manual</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollArea}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[colors.primary]} />
        }
      >
        {/* Interactive Map with GPS Geofencing */}
        <PolygonMap
          plots={plots}
          selectedPlotId={selectedPlot?.id}
          onSelectPlot={handleSelectPlot}
        />

        {/* Plots Summary Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lotes Monitoreados ({plots.length})</Text>
          {lastTickTime && (
            <Text style={styles.lastTickText}>
              Último tick: {new Date(lastTickTime).toLocaleTimeString()}
            </Text>
          )}
        </View>

        {plots.map((plot) => {
          const reading = plot.latestReading;
          const openValvesCount = plot.valves.filter((v) => v.status === 'open').length;

          return (
            <TouchableOpacity
              key={plot.id}
              style={styles.plotCard}
              onPress={() => handleSelectPlot(plot)}
            >
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.plotName}>{plot.name}</Text>
                  <Text style={styles.plotCrop}>Cultivo: {plot.crop}</Text>
                </View>
                <StatusBadge status={plot.status} />
              </View>

              <View style={styles.cardMetrics}>
                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="water-percent" size={20} color={colors.primaryLight} />
                  <View>
                    <Text style={styles.metricLabel}>Humedad</Text>
                    <Text style={styles.metricValue}>
                      {reading ? `${reading.moisture_pct}%` : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="thermometer" size={20} color="#C2410C" />
                  <View>
                    <Text style={styles.metricLabel}>Temperatura</Text>
                    <Text style={styles.metricValue}>
                      {reading ? `${reading.temp_c}°C` : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricItem}>
                  <MaterialCommunityIcons
                    name="sprinkler-variant"
                    size={20}
                    color={openValvesCount > 0 ? colors.primary : colors.textSecondary}
                  />
                  <View>
                    <Text style={styles.metricLabel}>Válvulas</Text>
                    <Text style={styles.metricValue}>
                      {openValvesCount > 0 ? `${openValvesCount} Abierta` : 'Cerradas'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.readingAge}>
                  Telemetría: {getRelativeTime(reading?.measured_at)}
                </Text>
                <View style={styles.openDetailCta}>
                  <Text style={styles.openDetailText}>Ver Detalle y Válvulas</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orgLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orgRegion: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  manualReadingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  manualReadingBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lastTickText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  plotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plotName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  plotCrop: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.bgApp,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  readingAge: {
    fontSize: 11,
    color: colors.textMuted,
  },
  openDetailCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
