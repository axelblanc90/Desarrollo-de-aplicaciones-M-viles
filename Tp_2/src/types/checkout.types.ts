import { AddressRecord } from './address.types';
import { CartItem, CartTotals } from './cart.types';
import { PaymentCardData } from './payment.types';

export type CheckoutStep = 'cart' | 'checkout' | 'confirmation';

export interface ConfirmedOrder {
  orderId: string;
  orderNumber: string;
  placedAt: string;
  shippingAddress: AddressRecord;
  billingAddress: AddressRecord;
  paymentDetails: PaymentCardData;
  items: CartItem[];
  totals: CartTotals;
}
