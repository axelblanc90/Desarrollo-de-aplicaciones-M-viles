import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, {
  Polygon,
  Circle,
  Text as SvgText,
  G,
  Rect,
  Line,
} from 'react-native-svg';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Coordinate, isPointInPolygon } from '../lib/geofence';
import { getPlotStatusColor } from '../lib/plotStatusCalculator';
import { PlotWithTelemetry } from '../types/agropulse.types';
import { colors } from '../theme/colors';

interface PolygonMapProps {
  plots: PlotWithTelemetry[];
  selectedPlotId?: string | null;
  onSelectPlot: (plot: PlotWithTelemetry) => void;
  onLocationFound?: (coord: Coordinate | null, plotInside: PlotWithTelemetry | null) => void;
}

// Bounding box for Concordia plots
const BBOX = {
  minLng: -58.027,
  maxLng: -58.012,
  minLat: -31.404,
  maxLat: -31.390,
};

export const PolygonMap: React.FC<PolygonMapProps> = ({
  plots,
  selectedPlotId,
  onSelectPlot,
  onLocationFound,
}) => {
  const [userCoord, setUserCoord] = useState<Coordinate | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [plotInside, setPlotInside] = useState<PlotWithTelemetry | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const screenWidth = Dimensions.get('window').width;
  const svgWidth = Math.min(screenWidth - 32, 420);
  const svgHeight = 280;

  // Convert (lng, lat) to SVG (x, y)
  const toSvgCoords = (lng: number, lat: number): { x: number; y: number } => {
    const x = ((lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng)) * (svgWidth - 40) + 20;
    // Invert Y because SVG 0 is top, maxLat is North (top)
    const y = ((BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat)) * (svgHeight - 40) + 20;
    return { x, y };
  };

  const requestGpsLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Ubicación no disponible (permiso denegado)');
        onLocationFound?.(null, null);
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coord: Coordinate = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserCoord(coord);

      // Check geofence against each plot
      const inside = plots.find((p) => {
        const coords = p.geom.coordinates[0];
        return isPointInPolygon(coord, coords);
      }) || null;

      setPlotInside(inside);
      onLocationFound?.(coord, inside);
    } catch (err: any) {
      console.warn('[MAP GPS ERROR]', err);
      setLocationError('Ubicación no disponible');
      onLocationFound?.(null, null);
    } finally {
      setIsLocating(false);
    }
  };

  // Check geofencing whenever plots change if userCoord exists
  useEffect(() => {
    if (userCoord) {
      const inside = plots.find((p) => {
        const coords = p.geom.coordinates[0];
        return isPointInPolygon(userCoord, coords);
      }) || null;
      setPlotInside(inside);
    }
  }, [plots, userCoord]);

  return (
    <View style={styles.card}>
      {/* Geolocation status banner */}
      <View style={styles.geoBar}>
        <View style={styles.geoInfo}>
          <MaterialCommunityIcons
            name={plotInside ? 'map-marker-check' : userCoord ? 'map-marker-radius' : 'map-marker-off'}
            size={18}
            color={plotInside ? colors.primaryLight : userCoord ? colors.accentBlue : colors.statusStale}
          />
          <Text style={styles.geoText}>
            {isLocating
              ? 'Detectando posición GPS...'
              : locationError
              ? locationError
              : plotInside
              ? `Estás en: ${plotInside.name} (${plotInside.crop})`
              : userCoord
              ? 'GPS activo: Fuera de los lotes monitoreados'
              : 'Presiona el botón para verificar si estás en el lote'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={requestGpsLocation}
          disabled={isLocating}
          accessibilityLabel="Detectar si estoy en el lote con GPS"
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Interactive SVG Canvas */}
      <View style={[styles.svgWrapper, { width: svgWidth, height: svgHeight }]}>
        <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
          {/* Background Soil/Satellite grid */}
          <Rect width={svgWidth} height={svgHeight} fill="#F0FDF4" rx={12} />
          {/* Grid lines */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1={0}
              y1={i * 45}
              x2={svgWidth}
              y2={i * 45}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={i * 50}
              y1={0}
              x2={i * 50}
              y2={svgHeight}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          ))}

          {/* Render Plot Polygons */}
          {plots.map((plot) => {
            const rawCoords = plot.geom.coordinates[0];
            const pointsStr = rawCoords
              .map(([lng, lat]) => {
                const { x, y } = toSvgCoords(lng, lat);
                return `${x},${y}`;
              })
              .join(' ');

            // Calculate centroid for labels
            let sumX = 0;
            let sumY = 0;
            const validPointsCount = rawCoords.length - 1; // last point equals first
            for (let i = 0; i < validPointsCount; i++) {
              const pt = toSvgCoords(rawCoords[i][0], rawCoords[i][1]);
              sumX += pt.x;
              sumY += pt.y;
            }
            const centerX = sumX / validPointsCount;
            const centerY = sumY / validPointsCount;

            const color = getPlotStatusColor(plot.status);
            const isSelected = selectedPlotId === plot.id;
            const isCurrentInGps = plotInside?.id === plot.id;

            return (
              <G key={plot.id} onPress={() => onSelectPlot(plot)}>
                <Polygon
                  points={pointsStr}
                  fill={color}
                  fillOpacity={isSelected ? 0.45 : 0.28}
                  stroke={isSelected ? '#000000' : color}
                  strokeWidth={isSelected ? 3.5 : isCurrentInGps ? 3 : 2}
                  strokeDasharray={isCurrentInGps ? '4,3' : undefined}
                />

                {/* Plot Name and Moisture */}
                <SvgText
                  x={centerX}
                  y={centerY - 10}
                  fill="#1E293B"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {plot.name}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={centerY + 6}
                  fill="#475569"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {plot.crop} • {plot.latestReading ? `${plot.latestReading.moisture_pct}%` : '--'}
                </SvgText>

                {/* Station Dots */}
                {plot.stations.map((st) => {
                  const sPt = toSvgCoords(st.lng, st.lat);
                  return (
                    <Circle
                      key={st.id}
                      cx={sPt.x}
                      cy={sPt.y}
                      r={4.5}
                      fill="#FFFFFF"
                      stroke="#334155"
                      strokeWidth={2}
                    />
                  );
                })}
              </G>
            );
          })}

          {/* User GPS location dot if inside map bounds */}
          {userCoord &&
            userCoord.longitude >= BBOX.minLng &&
            userCoord.longitude <= BBOX.maxLng &&
            userCoord.latitude >= BBOX.minLat &&
            userCoord.latitude <= BBOX.maxLat && (
              <G>
                {(() => {
                  const uPt = toSvgCoords(userCoord.longitude, userCoord.latitude);
                  return (
                    <>
                      <Circle cx={uPt.x} cy={uPt.y} r={10} fill="#2563EB" fillOpacity={0.25} />
                      <Circle
                        cx={uPt.x}
                        cy={uPt.y}
                        r={5}
                        fill="#2563EB"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    </>
                  );
                })()}
              </G>
            )}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.statusOptimal }]} />
          <Text style={styles.legendText}>Óptimo</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.statusDry }]} />
          <Text style={styles.legendText}>Seco</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.statusWet }]} />
          <Text style={styles.legendText}>Húmedo</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.statusStale }]} />
          <Text style={styles.legendText}>Sin Datos (Stale)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  geoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgApp,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  geoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  geoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  gpsButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgWrapper: {
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  svg: {
    alignSelf: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
