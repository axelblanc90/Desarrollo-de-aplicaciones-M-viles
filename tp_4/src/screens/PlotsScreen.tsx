import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAgro } from '../context/AgroContext';
import { StatusBadge } from '../components/StatusBadge';
import { PlotStatus, PlotWithTelemetry } from '../types/agropulse.types';
import { colors } from '../theme/colors';

interface PlotsScreenProps {
  onOpenPlotDetail: (plot: PlotWithTelemetry) => void;
}

export const PlotsScreen: React.FC<PlotsScreenProps> = ({ onOpenPlotDetail }) => {
  const { plots, isLoading, refreshData } = useAgro();
  const [filterStatus, setFilterStatus] = useState<PlotStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPlots = plots.filter((plot) => {
    const matchesFilter = filterStatus === 'all' || plot.status === filterStatus;
    const matchesSearch =
      plot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plot.crop.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Sin datos';
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `hace ${diffSec} s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} min`;
    return `hace ${Math.floor(diffMin / 60)} h`;
  };

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar lote por nombre o cultivo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        {(
          [
            { key: 'all', label: 'Todos' },
            { key: 'dry', label: 'Secos' },
            { key: 'optimal', label: 'Óptimos' },
            { key: 'stale', label: 'Sin Datos' },
          ] as const
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, filterStatus === item.key && styles.chipSelected]}
            onPress={() => setFilterStatus(item.key)}
          >
            <Text
              style={[
                styles.chipText,
                filterStatus === item.key && styles.chipTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plots FlatList */}
      <FlatList
        data={filteredPlots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="seed-outline" size={48} color={colors.borderStrong} />
            <Text style={styles.emptyTitle}>No se encontraron lotes</Text>
            <Text style={styles.emptySubtitle}>
              Intente modificar el filtro de búsqueda o el estado del semáforo.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const reading = item.latestReading;
          const openValves = item.valves.filter((v) => v.status === 'open').length;

          return (
            <TouchableOpacity
              style={styles.plotCard}
              onPress={() => onOpenPlotDetail(item)}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.plotTitle}>{item.name}</Text>
                  <Text style={styles.cropText}>Cultivo: {item.crop}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Humedad Suelo</Text>
                  <Text style={styles.statValue}>
                    {reading ? `${reading.moisture_pct}%` : '--'}
                  </Text>
                  <Text style={styles.statSub}>
                    Rango: {item.threshold_min}% - {item.threshold_max}%
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Temperatura</Text>
                  <Text style={styles.statValue}>
                    {reading ? `${reading.temp_c}°C` : '--'}
                  </Text>
                  <Text style={styles.statSub}>
                    Lluvia: {reading?.rain_mm ? `${reading.rain_mm} mm` : '0 mm'}
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Válvulas Riego</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: openValves > 0 ? colors.primary : colors.textPrimary },
                    ]}
                  >
                    {openValves > 0 ? `${openValves} Abierta` : 'Cerradas'}
                  </Text>
                  <Text style={styles.statSub}>Total: {item.valves.length}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerTime}>
                  Última telemetría: {getRelativeTime(reading?.measured_at)}
                </Text>
                <View style={styles.actionPrompt}>
                  <Text style={styles.actionPromptText}>Gestionar</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  plotCard: {
    backgroundColor: '#FFFFFF',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plotTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cropText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.bgApp,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  footerTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
