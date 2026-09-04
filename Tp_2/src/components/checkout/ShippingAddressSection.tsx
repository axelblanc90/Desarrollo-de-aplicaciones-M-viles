import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AddressRecord } from '../../types/address.types';
import { themeColors } from '../../hooks/useThemeStyles';
import { CustomCheckbox } from '../common/CustomCheckbox';

interface ShippingAddressSectionProps {
  address: AddressRecord | null;
  onSelectAddress: () => void;
  onEditAddress: () => void;
  billingSameAsDelivery: boolean;
  onToggleBillingSame: () => void;
}

export const ShippingAddressSection: React.FC<ShippingAddressSectionProps> = ({
  address,
  onSelectAddress,
  onEditAddress,
  billingSameAsDelivery,
  onToggleBillingSame,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shipping</Text>
        <TouchableOpacity onPress={onSelectAddress} activeOpacity={0.7}>
          <Text style={styles.actionText}>Add / Edit</Text>
        </TouchableOpacity>
      </View>

      {address ? (
        <TouchableOpacity
          style={styles.addressCard}
          onPress={onSelectAddress}
          activeOpacity={0.8}
        >
          <View style={styles.addressInfo}>
            <Text style={styles.recipientName}>{address.recipientName}</Text>
            <Text style={styles.addressDetail}>{address.email}</Text>
            <Text style={styles.addressDetail}>
              {address.phoneCountryCode} {address.phoneNumber}
            </Text>
            <Text style={styles.addressStreet}>
              {address.street}
              {address.street2 ? `, ${address.street2}` : ''}
            </Text>
            <Text style={styles.addressStreet}>
              {address.city}, {address.country}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.emptyAddressButton}
          onPress={onEditAddress}
          activeOpacity={0.8}
        >
          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#4F4F4F" />
            <Text style={styles.emptyText}>Add Address</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={themeColors.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.checkboxContainer}>
        <CustomCheckbox
          checked={billingSameAsDelivery}
          onToggle={onToggleBillingSame}
          label="Billing and delivery addresses are same."
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.primary,
  },
  addressCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressInfo: {
    flex: 1,
    paddingRight: 10,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 2,
  },
  addressStreet: {
    fontSize: 13,
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  emptyAddressButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.textPrimary,
  },
  checkboxContainer: {
    marginTop: 14,
  },
});
