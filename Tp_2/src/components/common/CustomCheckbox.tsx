import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColors } from '../../hooks/useThemeStyles';

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onToggle, label }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={[styles.box, checked && styles.checkedBox]}>
        {checked && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: themeColors.textMuted,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    color: themeColors.textPrimary,
  },
});
