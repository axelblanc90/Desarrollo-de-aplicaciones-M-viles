export type BillingType = 'personal' | 'commercial';

export interface AddressRecord {
  id: string;
  title: string;
  recipientName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  street: string;
  street2?: string;
  city: string;
  country: string;
  isDefault: boolean;
  billingSameAsDelivery: boolean;
  billingType: BillingType;
}
