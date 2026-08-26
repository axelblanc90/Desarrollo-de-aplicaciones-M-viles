import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colors, ThemeType, useThemeStyles } from '../hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

interface CounterProps {
  theme: ThemeType;
}

export const Counter: React.FC<CounterProps> = ({ theme }) => {
  const [count, setCount] = useState<number>(0);
  const globalStyles = useThemeStyles(theme);
  const activeColors = colors[theme];

  const handleIncrement = () => {
    if (count < 10) {
      setCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const isMaxReached = count >= 10;

  return (
    <View style={[globalStyles.card, styles.cardContainer]}>
      <Text style={[globalStyles.title, styles.cardTitle]}>Contador Inteligente</Text>
      <Text style={[globalStyles.textSecondary, styles.cardSubtitle]}>
        Incrementa el valor hasta llegar a su límite
      </Text>

      {/* Counter Value display */}
      <View style={[styles.counterContainer, { backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC' }]}>
        <Text style={[styles.counterValue, { color: activeColors.text }]}>
          {count}
        </Text>
      </View>

      {/* Warning Alert when count is 10 (Bonus) */}
      {isMaxReached && (
        <View style={[styles.warningBanner, { backgroundColor: activeColors.warning + '15', borderColor: activeColors.warning }]}>
          <Ionicons name="warning" size={20} color={activeColors.warning} style={styles.warningIcon} />
          <Text style={[styles.warningText, { color: activeColors.warning }]}>
            ¡Límite alcanzado! El valor máximo es 10.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Reset button */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            globalStyles.outlineButton,
            styles.actionButton,
            {
              opacity: pressed && Platform.OS === 'ios' ? 0.7 : 1,
            }
          ]}
          android_ripple={{ color: activeColors.ripple }}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="refresh-outline" size={20} color={activeColors.text} style={styles.icon} />
            <Text style={globalStyles.outlineButtonText}>Reiniciar</Text>
          </View>
        </Pressable>

        {/* Increment +1 button */}
        <Pressable
          onPress={handleIncrement}
          disabled={isMaxReached}
          style={({ pressed }) => [
            globalStyles.button,
            styles.actionButton,
            isMaxReached && styles.disabledButton,
            {
              backgroundColor: isMaxReached 
                ? (theme === 'dark' ? '#1E293B' : '#E2E8F0') 
                : activeColors.primary,
              opacity: pressed && Platform.OS === 'ios' ? 0.7 : 1,
            }
          ]}
          android_ripple={{ color: '#FFFFFF30' }}
        >
          <View style={styles.buttonContent}>
            <Ionicons 
              name="add-outline" 
              size={22} 
              color={isMaxReached ? activeColors.textSecondary : '#FFFFFF'} 
              style={styles.icon} 
            />
            <Text style={[
              globalStyles.buttonText, 
              isMaxReached && { color: activeColors.textSecondary }
            ]}>
              Incrementar
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    width: '100%',
  },
  cardTitle: {
    fontSize: 22,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
  },
  counterContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  counterValue: {
    fontSize: 64,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    width: '100%',
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  disabledButton: {
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
});
