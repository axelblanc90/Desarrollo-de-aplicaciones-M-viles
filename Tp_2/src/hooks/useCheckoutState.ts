import { useState, useEffect, useCallback } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { AddressRecord } from '../types/address.types';
import { CardBrand, PaymentCardData } from '../types/payment.types';
import { CheckoutStep, ConfirmedOrder } from '../types/checkout.types';
import { CartItem, CartTotals } from '../types/cart.types';
import {
  loadStoredAddresses,
  saveStoredAddresses,
  loadStoredPayment,
  saveStoredPayment,
  saveLastOrder,
} from '../utils/cartStorage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_ADDRESSES: AddressRecord[] = [
  {
    id: 'addr-home',
    title: 'Home',
    recipientName: 'Banu Elson',
    phoneCountryCode: '+49',
    phoneNumber: '179 111 1010',
    email: 'orders@banuelson.com',
    street: 'Leibnizstraße 16, Wohnheim 6, No: 8X',
    city: 'Clausthal-Zellerfeld',
    country: 'Germany',
    isDefault: true,
    billingSameAsDelivery: true,
    billingType: 'personal',
  },
  {
    id: 'addr-office',
    title: 'My Office',
    recipientName: 'Banu Elson',
    phoneCountryCode: '+49',
    phoneNumber: '179 111 1010',
    email: 'orders@banuelson.com',
    street: 'Altenauer Str. 35',
    city: 'Clausthal-Zellerfeld',
    country: 'Germany',
    isDefault: false,
    billingSameAsDelivery: true,
    billingType: 'commercial',
  },
  {
    id: 'addr-mum',
    title: "Mum's House",
    recipientName: 'Alice Elson',
    phoneCountryCode: '+49',
    phoneNumber: '179 222 3030',
    email: 'alice@banuelson.com',
    street: 'Erzstrasse Str. 9',
    city: 'Clausthal-Zellerfeld',
    country: 'Germany',
    isDefault: false,
    billingSameAsDelivery: true,
    billingType: 'personal',
  },
];

const DEFAULT_PAYMENT: PaymentCardData = {
  brand: 'mastercard',
  holderName: 'Banu Elson',
  cardNumber: '5470 0004 0003 0002',
  expireMonth: '12',
  expireYear: '25',
  securityCode: '574',
  rememberCard: true,
};

export const useCheckoutState = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [addresses, setAddresses] = useState<AddressRecord[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-home');
  const [paymentData, setPaymentData] = useState<PaymentCardData>(DEFAULT_PAYMENT);
  const [isOrderReviewExpanded, setIsOrderReviewExpanded] = useState<boolean>(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState<boolean>(false);
  const [isAddressListModalVisible, setIsAddressListModalVisible] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<AddressRecord | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      const storedAddresses = await loadStoredAddresses();
      if (storedAddresses && storedAddresses.length > 0) {
        setAddresses(storedAddresses);
        const def = storedAddresses.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      }

      const storedPayment = await loadStoredPayment();
      if (storedPayment) {
        setPaymentData(storedPayment);
      }
    };

    initializeCheckout();
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const toggleOrderReview = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOrderReviewExpanded((prev) => !prev);
  }, []);

  const setCardBrand = useCallback((brand: CardBrand) => {
    setPaymentData((prev) => {
      const updated = { ...prev, brand };
      saveStoredPayment(updated);
      return updated;
    });
  }, []);

  const updatePaymentField = useCallback(<K extends keyof PaymentCardData>(
    field: K,
    value: PaymentCardData[K]
  ) => {
    setPaymentData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'rememberCard' && !value) {
        // do not auto-save if user disabled remember
      } else {
        saveStoredPayment(updated);
      }
      return updated;
    });
  }, []);

  const saveAddress = useCallback((address: AddressRecord) => {
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === address.id);
      const updated = exists
        ? prev.map((a) => (a.id === address.id ? address : a))
        : [...prev, address];
      saveStoredAddresses(updated);
      return updated;
    });
    setSelectedAddressId(address.id);
    setIsAddressModalVisible(false);
    setEditingAddress(null);
  }, []);

  const selectAddress = useCallback((id: string) => {
    setSelectedAddressId(id);
    setIsAddressListModalVisible(false);
  }, []);

  const openNewAddressModal = useCallback(() => {
    setEditingAddress(null);
    setIsAddressModalVisible(true);
  }, []);

  const openEditAddressModal = useCallback((address?: AddressRecord) => {
    setEditingAddress(address || selectedAddress);
    setIsAddressModalVisible(true);
  }, [selectedAddress]);

  const placeOrder = useCallback(
    async (items: CartItem[], totals: CartTotals) => {
      const orderNumber = `#BE${Math.floor(10000 + Math.random() * 90000)}`;
      const now = new Date();
      const placedAt = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })} CEST`;

      const order: ConfirmedOrder = {
        orderId: `ord-${Date.now()}`,
        orderNumber,
        placedAt,
        shippingAddress: selectedAddress,
        billingAddress: selectedAddress,
        paymentDetails: paymentData,
        items,
        totals,
      };

      await saveLastOrder(order);
      setConfirmedOrder(order);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentStep('confirmation');
    },
    [selectedAddress, paymentData]
  );

  const navigateToStep = useCallback((step: CheckoutStep) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentStep(step);
  }, []);

  return {
    currentStep,
    navigateToStep,
    addresses,
    selectedAddress,
    selectedAddressId,
    selectAddress,
    saveAddress,
    isAddressModalVisible,
    setIsAddressModalVisible,
    isAddressListModalVisible,
    setIsAddressListModalVisible,
    editingAddress,
    openNewAddressModal,
    openEditAddressModal,
    paymentData,
    setCardBrand,
    updatePaymentField,
    isOrderReviewExpanded,
    toggleOrderReview,
    placeOrder,
    confirmedOrder,
  };
};
