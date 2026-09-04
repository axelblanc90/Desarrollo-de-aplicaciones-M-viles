import { ImageSourcePropType } from 'react-native';

export interface CartProduct {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: ImageSourcePropType;
  availableColors: string[];
  availableSizes: string[];
}

export interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: ImageSourcePropType;
  selectedColor: string;
  availableColors: string[];
  selectedSize: string;
  availableSizes: string[];
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}
