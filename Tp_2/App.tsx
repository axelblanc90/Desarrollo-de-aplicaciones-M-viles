import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useThemeStyles, themeColors } from './src/hooks/useThemeStyles';
import { useCartStorage } from './src/hooks/useCartStorage';
import { useCheckoutState } from './src/hooks/useCheckoutState';
import { formatSubtotalHeader } from './src/utils/currencyFormatter';
import { CartDeliveryBanner } from './src/components/cart/CartDeliveryBanner';
import { CartItemCard } from './src/components/cart/CartItemCard';
import { CartSummaryBar } from './src/components/cart/CartSummaryBar';
import { EmptyCartState } from './src/components/cart/EmptyCartState';
import { SecureCheckoutHeader } from './src/components/checkout/SecureCheckoutHeader';
import { ShippingAddressSection } from './src/components/checkout/ShippingAddressSection';
import { PaymentCardForm } from './src/components/checkout/PaymentCardForm';
import { OrderReviewDrawer } from './src/components/checkout/OrderReviewDrawer';
import { AddressFormModal } from './src/components/address/AddressFormModal';
import { AddressSelectionModal } from './src/components/address/AddressSelectionModal';
import { OrderConfirmationView } from './src/components/confirmation/OrderConfirmationView';

export default function App() {
  const {
    items,
    totals,
    updateItemColor,
    updateItemSize,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    resetCartToDefault,
  } = useCartStorage();

  const {
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
  } = useCheckoutState();

  const handlePayNow = () => {
    placeOrder(items, totals);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {currentStep === 'cart' && (
        <View style={styles.screenContainer}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartHeaderTitle}>Shopping Cart</Text>
            <Text style={styles.cartHeaderSubtitle}>
              {formatSubtotalHeader(totals.itemCount, totals.total)}
            </Text>
          </View>

          <CartDeliveryBanner />

          {items.length === 0 ? (
            <EmptyCartState onRestore={resetCartToDefault} />
          ) : (
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.cartListContent}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onColorChange={(color) => updateItemColor(item.id, color)}
                  onSizeChange={(size) => updateItemSize(item.id, size)}
                  onIncrement={() => incrementQuantity(item.id)}
                  onDecrement={() => decrementQuantity(item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </ScrollView>
          )}

          <CartSummaryBar
            total={totals.total}
            disabled={items.length === 0}
            onCheckout={() => navigateToStep('checkout')}
          />
        </View>
      )}

      {currentStep === 'checkout' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.screenContainer}
        >
          <SecureCheckoutHeader onBack={() => navigateToStep('cart')} />

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.checkoutContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ShippingAddressSection
              address={selectedAddress}
              onSelectAddress={() => setIsAddressListModalVisible(true)}
              onEditAddress={() => openEditAddressModal(selectedAddress)}
              billingSameAsDelivery={selectedAddress?.billingSameAsDelivery ?? true}
              onToggleBillingSame={() => {
                if (selectedAddress) {
                  saveAddress({
                    ...selectedAddress,
                    billingSameAsDelivery: !selectedAddress.billingSameAsDelivery,
                  });
                }
              }}
            />

            <PaymentCardForm
              paymentData={paymentData}
              onBrandChange={setCardBrand}
              onFieldChange={updatePaymentField}
            />
          </ScrollView>

          <OrderReviewDrawer
            items={items}
            totals={totals}
            isExpanded={isOrderReviewExpanded}
            onToggleExpand={toggleOrderReview}
            onPayNow={handlePayNow}
          />

          <AddressFormModal
            visible={isAddressModalVisible}
            initialAddress={editingAddress}
            onSave={saveAddress}
            onClose={() => setIsAddressModalVisible(false)}
          />

          <AddressSelectionModal
            visible={isAddressListModalVisible}
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={selectAddress}
            onEditAddress={(addr) => {
              setIsAddressListModalVisible(false);
              openEditAddressModal(addr);
            }}
            onAddNewAddress={() => {
              setIsAddressListModalVisible(false);
              openNewAddressModal();
            }}
            onClose={() => setIsAddressListModalVisible(false)}
          />
        </KeyboardAvoidingView>
      )}

      {currentStep === 'confirmation' && confirmedOrder && (
        <View style={styles.screenContainer}>
          <OrderConfirmationView
            order={confirmedOrder}
            onBackToShopping={() => {
              resetCartToDefault();
              navigateToStep('cart');
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 40 : 0,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cartHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  cartHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  cartHeaderSubtitle: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginTop: 2,
  },
  cartListContent: {
    paddingBottom: 20,
  },
  checkoutContent: {
    paddingBottom: 24,
  },
});
