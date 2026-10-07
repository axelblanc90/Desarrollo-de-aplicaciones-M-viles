import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface GeoHotspot {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  quality: 'EXCELLENT' | 'GOOD' | 'POOR';
  mbps: number;
}

export const HeatmapMock: React.FC = () => {
  const hotspots: GeoHotspot[] = [
    { id: '1', label: 'Rack Central (Switch Core)', x: 30, y: 35, quality: 'EXCELLENT', mbps: 92.4 },
    { id: '2', label: 'Aula Magna (AP-WiFi6)', x: 65, y: 25, quality: 'GOOD', mbps: 58.1 },
    { id: '3', label: 'Patio Central', x: 50, y: 70, quality: 'POOR', mbps: 12.3 },
    { id: '4', label: 'Laboratorio de Redes', x: 20, y: 75, quality: 'EXCELLENT', mbps: 88.0 },
  ];

  const getColor = (q: string) => {
    if (q === 'EXCELLENT') return Colors.success;
    if (q === 'GOOD') return Colors.warning;
    return Colors.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapCanvas}>
        {/* Grid lines representing geospatial layout */}
        <View style={styles.gridLineH} />
        <View style={styles.gridLineV} />

        {hotspots.map((spot) => (
          <View
            key={spot.id}
            style={[
              styles.hotspotGlow,
              {
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                backgroundColor: `${getColor(spot.quality)}33`,
                borderColor: getColor(spot.quality),
              },
            ]}
          >
            <View style={[styles.hotspotCenter, { backgroundColor: getColor(spot.quality) }]} />
            <Text style={styles.spotText}>{spot.mbps}M</Text>
          </View>
        ))}

        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Mapa de Calor QoS (RF-05)</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendLabel}>Excelente (&gt;50M)</Text>
            <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.legendLabel}>Aceptable</Text>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <Text style={styles.legendLabel}>Degradado</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  mapCanvas: {
    height: 200,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineH: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 1,
    backgroundColor: '#1E293B',
  },
  gridLineV: {
    position: 'absolute',
    left: '50%',
    height: '100%',
    width: 1,
    backgroundColor: '#1E293B',
  },
  hotspotGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -22 }, { translateY: -22 }],
  },
  hotspotCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spotText: {
    color: Colors.textPrimary,
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  legendTitle: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  legendLabel: {
    color: Colors.textMuted,
    fontSize: 8,
  },
});
