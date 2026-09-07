import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordValidationState } from '../../types/auth.types';
import { useThemeColors } from '../../hooks/useThemeColors';

interface PasswordCriteriaChecklistProps {
  validation: PasswordValidationState;
  showWhenEmpty?: boolean;
  passwordLength: number;
}

export const PasswordCriteriaChecklist: React.FC<PasswordCriteriaChecklistProps> = ({
  validation,
  showWhenEmpty = false,
  passwordLength,
}) => {
  const colors = useThemeColors();

  if (passwordLength === 0 && !showWhenEmpty) {
    return null;
  }

  const criteriaItems = [
    {
      key: 'length',
      label: 'Mínimo 8 caracteres',
      satisfied: validation.hasMinLength,
    },
    {
      key: 'uppercase',
      label: 'Al menos una letra mayúscula (A-Z)',
      satisfied: validation.hasUppercase,
    },
    {
      key: 'lowercase',
      label: 'Al menos una letra minúscula (a-z)',
      satisfied: validation.hasLowercase,
    },
    {
      key: 'number',
      label: 'Al menos un dígito numérico (0-9)',
      satisfied: validation.hasNumber,
    },
    {
      key: 'special',
      label: 'Al menos un símbolo especial (!@#$%^&*...)',
      satisfied: validation.hasSpecialChar,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        Requisitos de seguridad de la contraseña:
      </Text>

      {criteriaItems.map((item) => (
        <View key={item.key} style={styles.itemRow}>
          <Ionicons
            name={item.satisfied ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={item.satisfied ? colors.success : colors.textMuted}
            style={styles.icon}
          />
          <Text
            style={[
              styles.itemLabel,
              {
                color: item.satisfied ? colors.success : colors.textSecondary,
                fontWeight: item.satisfied ? '600' : '400',
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  icon: {
    marginRight: 8,
  },
  itemLabel: {
    fontSize: 13,
  },
});
