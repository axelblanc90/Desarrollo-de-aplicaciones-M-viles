import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface QuickActionTileProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export const QuickActionTile: React.FC<QuickActionTileProps> = ({
  label,
  iconName,
  onPress,
}) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.surfaceHighlight, borderColor: colors.surfaceBorder },
        ]}
      >
        <Ionicons name={iconName} size={22} color={colors.primaryLight} />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
