import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem, CartTotals } from '../../types/cart.types';
import { themeColors } from '../../hooks/useThemeStyles';
import { formatCurrency } from '../../utils/currencyFormatter';

interface OrderReviewDrawerProps {
  items: CartItem[];
  totals: CartTotals;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPayNow: () => void;
}

export const OrderReviewDrawer: React.FC<OrderReviewDrawerProps> = ({
  items,
  totals,
  isExpanded,
  onToggleExpand,
  onPayNow,
}) => {
  return (
    <View style={styles.wrapper}>
      {isExpanded ? (
        <View style={styles.expandedContainer}>
          <TouchableOpacity
            style={styles.expandedHeader}
            onPress={onToggleExpand}
            activeOpacity={0.7}
          >
            <Text style={styles.expandedTitle}>Order Review</Text>
            <Ionicons name="chevron-down" size={22} color={themeColors.primary} />
          </TouchableOpacity>

          <View style={styles.expandedItemList}>
            {items.map((item) => (
              <View key={item.id} style={styles.expandedItemRow}>
                <Image source={item.image} style={styles.expandedImage} resizeMode="contain" />
                <View style={styles.expandedItemDetails}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>Color: {item.selectedColor}</Text>
                  <Text style={styles.itemMeta}>Size: {item.selectedSize}</Text>
                  <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.expandedPriceColumn}>
                  {item.originalPrice ? (
                    <Text style={styles.strikethroughPrice}>
                      {formatCurrency(item.originalPrice)}
                    </Text>
                  ) : null}
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.shipping)}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.collapsedContainer}>
          <View style={styles.previewHeaderRow}>
            <Text style={styles.itemsCountText}>
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
            </Text>
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryBadgeText}>Arrives by April 3 to April 9th</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {items.map((item) => (
              <View key={item.id} style={styles.previewCard}>
                <Image source={item.image} style={styles.previewImage} resizeMode="contain" />
                <View style={styles.previewCardDetails}>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.previewMeta}>Color: {item.selectedColor}</Text>
                  <Text style={styles.previewMeta}>Size: {item.selectedSize}</Text>
                  <Text style={styles.previewMeta}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.previewPrice}>{formatCurrency(item.price)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={styles.totalTrigger}
          onPress={onToggleExpand}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-up'}
            size={22}
            color={themeColors.primary}
          />
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totals.total)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.payNowButton} onPress={onPayNow} activeOpacity={0.85}>
          <Text style={styles.payNowButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subtextContainer}>
        <Text style={styles.subtext}>
          This is the final step, after you touching{' '}
          <Text style={styles.boldSubtext}>Pay Now</Text> button, the payment will be transaction
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: themeColors.borderLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 6,
  },
  collapsedContainer: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  itemsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  deliveryBadge: {
    backgroundColor: themeColors.bannerBackground,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  deliveryBadgeText: {
    fontSize: 12,
    color: themeColors.bannerText,
    fontWeight: '500',
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 8,
    padding: 10,
    width: 270,
    position: 'relative',
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#F7F7F7',
  },
  previewCardDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 2,
  },
  previewMeta: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.textPrimary,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  expandedContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  expandedItemList: {
    gap: 14,
    marginBottom: 16,
  },
  expandedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
    paddingBottom: 12,
  },
  expandedImage: {
    width: 72,
    height: 72,
    borderRadius: 6,
    backgroundColor: '#F7F7F7',
  },
  expandedItemDetails: {
    flex: 1,
    paddingHorizontal: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginTop: 1,
  },
  expandedPriceColumn: {
    alignItems: 'flex-end',
  },
  strikethroughPrice: {
    fontSize: 12,
    color: themeColors.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  totalsSection: {
    borderTopWidth: 1,
    borderTopColor: themeColors.borderLight,
    paddingTop: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: themeColors.borderLight,
  },
  totalTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  payNowButton: {
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  subtextContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 2,
  },
  subtext: {
    fontSize: 11,
    color: themeColors.textSecondary,
    lineHeight: 15,
  },
  boldSubtext: {
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
});
