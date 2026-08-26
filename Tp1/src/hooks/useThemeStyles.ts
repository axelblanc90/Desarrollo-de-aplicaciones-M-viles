import { StyleSheet } from 'react-native';

export type ThemeType = 'light' | 'dark';

export const colors = {
  light: {
    background: '#F4F6F9',
    card: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    border: '#E2E8F0',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    inputBg: '#F8FAFC',
    ripple: '#E2E8F0',
    cardShadow: 'rgba(51, 65, 85, 0.06)',
    activeFilterBg: '#DBEAFE',
    activeFilterText: '#1E40AF',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    border: '#334155',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    inputBg: '#0F172A',
    ripple: '#334155',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    activeFilterBg: '#1E3A8A',
    activeFilterText: '#93C5FD',
  }
};

export const useThemeStyles = (theme: ThemeType) => {
  const activeColors = colors[theme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeColors.background,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    card: {
      backgroundColor: activeColors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: activeColors.border,
      // Shadow for iOS
      shadowColor: activeColors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      // Shadow for Android
      elevation: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: activeColors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: activeColors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    text: {
      color: activeColors.text,
      fontSize: 16,
    },
    textSecondary: {
      color: activeColors.textSecondary,
      fontSize: 14,
    },
    input: {
      backgroundColor: activeColors.inputBg,
      borderWidth: 1,
      borderColor: activeColors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: activeColors.text,
      fontSize: 16,
      marginBottom: 12,
    },
    button: {
      backgroundColor: activeColors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDanger: {
      backgroundColor: activeColors.danger,
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: activeColors.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineButtonText: {
      color: activeColors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    flexRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
};
