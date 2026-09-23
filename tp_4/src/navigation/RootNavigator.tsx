import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAgro } from '../context/AgroContext';
import { LoginScreen } from '../screens/LoginScreen';
import { MapScreen } from '../screens/MapScreen';
import { PlotsScreen } from '../screens/PlotsScreen';
import { PlotDetailScreen } from '../screens/PlotDetailScreen';
import { ManualReadingScreen } from '../screens/ManualReadingScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { PlotWithTelemetry } from '../types/agropulse.types';
import { colors } from '../theme/colors';

type TabKey = 'map' | 'plots' | 'alerts' | 'account';

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { alerts } = useAgro();

  const [activeTab, setActiveTab] = useState<TabKey>('map');
  const [activePlotDetail, setActivePlotDetail] = useState<PlotWithTelemetry | null>(null);
  const [manualReadingPlot, setManualReadingPlot] = useState<PlotWithTelemetry | null>(null);
  const [isManualReadingOpen, setIsManualReadingOpen] = useState<boolean>(false);

  // Unread alerts count
  const unreadAlertsCount = alerts.filter((a) => !a.read_at).length;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Iniciando AgroPulse...</Text>
      </View>
    );
  }

  // Not logged in -> Show LoginScreen (RF-01)
  if (!user) {
    return <LoginScreen />;
  }

  // Active Stack: Manual Reading
  if (isManualReadingOpen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ManualReadingScreen
          initialPlot={manualReadingPlot || undefined}
          onBack={() => setIsManualReadingOpen(false)}
        />
      </SafeAreaView>
    );
  }

  // Active Stack: Plot Detail (RF-09, RF-10, RF-13, RF-14)
  if (activePlotDetail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PlotDetailScreen
          plot={activePlotDetail}
          onBack={() => setActivePlotDetail(null)}
          onOpenManualReading={(plot) => {
            setManualReadingPlot(plot);
            setIsManualReadingOpen(true);
          }}
        />
      </SafeAreaView>
    );
  }

  // Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <MapScreen
            onOpenPlotDetail={(plot) => setActivePlotDetail(plot)}
            onOpenManualReading={(plot) => {
              setManualReadingPlot(plot || null);
              setIsManualReadingOpen(true);
            }}
          />
        );
      case 'plots':
        return <PlotsScreen onOpenPlotDetail={(plot) => setActivePlotDetail(plot)} />;
      case 'alerts':
        return <AlertsScreen />;
      case 'account':
        return <AccountScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mainContent}>{renderTabContent()}</View>

        {/* Bottom Tab Navigation Bar (PRD §12) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('map')}
            accessibilityRole="tab"
            accessibilityLabel="Mapa de lotes"
          >
            <MaterialCommunityIcons
              name={activeTab === 'map' ? 'map' : 'map-outline'}
              size={24}
              color={activeTab === 'map' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, activeTab === 'map' && styles.tabLabelActive]}>
              Mapa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('plots')}
            accessibilityRole="tab"
            accessibilityLabel="Lista de lotes"
          >
            <MaterialCommunityIcons
              name={activeTab === 'plots' ? 'view-grid' : 'view-grid-outline'}
              size={24}
              color={activeTab === 'plots' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, activeTab === 'plots' && styles.tabLabelActive]}>
              Lotes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('alerts')}
            accessibilityRole="tab"
            accessibilityLabel="Alertas del sistema"
          >
            <View>
              <MaterialCommunityIcons
                name={activeTab === 'alerts' ? 'bell' : 'bell-outline'}
                size={24}
                color={activeTab === 'alerts' ? colors.primary : colors.textSecondary}
              />
              {unreadAlertsCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{unreadAlertsCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, activeTab === 'alerts' && styles.tabLabelActive]}>
              Alertas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('account')}
            accessibilityRole="tab"
            accessibilityLabel="Mi cuenta y diagnóstico"
          >
            <MaterialCommunityIcons
              name={activeTab === 'account' ? 'account-circle' : 'account-circle-outline'}
              size={24}
              color={activeTab === 'account' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, activeTab === 'account' && styles.tabLabelActive]}>
              Cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgApp,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 3,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.accentRed,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
