import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CooldownTimerBadgeProps {
  secondsLeft: number;
  message?: string;
}

export const CooldownTimerBadge: React.FC<CooldownTimerBadgeProps> = ({
  secondsLeft,
  message = 'Podrás reintentar en',
}) => {
  const colors = useThemeColors();

  if (secondsLeft <= 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.warningLight,
          borderColor: colors.warning,
        },
      ]}
    >
      <Ionicons name="time-outline" size={16} color={colors.warning} style={styles.icon} />
      <Text style={[styles.text, { color: colors.warning }]}>
        {message} <Text style={styles.countdown}>{secondsLeft}s</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
    alignSelf: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  countdown: {
    fontWeight: '700',
  },
});
