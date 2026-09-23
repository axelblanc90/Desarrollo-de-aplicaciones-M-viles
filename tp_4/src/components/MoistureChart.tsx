import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Polyline,
  Line,
  Circle,
  Text as SvgText,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Reading } from '../types/agropulse.types';
import { colors } from '../theme/colors';

interface MoistureChartProps {
  readings: Reading[];
  thresholdMin?: number;
  thresholdMax?: number;
  title?: string;
}

export const MoistureChart: React.FC<MoistureChartProps> = ({
  readings,
  thresholdMin = 25,
  thresholdMax = 45,
  title = 'Historial de Humedad de Suelo (Últimas 6 h)',
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(screenWidth - 48, 420);
  const chartHeight = 180;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const minY = 0;
  const maxY = 60;

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return paddingTop + innerHeight - ((clamped - minY) / (maxY - minY)) * innerHeight;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (total - 1)) * innerWidth;
  };

  // Sort readings chronologically (oldest first)
  const sorted = [...readings].sort(
    (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  const pointsStr = sorted
    .map((r, i) => `${getX(i, sorted.length)},${getY(r.moisture_pct)}`)
    .join(' ');

  const currentMoisture = sorted.length > 0 ? sorted[sorted.length - 1].moisture_pct : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {currentMoisture !== null && (
          <Text style={styles.currentValue}>{currentMoisture}% Vol.</Text>
        )}
      </View>

      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.3" />
            <Stop offset="1" stopColor={colors.primaryLight} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Background Grid Lines */}
        {[0, 20, 40, 60].map((val) => {
          const y = getY(val);
          return (
            <React.Fragment key={`grid-${val}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth={1}
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 4}
                fill="#94A3B8"
                fontSize="10"
                textAnchor="end"
              >
                {val}%
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Threshold Min Reference Line */}
        {thresholdMin > 0 && (
          <Line
            x1={paddingLeft}
            y1={getY(thresholdMin)}
            x2={chartWidth - paddingRight}
            y2={getY(thresholdMin)}
            stroke={colors.statusDry}
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
        )}
        <SvgText
          x={chartWidth - paddingRight}
          y={getY(thresholdMin) - 4}
          fill={colors.statusDry}
          fontSize="9"
          textAnchor="end"
          fontWeight="bold"
        >
          Min {thresholdMin}%
        </SvgText>

        {/* Threshold Max Reference Line */}
        {thresholdMax > 0 && (
          <Line
            x1={paddingLeft}
            y1={getY(thresholdMax)}
            x2={chartWidth - paddingRight}
            y2={getY(thresholdMax)}
            stroke={colors.statusWet}
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
        )}
        <SvgText
          x={chartWidth - paddingRight}
          y={getY(thresholdMax) - 4}
          fill={colors.statusWet}
          fontSize="9"
          textAnchor="end"
          fontWeight="bold"
        >
          Max {thresholdMax}%
        </SvgText>

        {/* Moisture Curve Polyline */}
        {sorted.length > 1 && (
          <Polyline
            points={pointsStr}
            fill="none"
            stroke={colors.primaryLight}
            strokeWidth={2.5}
          />
        )}

        {/* Point Dots */}
        {sorted.map((r, i) => {
          const x = getX(i, sorted.length);
          const y = getY(r.moisture_pct);
          const isLatest = i === sorted.length - 1;
          return (
            <Circle
              key={r.id || `pt-${i}`}
              cx={x}
              cy={y}
              r={isLatest ? 5 : 3}
              fill={isLatest ? colors.primary : colors.primaryLight}
              stroke="#FFFFFF"
              strokeWidth={isLatest ? 2 : 1}
            />
          );
        })}

        {/* Time Labels on X Axis */}
        <SvgText
          x={paddingLeft}
          y={chartHeight - 8}
          fill="#94A3B8"
          fontSize="10"
          textAnchor="start"
        >
          -6h
        </SvgText>
        <SvgText
          x={paddingLeft + innerWidth / 2}
          y={chartHeight - 8}
          fill="#94A3B8"
          fontSize="10"
          textAnchor="middle"
        >
          -3h
        </SvgText>
        <SvgText
          x={chartWidth - paddingRight}
          y={chartHeight - 8}
          fill="#94A3B8"
          fontSize="10"
          textAnchor="end"
          fontWeight="bold"
        >
          Ahora
        </SvgText>
      </Svg>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.lineSample, { backgroundColor: colors.primaryLight }]} />
          <Text style={styles.legendLabel}>Humedad Medida</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dashSample, { borderColor: colors.statusDry }]} />
          <Text style={styles.legendLabel}>Umbral Mínimo (Riego)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  currentValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineSample: {
    width: 14,
    height: 3,
    borderRadius: 2,
    marginRight: 6,
  },
  dashSample: {
    width: 14,
    height: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 10,
    color: '#64748B',
  },
});
