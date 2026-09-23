import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlotStatus } from '../types/agropulse.types';
import { getPlotStatusColor, getPlotStatusLabel } from '../lib/plotStatusCalculator';

interface StatusBadgeProps {
  status: PlotStatus;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const color = getPlotStatusColor(status);
  const label = getPlotStatusLabel(status);

  const getIconName = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (status) {
      case 'optimal':
        return 'check-circle-outline';
      case 'dry':
        return 'water-alert-outline';
      case 'wet':
        return 'water-check-outline';
      case 'stale':
      default:
        return 'timer-off-outline';
    }
  };

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '20', borderColor: color },
        isSmall && styles.badgeSmall,
        isLarge && styles.badgeLarge,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Estado agronómico: ${label}`}
    >
      <MaterialCommunityIcons
        name={getIconName()}
        size={isSmall ? 14 : isLarge ? 20 : 16}
        color={color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          { color },
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  badgeLarge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 10,
  },
  textLarge: {
    fontSize: 14,
  },
});
