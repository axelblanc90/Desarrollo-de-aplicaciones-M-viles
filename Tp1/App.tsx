import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeType, colors, useThemeStyles } from './src/hooks/useThemeStyles';
import { ThemeSelector } from './src/components/ThemeSelector';
import { Counter } from './src/components/Counter';
import { TodoList } from './src/components/TodoList';
import { Ionicons } from '@expo/vector-icons';

type ActiveTab = 'counter' | 'todo';

export default function App() {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [activeTab, setActiveTab] = useState<ActiveTab>('counter');

  const globalStyles = useThemeStyles(theme);
  const activeColors = colors[theme];

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeColors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      
      <View style={[globalStyles.container, styles.mainContainer]}>
        {/* Header App Brand */}
        <View style={styles.headerBrand}>
          <View style={styles.logoContainer}>
            <Ionicons name="apps" size={24} color={activeColors.primary} />
            <Text style={[styles.brandText, { color: activeColors.text }]}>TP1 - Móviles</Text>
          </View>
        </View>

        {/* Global Theme Selector component */}
        <ThemeSelector theme={theme} toggleTheme={toggleTheme} />

        {/* Tab Switcher Navigation */}
        <View style={[styles.navigationContainer, { backgroundColor: theme === 'dark' ? '#1E293B' : '#E2E8F0' }]}>
          <Pressable
            onPress={() => setActiveTab('counter')}
            style={[
              styles.navTab,
              activeTab === 'counter' && [
                styles.activeNavTab,
                { backgroundColor: activeColors.card }
              ]
            ]}
          >
            <Ionicons
              name={activeTab === 'counter' ? 'calculator' : 'calculator-outline'}
              size={18}
              color={activeTab === 'counter' ? activeColors.primary : activeColors.textSecondary}
              style={styles.navIcon}
            />
            <Text
              style={[
                styles.navText,
                { color: activeColors.textSecondary },
                activeTab === 'counter' && { color: activeColors.text, fontWeight: '700' }
              ]}
            >
              Contador
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('todo')}
            style={[
              styles.navTab,
              activeTab === 'todo' && [
                styles.activeNavTab,
                { backgroundColor: activeColors.card }
              ]
            ]}
          >
            <Ionicons
              name={activeTab === 'todo' ? 'checkbox' : 'checkbox-outline'}
              size={18}
              color={activeTab === 'todo' ? activeColors.primary : activeColors.textSecondary}
              style={styles.navIcon}
            />
            <Text
              style={[
                styles.navText,
                { color: activeColors.textSecondary },
                activeTab === 'todo' && { color: activeColors.text, fontWeight: '700' }
              ]}
            >
              Tareas (To-Do)
            </Text>
          </Pressable>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentContainer}>
          {activeTab === 'counter' ? (
            <Counter theme={theme} />
          ) : (
            <TodoList theme={theme} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 40 : 0,
  },
  mainContainer: {
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navigationContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  navTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeNavTab: {
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  navIcon: {
    marginRight: 6,
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
});
