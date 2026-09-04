import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { themeColors } from '../../hooks/useThemeStyles';

interface SecureCheckoutHeaderProps {
  title?: string;
  onBack: () => void;
}

export const SecureCheckoutHeader: React.FC<SecureCheckoutHeaderProps> = ({
  title = 'Secure Payment',
  onBack,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={26} color={themeColors.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.securityBadge}>
        <MaterialCommunityIcons name="shield-check" size={22} color={themeColors.success} />
        <View>
          <Text style={styles.badgeSecure}>SECURE</Text>
          <Text style={styles.badgeSsl}>SSL ENCRYPTION</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 90,
    justifyContent: 'flex-end',
  },
  badgeSecure: {
    fontSize: 9,
    fontWeight: '800',
    color: themeColors.textPrimary,
    letterSpacing: 0.5,
  },
  badgeSsl: {
    fontSize: 7,
    fontWeight: '600',
    color: themeColors.textSecondary,
    letterSpacing: 0.3,
  },
});
