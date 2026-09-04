import React from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { PaymentCardData, CardBrand } from '../../types/payment.types';
import { themeColors } from '../../hooks/useThemeStyles';
import { CardTypeSelector } from './CardTypeSelector';
import { CustomCheckbox } from '../common/CustomCheckbox';

interface PaymentCardFormProps {
  paymentData: PaymentCardData;
  onBrandChange: (brand: CardBrand) => void;
  onFieldChange: <K extends keyof PaymentCardData>(field: K, value: PaymentCardData[K]) => void;
}

export const PaymentCardForm: React.FC<PaymentCardFormProps> = ({
  paymentData,
  onBrandChange,
  onFieldChange,
}) => {
  const handleSecurityInfo = () => {
    Alert.alert(
      'Código de Seguridad (CVV)',
      'Son los 3 dígitos al dorso de tu tarjeta (o 4 dígitos al frente si es American Express).'
    );
  };

  const getBrandIcon = (brand: CardBrand): { name: any; color: string } => {
    switch (brand) {
      case 'visa':
        return { name: 'cc-visa', color: '#1A1F71' };
      case 'mastercard':
        return { name: 'cc-mastercard', color: '#EB001B' };
      case 'amex':
        return { name: 'cc-amex', color: '#006FCF' };
      default:
        return { name: 'credit-card', color: themeColors.primary };
    }
  };

  const currentBrandIcon = getBrandIcon(paymentData.brand);

  const formatCardInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const parts = cleaned.match(/.{1,4}/g);
    const formatted = parts ? parts.join(' ') : cleaned;
    onFieldChange('cardNumber', formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Payment</Text>

      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="card-outline" size={22} color={themeColors.textPrimary} />
          <Text style={styles.cardTitle}>Add Credit / Debit Card</Text>
        </View>

        <CardTypeSelector selectedBrand={paymentData.brand} onSelectBrand={onBrandChange} />

        <View style={styles.fieldGroup}>
          <TextInput
            style={styles.input}
            placeholder="Card Holder's Name"
            placeholderTextColor={themeColors.textMuted}
            value={paymentData.holderName}
            onChangeText={(text) => onFieldChange('holderName', text)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.cardNumberContainer}>
            <TextInput
              style={[styles.input, styles.cardNumberInput]}
              placeholder="Card Number"
              placeholderTextColor={themeColors.textMuted}
              value={paymentData.cardNumber}
              onChangeText={formatCardInput}
              keyboardType="number-pad"
              maxLength={19}
            />
            <View style={styles.brandIconWrapper}>
              <FontAwesome
                name={currentBrandIcon.name}
                size={22}
                color={currentBrandIcon.color}
              />
            </View>
          </View>
        </View>

        <Text style={styles.subLabel}>Expire Date</Text>
        <View style={styles.rowFields}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Month"
            placeholderTextColor={themeColors.textMuted}
            value={paymentData.expireMonth}
            onChangeText={(text) => onFieldChange('expireMonth', text.slice(0, 2))}
            keyboardType="number-pad"
            maxLength={2}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Year"
            placeholderTextColor={themeColors.textMuted}
            value={paymentData.expireYear}
            onChangeText={(text) => onFieldChange('expireYear', text.slice(0, 2))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={styles.securityCodeRow}>
          <TextInput
            style={[styles.input, styles.securityCodeInput]}
            placeholder="Security Code"
            placeholderTextColor={themeColors.textMuted}
            value={paymentData.securityCode}
            onChangeText={(text) => onFieldChange('securityCode', text.slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
          <TouchableOpacity onPress={handleSecurityInfo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="information-circle-outline" size={24} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.rememberRow}>
          <CustomCheckbox
            checked={paymentData.rememberCard}
            onToggle={() => onFieldChange('rememberCard', !paymentData.rememberCard)}
            label="Remember my card for next purchases."
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.textPrimary,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: themeColors.textPrimary,
  },
  cardNumberContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  cardNumberInput: {
    paddingRight: 48,
  },
  brandIconWrapper: {
    position: 'absolute',
    right: 14,
  },
  subLabel: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  securityCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  securityCodeInput: {
    flex: 1,
  },
  rememberRow: {
    marginTop: 4,
  },
});
