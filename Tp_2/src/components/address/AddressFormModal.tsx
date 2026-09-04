import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddressRecord, BillingType } from '../../types/address.types';
import { themeColors } from '../../hooks/useThemeStyles';
import { CustomCheckbox } from '../common/CustomCheckbox';

interface AddressFormModalProps {
  visible: boolean;
  initialAddress: AddressRecord | null;
  onSave: (address: AddressRecord) => void;
  onClose: () => void;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  visible,
  initialAddress,
  onSave,
  onClose,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+49');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [street, setStreet] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Germany');
  const [billingSame, setBillingSame] = useState(true);
  const [billingType, setBillingType] = useState<BillingType>('personal');

  useEffect(() => {
    if (initialAddress) {
      setRecipientName(initialAddress.recipientName);
      setPhoneCountryCode(initialAddress.phoneCountryCode);
      setPhoneNumber(initialAddress.phoneNumber);
      setEmail(initialAddress.email);
      setTitle(initialAddress.title);
      setStreet(initialAddress.street);
      setStreet2(initialAddress.street2 || '');
      setCity(initialAddress.city);
      setCountry(initialAddress.country);
      setBillingSame(initialAddress.billingSameAsDelivery);
      setBillingType(initialAddress.billingType);
    } else {
      setRecipientName('');
      setPhoneCountryCode('+49');
      setPhoneNumber('');
      setEmail('');
      setTitle('');
      setStreet('');
      setStreet2('');
      setCity('');
      setCountry('Germany');
      setBillingSame(true);
      setBillingType('personal');
    }
  }, [initialAddress, visible]);

  const handleSave = () => {
    if (!recipientName.trim() || !phoneNumber.trim() || !email.trim() || !street.trim() || !city.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos requeridos (*).');
      return;
    }

    const saved: AddressRecord = {
      id: initialAddress ? initialAddress.id : `addr-${Date.now()}`,
      title: title.trim() || 'Home',
      recipientName: recipientName.trim(),
      phoneCountryCode,
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      street: street.trim(),
      street2: street2.trim() || undefined,
      city: city.trim(),
      country: country.trim(),
      isDefault: initialAddress ? initialAddress.isDefault : false,
      billingSameAsDelivery: billingSame,
      billingType,
    };

    onSave(saved);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {initialAddress ? 'Edit Address' : 'Add Address'}
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.requiredNotice}>*Required fields.</Text>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>1</Text>
            </View>
            <Text style={styles.sectionHeading}>Recipients Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Name and Surname*"
              placeholderTextColor={themeColors.textMuted}
              value={recipientName}
              onChangeText={setRecipientName}
            />
          </View>

          <View style={styles.phoneRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>{phoneCountryCode}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="Phone Number*"
              placeholderTextColor={themeColors.textMuted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
          <Text style={styles.helperText}>For shipping related questions only.</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="E-mail Address*"
              placeholderTextColor={themeColors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.helperText}>This address will be used to send you order and bill details.</Text>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>2</Text>
            </View>
            <Text style={styles.sectionHeading}>Shipping Address</Text>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Address Title (Optional)"
              placeholderTextColor={themeColors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <Text style={styles.helperText}>For estimating if the place is opened or closed on the weekends.</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Address* Street, apartment name etc."
              placeholderTextColor={themeColors.textMuted}
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="+ Street Address 2 (Optional)"
              placeholderTextColor={themeColors.textMuted}
              value={street2}
              onChangeText={setStreet2}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="City*"
              placeholderTextColor={themeColors.textMuted}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Country*"
              placeholderTextColor={themeColors.textMuted}
              value={country}
              onChangeText={setCountry}
            />
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>3</Text>
            </View>
            <Text style={styles.sectionHeading}>Billing Information</Text>
          </View>

          <View style={styles.checkboxWrapper}>
            <CustomCheckbox
              checked={billingSame}
              onToggle={() => setBillingSame(!billingSame)}
              label="Same as delivery address."
            />
          </View>

          <Text style={styles.subHeading}>Billing Type*</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setBillingType('personal')}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, billingType === 'personal' && styles.selectedRadio]}>
                {billingType === 'personal' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Personal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setBillingType('commercial')}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, billingType === 'commercial' && styles.selectedRadio]}>
                {billingType === 'commercial' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Commercial</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    paddingBottom: 40,
  },
  requiredNotice: {
    fontSize: 12,
    color: themeColors.textSecondary,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 12,
  },
  sectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themeColors.primaryLight,
    borderWidth: 1,
    borderColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: themeColors.primary,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  inputGroup: {
    marginBottom: 10,
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
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  countryCodeBox: {
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.textPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  helperText: {
    fontSize: 11,
    color: themeColors.textSecondary,
    marginBottom: 14,
    lineHeight: 15,
  },
  checkboxWrapper: {
    marginVertical: 12,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.textPrimary,
    marginTop: 8,
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  selectedRadio: {
    borderColor: themeColors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: themeColors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: themeColors.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: themeColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
