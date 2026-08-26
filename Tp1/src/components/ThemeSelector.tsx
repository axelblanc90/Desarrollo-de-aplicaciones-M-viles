import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors, ThemeType } from '../hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

interface ThemeSelectorProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';
  const activeColors = colors[theme];

  return (
    <View style={[styles.container, { borderColor: activeColors.border, backgroundColor: activeColors.card }]}>
      <Text style={[styles.label, { color: activeColors.text }]}>Tema de la App</Text>
      
      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.toggleButton,
          {
            backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
            borderColor: activeColors.border,
            opacity: pressed && Platform.OS === 'ios' ? 0.7 : 1,
          }
        ]}
        android_ripple={{ color: activeColors.ripple, borderless: false }}
      >
        <View style={styles.content}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={18}
            color={isDark ? '#F59E0B' : '#3B82F6'}
            style={styles.icon}
          />
          <Text style={[styles.buttonText, { color: activeColors.text }]}>
            {isDark ? 'Oscuro' : 'Claro'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleButton: {
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
