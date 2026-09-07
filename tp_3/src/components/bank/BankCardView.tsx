import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface BankCardViewProps {
  cardHolderName: string;
  balance: string;
  accountNumber?: string;
}

export const BankCardView: React.FC<BankCardViewProps> = ({
  cardHolderName,
  balance,
  accountNumber = '•••• •••• •••• 8492',
}) => {
  const colors = useThemeColors();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceHighlight, borderColor: colors.surfaceBorder }]}>
      <View style={styles.cardHeader}>
        <View style={styles.brandRow}>
          <View style={[styles.cardLogo, { backgroundColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.bankName}>iBank Platinum</Text>
        </View>

        <Ionicons name="radio-outline" size={24} color={colors.textSecondary} />
      </View>

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: colors.gold }]}>
          <View style={styles.chipLineHorizontal} />
          <View style={styles.chipLineVertical} />
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceLabelRow}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Saldo Disponible</Text>
          <TouchableOpacity
            onPress={() => setShowBalance(!showBalance)}
            style={styles.eyeIcon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showBalance ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.balanceValue, { color: colors.textPrimary }]}>
          {showBalance ? balance : '••••••••'}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={[styles.footerLabel, { color: colors.textMuted }]}>TITULAR</Text>
          <Text style={[styles.footerValue, { color: colors.textPrimary }]}>
            {cardHolderName.toUpperCase()}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.footerLabel, { color: colors.textMuted }]}>N° CUENTA</Text>
          <Text style={[styles.footerValue, { color: colors.textPrimary }]}>{accountNumber}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    marginVertical: 12,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  chipRow: {
    marginBottom: 14,
  },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#B45309',
  },
  chipLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: '#B45309',
  },
  balanceContainer: {
    marginBottom: 18,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eyeIcon: {
    padding: 2,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
