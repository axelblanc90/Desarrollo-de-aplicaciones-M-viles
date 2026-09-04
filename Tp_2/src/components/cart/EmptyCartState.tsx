import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColors } from '../../hooks/useThemeStyles';

interface EmptyCartStateProps {
  onRestore: () => void;
}

export const EmptyCartState: React.FC<EmptyCartStateProps> = ({ onRestore }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cart-outline" size={54} color={themeColors.textMuted} />
      </View>
      <Text style={styles.title}>Tu carrito está vacío</Text>
      <Text style={styles.subtitle}>
        Eliminaste todos los productos. Puedes restaurar los productos iniciales para continuar con el flujo.
      </Text>
      <TouchableOpacity style={styles.restoreButton} onPress={onRestore} activeOpacity={0.8}>
        <Ionicons name="refresh" size={18} color="#FFFFFF" />
        <Text style={styles.restoreButtonText}>Restaurar productos</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 60,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: themeColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: themeColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  restoreButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
