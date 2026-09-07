import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CustomInputProps extends TextInputProps {
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  errorMessage?: string;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  iconName,
  errorMessage,
  isPassword = false,
  editable = true,
  value,
  onChangeText,
  placeholder,
  ...rest
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = Boolean(errorMessage);

  const getBorderColor = () => {
    if (hasError) return colors.inputBorderError;
    if (isFocused) return colors.inputBorderFocus;
    return colors.inputBorder;
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: hasError ? colors.error : colors.textSecondary }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: editable ? colors.inputBackground : colors.surface,
            borderColor: getBorderColor(),
            opacity: editable ? 1 : 0.6,
          },
        ]}
      >
        {iconName ? (
          <View style={styles.iconSlot}>
            <Ionicons
              name={iconName}
              size={19}
              color={hasError ? colors.error : isFocused ? colors.primaryLight : colors.textMuted}
            />
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeSlot}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            activeOpacity={0.7}
            disabled={!editable}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {hasError ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  iconSlot: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeSlot: {
    padding: 6,
    marginLeft: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
