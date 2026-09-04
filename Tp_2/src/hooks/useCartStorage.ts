import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { CartItem, CartTotals } from '../types/cart.types';
import { loadStoredCart, saveStoredCart } from '../utils/cartStorage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: 'nike-court-lite-2',
    title: 'NikeCourt Lite 2',
    subtitle: "Women's Hard Court Tennis Shoe",
    price: 67,
    image: require('../../assets/products/nike_court_lite_2.png'),
    selectedColor: 'Blue',
    availableColors: ['Blue', 'Black', 'White', 'Pink', 'Navy'],
    selectedSize: '38 EU',
    availableSizes: ['36 EU', '37 EU', '38 EU', '39 EU', '40 EU', '41 EU'],
    quantity: 1,
  },
  {
    id: 'wilson-hammer-5-3',
    title: 'Wilson Hammer 5.3',
    subtitle: 'Adult Tennis Racket',
    price: 80.45,
    originalPrice: 99.95,
    image: require('../../assets/products/wilson_hammer_5_3.png'),
    selectedColor: 'Black',
    availableColors: ['Black', 'White', 'Red', 'Gold'],
    selectedSize: '2-1/4',
    availableSizes: ['2-1/4', '4-1/4', '4-3/8', '4-1/2'],
    quantity: 1,
  },
];

export const useCartStorage = () => {
  const [items, setItems] = useState<CartItem[]>(DEFAULT_CART_ITEMS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const initializeCart = async () => {
      const stored = await loadStoredCart();
      if (stored && Array.isArray(stored) && stored.length > 0) {
        const rehydrated = stored.map((item) => {
          if (item.id === 'nike-court-lite-2') {
            return { ...item, image: require('../../assets/products/nike_court_lite_2.png') };
          }
          if (item.id === 'wilson-hammer-5-3') {
            return { ...item, image: require('../../assets/products/wilson_hammer_5_3.png') };
          }
          return item;
        });
        setItems(rehydrated);
      }
      setIsLoaded(true);
    };

    initializeCart();
  }, []);

  const updateCart = useCallback((newItems: CartItem[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(newItems);
    saveStoredCart(newItems);
  }, []);

  const updateItemColor = useCallback(
    (id: string, color: string) => {
      const updated = items.map((item) =>
        item.id === id ? { ...item, selectedColor: color } : item
      );
      updateCart(updated);
    },
    [items, updateCart]
  );

  const updateItemSize = useCallback(
    (id: string, size: string) => {
      const updated = items.map((item) =>
        item.id === id ? { ...item, selectedSize: size } : item
      );
      updateCart(updated);
    },
    [items, updateCart]
  );

  const incrementQuantity = useCallback(
    (id: string) => {
      const updated = items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      updateCart(updated);
    },
    [items, updateCart]
  );

  const removeItem = useCallback(
    (id: string) => {
      const target = items.find((it) => it.id === id);
      const title = target ? target.title : 'producto';
      Alert.alert(
        'Eliminar producto',
        `¿Deseas eliminar "${title}" del carrito?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              const updated = items.filter((item) => item.id !== id);
              updateCart(updated);
            },
          },
        ]
      );
    },
    [items, updateCart]
  );

  const decrementQuantity = useCallback(
    (id: string) => {
      const target = items.find((item) => item.id === id);
      if (!target) return;

      if (target.quantity <= 1) {
        removeItem(id);
      } else {
        const updated = items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
        updateCart(updated);
      }
    },
    [items, removeItem, updateCart]
  );

  const resetCartToDefault = useCallback(() => {
    updateCart(DEFAULT_CART_ITEMS);
  }, [updateCart]);

  const totals: CartTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      shipping,
      total,
      itemCount,
    };
  }, [items]);

  return {
    items,
    totals,
    isLoaded,
    updateItemColor,
    updateItemSize,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    resetCartToDefault,
  };
};
