import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  loading = false,
  loadingText = 'Cargando...',
  disabled = false,
  variant = 'primary',
  iconName,
  onPress,
  style,
  ...rest
}) => {
  const colors = useThemeColors();
  const isButtonDisabled = disabled || loading;

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isButtonDisabled ? colors.surfaceHighlight : colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: isButtonDisabled ? colors.surfaceHighlight : colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isButtonDisabled ? colors.surfaceBorder : colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    if (isButtonDisabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
        return colors.primaryLight;
      case 'ghost':
        return colors.secondary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getContainerStyle(),
        isButtonDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isButtonDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={[styles.text, { color: '#FFFFFF', marginLeft: 8 }]}>
            {loadingText}
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          {iconName ? (
            <Ionicons
              name={iconName}
              size={18}
              color={getTextColor()}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.65,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
