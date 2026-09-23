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
import { StatusBadge } from '../components/StatusBadge';
import { MoistureChart } from '../components/MoistureChart';
import { ValveControlModal } from '../components/ValveControlModal';
import { ThresholdModal } from '../components/ThresholdModal';
import { useAgro } from '../context/AgroContext';
import { useAuth } from '../context/AuthContext';
import { PlotWithTelemetry } from '../types/agropulse.types';
import { colors } from '../theme/colors';

interface PlotDetailScreenProps {
  plot: PlotWithTelemetry;
  onBack: () => void;
  onOpenManualReading: (plot: PlotWithTelemetry) => void;
}

export const PlotDetailScreen: React.FC<PlotDetailScreenProps> = ({
  plot,
  onBack,
  onOpenManualReading,
}) => {
  const { user } = useAuth();
  const { plots, historicalReadings, commands, isLoading, refreshData } = useAgro();

  const [valveModalOpen, setValveModalOpen] = useState<boolean>(false);
  const [thresholdModalOpen, setThresholdModalOpen] = useState<boolean>(false);

  // Keep plot reference synced with AgroContext
  const currentPlot = plots.find((p) => p.id === plot.id) || plot;
  const primaryStation = currentPlot.stations[0];
  const stationHistory = primaryStation ? historicalReadings[primaryStation.id] || [] : [];
  const latestReading = currentPlot.latestReading;

  const isAdvisor = user?.role === 'advisor';

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Sin lecturas';
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `hace ${diffSec} s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} min`;
    return `hace ${Math.floor(diffMin / 60)} h`;
  };

  const isStale = currentPlot.status === 'stale';
  const isDry = currentPlot.status === 'dry';

  // Audit history for this plot (RF-18)
  const plotCommands = commands
    .filter((c) => currentPlot.valves.some((v) => v.id === c.valve_id))
    .slice(0, 20);

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{currentPlot.name}</Text>
        <TouchableOpacity
          style={styles.manualBtn}
          onPress={() => onOpenManualReading(currentPlot)}
        >
          <MaterialCommunityIcons name="clipboard-plus-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[colors.primary]} />
        }
      >
        {/* Plot Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>{currentPlot.name}</Text>
              <Text style={styles.cropSub}>
                Cultivo: {currentPlot.crop} • {primaryStation?.name || 'Estación A'}
              </Text>
            </View>
            <StatusBadge status={currentPlot.status} size="large" />
          </View>

          {/* Agronomic recommendation banner (RF-22) */}
          {isDry && (
            <View style={styles.adviceBanner}>
              <MaterialCommunityIcons name="water-alert" size={20} color="#B91C1C" />
              <Text style={styles.adviceText}>
                Humedad bajo umbral mínimo ({latestReading?.moisture_pct}% &lt; {currentPlot.threshold_min}%): considerar riego inmediato.
              </Text>
            </View>
          )}

          {isStale && (
            <View style={styles.staleBanner}>
              <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#78350F" />
              <Text style={styles.staleText}>
                Sin telemetría reciente (&gt; 15 min). La estación puede estar desconectada.
              </Text>
            </View>
          )}

          {/* Main Telemetry Indicators */}
          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryBox}>
              <Text style={styles.telemetryLabel}>Humedad Volumétrica</Text>
              <Text style={styles.telemetryValue}>
                {latestReading ? `${latestReading.moisture_pct}%` : '--'}
              </Text>
              <Text style={styles.telemetryAge}>
                {getRelativeTime(latestReading?.measured_at)}
              </Text>
            </View>

            <View style={styles.telemetryBox}>
              <Text style={styles.telemetryLabel}>Temperatura Suelo</Text>
              <Text style={styles.telemetryValue}>
                {latestReading ? `${latestReading.temp_c}°C` : '--'}
              </Text>
              <Text style={styles.telemetryAge}>Sensor In Situ</Text>
            </View>

            <View style={styles.telemetryBox}>
              <Text style={styles.telemetryLabel}>Precipitación</Text>
              <Text style={styles.telemetryValue}>
                {latestReading?.rain_mm ? `${latestReading.rain_mm} mm` : '0 mm'}
              </Text>
              <Text style={styles.telemetryAge}>Acumulada</Text>
            </View>
          </View>
        </View>

        {/* 6-Hour Moisture Chart (RF-10) */}
        <MoistureChart
          readings={stationHistory}
          thresholdMin={currentPlot.threshold_min}
          thresholdMax={currentPlot.threshold_max}
        />

        {/* Threshold Configuration Card (RF-11) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="tune-variant" size={20} color={colors.primary} />
              <Text style={styles.sectionCardTitle}>Umbrales de Decisión de Riego</Text>
            </View>
            {!isAdvisor && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setThresholdModalOpen(true)}
              >
                <Text style={styles.editBtnText}>Configurar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.thresholdRow}>
            <View style={styles.thresholdItem}>
              <Text style={styles.thresholdLabel}>Umbral Mínimo (Seco)</Text>
              <Text style={[styles.thresholdVal, { color: colors.statusDry }]}>
                {currentPlot.threshold_min}%
              </Text>
              <Text style={styles.thresholdHint}>Dispara semáforo rojo</Text>
            </View>

            <View style={styles.thresholdItem}>
              <Text style={styles.thresholdLabel}>Umbral Máximo (Húmedo)</Text>
              <Text style={[styles.thresholdVal, { color: colors.statusWet }]}>
                {currentPlot.threshold_max}%
              </Text>
              <Text style={styles.thresholdHint}>Dispara semáforo azul</Text>
            </View>
          </View>
        </View>

        {/* Valves & Irrigation CTA Card (RF-13, RF-14) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="valve" size={20} color={colors.primary} />
              <Text style={styles.sectionCardTitle}>Actuadores y Válvulas ({currentPlot.valves.length})</Text>
            </View>
          </View>

          {currentPlot.valves.map((valve) => {
            const isOpen = valve.status === 'open';
            return (
              <View key={valve.id} style={styles.valveCard}>
                <View style={styles.valveCardLeft}>
                  <MaterialCommunityIcons
                    name={isOpen ? 'valve-open' : 'valve-closed'}
                    size={26}
                    color={isOpen ? colors.statusOptimal : colors.textMuted}
                  />
                  <View>
                    <Text style={styles.valveName}>{valve.name}</Text>
                    <Text
                      style={[
                        styles.valveStatusText,
                        { color: isOpen ? colors.statusOptimal : colors.textSecondary },
                      ]}
                    >
                      {isOpen ? 'ACTIVA (Regando)' : 'CERRADA'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.valveActionBtn,
                    isOpen && styles.valveActionBtnClose,
                    isAdvisor && styles.valveActionBtnDisabled,
                  ]}
                  onPress={() => setValveModalOpen(true)}
                  disabled={isAdvisor}
                >
                  <MaterialCommunityIcons
                    name={isOpen ? 'stop-circle' : 'play-circle'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.valveActionBtnText}>
                    {isAdvisor ? 'Bloqueado' : isOpen ? 'Detener' : 'Regar'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Last 20 Commands Audit Trail (RF-18) */}
        {plotCommands.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="history" size={20} color={colors.primary} />
                <Text style={styles.sectionCardTitle}>Historial de Comandos Recientes (RF-18)</Text>
              </View>
            </View>

            {plotCommands.map((cmd) => (
              <View key={cmd.id} style={styles.commandRow}>
                <View>
                  <Text style={styles.commandActionText}>
                    {cmd.action === 'open' ? 'Apertura de Válvula' : 'Cierre de Válvula'}
                    {cmd.duration_min ? ` (${cmd.duration_min} min)` : ''}
                  </Text>
                  <Text style={styles.commandSubText}>
                    {new Date(cmd.created_at).toLocaleDateString()} {new Date(cmd.created_at).toLocaleTimeString()} • UUID: {cmd.client_request_id.slice(0, 8)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        cmd.status === 'applied'
                          ? '#DCFCE7'
                          : cmd.status === 'failed'
                          ? '#FEE2E2'
                          : cmd.status === 'cancelled'
                          ? '#F3F4F6'
                          : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          cmd.status === 'applied'
                            ? '#166534'
                            : cmd.status === 'failed'
                            ? '#991B1B'
                            : cmd.status === 'cancelled'
                            ? '#374151'
                            : '#92400E',
                      },
                    ]}
                  >
                    {cmd.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Valve Control Modal */}
      <ValveControlModal
        visible={valveModalOpen}
        plot={currentPlot}
        onClose={() => setValveModalOpen(false)}
      />

      {/* Threshold Config Modal */}
      <ThresholdModal
        visible={thresholdModalOpen}
        plot={currentPlot}
        onClose={() => setThresholdModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  manualBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cropSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  adviceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  adviceText: {
    fontSize: 12,
    color: colors.accentRed,
    fontWeight: '600',
    flex: 1,
  },
  staleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  staleText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.bgApp,
    borderRadius: 12,
    padding: 12,
  },
  telemetryBox: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  telemetryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  telemetryAge: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  editBtn: {
    backgroundColor: colors.primarySubtle,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  thresholdItem: {
    flex: 1,
    backgroundColor: colors.bgApp,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  thresholdLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  thresholdVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  thresholdHint: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  valveCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgApp,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valveCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valveName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  valveStatusText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  valveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  valveActionBtnClose: {
    backgroundColor: colors.accentRed,
  },
  valveActionBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  valveActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  commandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSubtle,
  },
  commandActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  commandSubText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
