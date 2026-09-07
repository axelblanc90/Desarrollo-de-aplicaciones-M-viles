import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface BankHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showLogo?: boolean;
}

export const BankHeader: React.FC<BankHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showLogo = true,
}) => {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.surfaceBorder }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver atrás"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {showLogo && (
          <View style={styles.brandRow}>
            <View style={[styles.brandIconContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandName, { color: colors.textPrimary }]}>
              i<Text style={{ color: colors.secondary }}>Bank</Text>
            </Text>
          </View>
        )}

        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backPlaceholder: {
    width: 42,
    height: 42,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
