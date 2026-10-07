import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Colors } from './src/theme/colors';
import { NetworkStatusBar } from './src/components/NetworkStatusBar';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DiscoveryScreen } from './src/screens/DiscoveryScreen';
import { DiagnosticScreen } from './src/screens/DiagnosticScreen';
import { EvidenceCaptureScreen } from './src/screens/EvidenceCaptureScreen';
import { QoSMapScreen } from './src/screens/QoSMapScreen';
import { ReportsHistoryScreen } from './src/screens/ReportsHistoryScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'discovery' | 'diagnostic' | 'evidence' | 'qos' | 'reports'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: '📊' },
    { id: 'discovery', label: 'Escanear', icon: '🔍' },
    { id: 'evidence', label: 'Evidencia', icon: '📷' },
    { id: 'diagnostic', label: 'SNMP/SSH', icon: '⚡' },
    { id: 'qos', label: 'QoS', icon: '📡' },
    { id: 'reports', label: 'Reportes', icon: '📄' },
  ];

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={(t: any) => setCurrentTab(t)} />;
      case 'discovery':
        return <DiscoveryScreen />;
      case 'evidence':
        return <EvidenceCaptureScreen />;
      case 'diagnostic':
        return <DiagnosticScreen />;
      case 'qos':
        return <QoSMapScreen />;
      case 'reports':
        return <ReportsHistoryScreen />;
      default:
        return <DashboardScreen onNavigate={(t: any) => setCurrentTab(t)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Main App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appTitle}>Network QoS & Field Auditor</Text>
          <Text style={styles.appSubtitle}>TP5 - Desarrollo de Aplicaciones Móviles</Text>
        </View>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>

      {/* Network & Offline-First Monitor Strip */}
      <NetworkStatusBar />

      {/* Active Screen View */}
      <View style={styles.body}>{renderActiveScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.navTab, isActive && styles.navTabActive]}
              onPress={() => setCurrentTab(tab.id as any)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  appBar: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  appTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  appSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  versionBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  versionText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
  },
  navTab: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flex: 1,
  },
  navTabActive: {
    backgroundColor: Colors.surface,
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
});
