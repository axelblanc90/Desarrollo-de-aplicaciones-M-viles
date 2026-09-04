export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'cabal' | 'naranja' | 'other';

export interface CardBrandOption {
  id: CardBrand;
  name: string;
  brandColor: string;
  badgeLabel: string;
}

export interface PaymentCardData {
  brand: CardBrand;
  holderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  securityCode: string;
  rememberCard: boolean;
}
