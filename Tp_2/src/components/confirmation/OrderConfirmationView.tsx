import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ConfirmedOrder } from '../../types/checkout.types';
import { themeColors } from '../../hooks/useThemeStyles';
import { formatCurrency } from '../../utils/currencyFormatter';
import { OrderSuccessBadge } from './OrderSuccessBadge';

interface OrderConfirmationViewProps {
  order: ConfirmedOrder;
  onBackToShopping: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onBackToShopping,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBackToShopping}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmation</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OrderSuccessBadge
          orderNumber={order.orderNumber}
          email={order.shippingAddress.email}
          placedAt={order.placedAt}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping</Text>
          <View style={styles.infoCard}>
            <Text style={styles.recipientName}>{order.shippingAddress.recipientName}</Text>
            <Text style={styles.infoLine}>{order.shippingAddress.email}</Text>
            <Text style={styles.infoLine}>
              {order.shippingAddress.phoneCountryCode} {order.shippingAddress.phoneNumber}
            </Text>
            <Text style={styles.addressLine}>
              {order.shippingAddress.street}
              {order.shippingAddress.street2 ? `, ${order.shippingAddress.street2}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing</Text>
          <View style={styles.infoCard}>
            <Text style={styles.recipientName}>{order.billingAddress.recipientName}</Text>
            <Text style={styles.infoLine}>{order.billingAddress.email}</Text>
            <Text style={styles.infoLine}>
              {order.billingAddress.phoneCountryCode} {order.billingAddress.phoneNumber}
            </Text>
            <Text style={styles.addressLine}>
              {order.billingAddress.street}
              {order.billingAddress.street2 ? `, ${order.billingAddress.street2}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {order.billingAddress.city}, {order.billingAddress.country}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.deliveryBadge}>
            <MaterialCommunityIcons name="truck-fast-outline" size={20} color="#4F4F4F" />
            <Text style={styles.deliveryBadgeText}>Arrives by April 3 to April 9th</Text>
          </View>

          <View style={styles.itemsList}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>Color: {item.selectedColor}</Text>
                  <Text style={styles.itemMeta}>Size: {item.selectedSize}</Text>
                  <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.itemPriceColumn}>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryBreakdown}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.totals.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.totals.shipping)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.totals.total)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToShopping}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back to Shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingBottom: 36,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 4,
  },
  infoLine: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 13,
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  deliveryBadge: {
    backgroundColor: themeColors.bannerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  deliveryBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.bannerText,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#F7F7F7',
  },
  itemDetails: {
    flex: 1,
    paddingHorizontal: 14,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: themeColors.textSecondary,
  },
  itemPriceColumn: {
    alignItems: 'flex-end',
  },
  strikethroughPrice: {
    fontSize: 12,
    color: themeColors.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  summaryBreakdown: {
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
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.textPrimary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: themeColors.borderLight,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  backButton: {
    borderWidth: 1.5,
    borderColor: themeColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    color: themeColors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
