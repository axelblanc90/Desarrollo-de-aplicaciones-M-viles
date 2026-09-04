import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColors } from '../../hooks/useThemeStyles';

interface OrderSuccessBadgeProps {
  orderNumber: string;
  email: string;
  placedAt: string;
}

export const OrderSuccessBadge: React.FC<OrderSuccessBadgeProps> = ({
  orderNumber,
  email,
  placedAt,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.title}>Thank you!</Text>
          <Text style={styles.subtitle}>Your order {orderNumber} has been placed.</Text>
        </View>
      </View>

      <Text style={styles.emailNotice}>
        We sent an email to <Text style={styles.boldEmail}>{email}</Text> with your order
        confirmation and bill.
      </Text>

      <Text style={styles.timePlaced}>Time placed: {placedAt}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  successIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: themeColors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: themeColors.textPrimary,
  },
  emailNotice: {
    fontSize: 13,
    color: themeColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  boldEmail: {
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  timePlaced: {
    fontSize: 13,
    color: themeColors.textSecondary,
  },
});
