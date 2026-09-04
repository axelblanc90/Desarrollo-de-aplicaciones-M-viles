import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { CardBrand } from '../../types/payment.types';
import { themeColors } from '../../hooks/useThemeStyles';

interface CardTypeOption {
  id: CardBrand;
  name: string;
  iconName: string;
  color: string;
}

const CARD_OPTIONS: CardTypeOption[] = [
  {
    id: 'mastercard',
    name: 'Mastercard',
    iconName: 'cc-mastercard',
    color: '#EB001B',
  },
  {
    id: 'visa',
    name: 'Visa',
    iconName: 'cc-visa',
    color: '#1A1F71',
  },
  {
    id: 'amex',
    name: 'Amex',
    iconName: 'cc-amex',
    color: '#006FCF',
  },
  {
    id: 'cabal',
    name: 'Cabal',
    iconName: 'credit-card',
    color: '#13783C',
  },
  {
    id: 'naranja',
    name: 'Naranja X',
    iconName: 'credit-card',
    color: '#FF6600',
  },
  {
    id: 'other',
    name: 'Otras',
    iconName: 'credit-card',
    color: '#6B7280',
  },
];

interface CardTypeSelectorProps {
  selectedBrand: CardBrand;
  onSelectBrand: (brand: CardBrand) => void;
}

export const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({
  selectedBrand,
  onSelectBrand,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de Tarjeta</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CARD_OPTIONS.map((option) => {
          const isSelected = option.id === selectedBrand;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.pill,
                isSelected && styles.selectedPill,
                isSelected && { borderColor: option.color },
              ]}
              onPress={() => onSelectBrand(option.id)}
              activeOpacity={0.7}
            >
              <FontAwesome
                name={option.iconName as any}
                size={18}
                color={isSelected ? option.color : themeColors.textSecondary}
              />
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.selectedPillText,
                  isSelected && { color: option.color },
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: themeColors.border,
    backgroundColor: '#FFFFFF',
  },
  selectedPill: {
    backgroundColor: '#F7FAFC',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.textSecondary,
  },
  selectedPillText: {
    fontWeight: '700',
  },
});
