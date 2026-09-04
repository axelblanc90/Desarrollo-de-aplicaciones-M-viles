import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { themeColors } from '../../hooks/useThemeStyles';

interface CartDeliveryBannerProps {
  text?: string;
}

export const CartDeliveryBanner: React.FC<CartDeliveryBannerProps> = ({
  text = 'Arrives by April 3 to April 9th',
}) => {
  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="truck-fast-outline" size={24} color="#4F4F4F" />
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: themeColors.bannerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.bannerText,
  },
});
