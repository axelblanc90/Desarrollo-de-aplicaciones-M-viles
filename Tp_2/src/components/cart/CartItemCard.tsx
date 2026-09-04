import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../types/cart.types';
import { themeColors } from '../../hooks/useThemeStyles';
import { formatCurrency } from '../../utils/currencyFormatter';
import { OptionSelectorModal } from '../common/OptionSelectorModal';

interface CartItemCardProps {
  item: CartItem;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onColorChange,
  onSizeChange,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [sizePickerVisible, setSizePickerVisible] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.priceContainer}>
          {item.originalPrice ? (
            <Text style={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
          ) : null}
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.productImage} resizeMode="contain" />
        </View>

        <View style={styles.controlsColumn}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Color</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setColorPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownValue}>{item.selectedColor}</Text>
              <Ionicons name="chevron-down" size={16} color={themeColors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Size</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setSizePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownValue}>{item.selectedSize}</Text>
              <Ionicons name="chevron-down" size={16} color={themeColors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Qty</Text>
            <View style={styles.quantityStepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={onDecrement}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                {item.quantity <= 1 ? (
                  <Ionicons name="trash-outline" size={18} color={themeColors.danger} />
                ) : (
                  <Ionicons name="remove" size={18} color={themeColors.primary} />
                )}
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={onIncrement}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={themeColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <OptionSelectorModal
        visible={colorPickerVisible}
        title="Seleccionar Color"
        options={item.availableColors}
        selectedValue={item.selectedColor}
        onSelect={onColorChange}
        onClose={() => setColorPickerVisible(false)}
      />

      <OptionSelectorModal
        visible={sizePickerVisible}
        title="Seleccionar Talle (Size)"
        options={item.availableSizes}
        selectedValue={item.selectedSize}
        onSelect={onSizeChange}
        onClose={() => setSizePickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: themeColors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 13,
    color: themeColors.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  controlsColumn: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'space-between',
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.textPrimary,
    width: 48,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginLeft: 12,
  },
  dropdownValue: {
    fontSize: 14,
    color: themeColors.textPrimary,
    fontWeight: '500',
  },
  quantityStepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    marginLeft: 12,
  },
  stepperButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
});
