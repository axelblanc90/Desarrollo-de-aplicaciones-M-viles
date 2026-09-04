import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColors } from '../../hooks/useThemeStyles';
import { formatCurrency } from '../../utils/currencyFormatter';

interface CartSummaryBarProps {
  total: number;
  onCheckout: () => void;
  disabled?: boolean;
}

export const CartSummaryBar: React.FC<CartSummaryBarProps> = ({
  total,
  onCheckout,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.totalBlock}>
        <Ionicons name="chevron-up" size={20} color={themeColors.primary} style={styles.chevron} />
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkoutButton, disabled && styles.disabledButton]}
        onPress={onCheckout}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: themeColors.borderLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  totalBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    marginRight: 2,
  },
  totalLabel: {
    fontSize: 13,
    color: themeColors.textSecondary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  checkoutButton: {
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: themeColors.textMuted,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
