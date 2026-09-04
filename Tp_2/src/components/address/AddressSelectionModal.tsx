import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddressRecord } from '../../types/address.types';
import { themeColors } from '../../hooks/useThemeStyles';

interface AddressSelectionModalProps {
  visible: boolean;
  addresses: AddressRecord[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onEditAddress: (address: AddressRecord) => void;
  onAddNewAddress: () => void;
  onClose: () => void;
}

export const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({
  visible,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onEditAddress,
  onAddNewAddress,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Addresses</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subHeading}>Choose an Address</Text>

          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId;
            return (
              <TouchableOpacity
                key={address.id}
                style={[styles.addressCard, isSelected && styles.selectedCard]}
                onPress={() => onSelectAddress(address.id)}
                activeOpacity={0.8}
              >
                <View style={styles.radioColumn}>
                  <View style={[styles.radioCircle, isSelected && styles.selectedRadioCircle]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>

                <View style={styles.addressDetails}>
                  <Text style={styles.addressTitle}>{address.title}</Text>
                  <Text style={styles.recipientName}>{address.recipientName}</Text>
                  <Text style={styles.addressLine}>
                    {address.street}
                    {address.street2 ? `, ${address.street2}` : ''}
                  </Text>
                  <Text style={styles.addressLine}>
                    {address.city}, {address.country}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => onEditAddress(address)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil-outline" size={20} color={themeColors.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.addNewButton} onPress={onAddNewAddress} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color={themeColors.primary} />
            <Text style={styles.addNewButtonText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.confirmButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.textPrimary,
    marginBottom: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  selectedCard: {
    borderColor: themeColors.primary,
    backgroundColor: '#F7FAFC',
  },
  radioColumn: {
    marginRight: 12,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: themeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioCircle: {
    borderColor: themeColors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: themeColors.primary,
  },
  addressDetails: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 12,
    color: themeColors.textSecondary,
    marginBottom: 2,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 13,
    color: themeColors.textSecondary,
    lineHeight: 18,
  },
  editButton: {
    padding: 6,
    marginLeft: 8,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: themeColors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 6,
  },
  addNewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: themeColors.borderLight,
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
