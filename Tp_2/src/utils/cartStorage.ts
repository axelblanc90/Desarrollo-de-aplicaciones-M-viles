import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../types/cart.types';
import { AddressRecord } from '../types/address.types';
import { PaymentCardData } from '../types/payment.types';
import { ConfirmedOrder } from '../types/checkout.types';

const STORAGE_KEYS = {
  CART: '@tp2_cart_items',
  ADDRESSES: '@tp2_saved_addresses',
  PAYMENT: '@tp2_saved_payment',
  ORDER: '@tp2_last_order',
};

export const loadStoredCart = async (): Promise<CartItem[] | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveStoredCart = async (items: CartItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  } catch {}
};

export const loadStoredAddresses = async (): Promise<AddressRecord[] | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ADDRESSES);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveStoredAddresses = async (addresses: AddressRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
  } catch {}
};

export const loadStoredPayment = async (): Promise<PaymentCardData | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveStoredPayment = async (payment: PaymentCardData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT, JSON.stringify(payment));
  } catch {}
};

export const loadLastOrder = async (): Promise<ConfirmedOrder | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ORDER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveLastOrder = async (order: ConfirmedOrder): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDER, JSON.stringify(order));
  } catch {}
};
