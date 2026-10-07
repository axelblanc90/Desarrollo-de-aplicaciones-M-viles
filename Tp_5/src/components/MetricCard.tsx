import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'danger' | 'neutral';
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  status = 'neutral',
  subtitle,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'danger':
        return Colors.danger;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getStatusColor() }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: getStatusColor() }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 4,
    minWidth: 100,
    flex: 1,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unit: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
});
