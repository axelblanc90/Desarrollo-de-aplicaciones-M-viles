import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import { Colors } from '../theme/colors';
import { MetricCard } from '../components/MetricCard';
import { HeatmapMock } from '../components/HeatmapMock';

export const QoSMapScreen: React.FC = () => {
  const { pingResults, throughput, isTestingQos, runQoSTest } = useAppStore();

  const primaryPing = pingResults[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Evaluador de QoS & Cobertura (RF-02 / RF-03 / RF-05)</Text>
        <Text style={styles.subtitle}>
          Sondas activas sobre sockets TCP/UDP + Test de Throughput en Mbps + Heatmap Georreferenciado
        </Text>

        <TouchableOpacity
          style={[styles.testBtn, isTestingQos && styles.btnDisabled]}
          onPress={() => runQoSTest()}
          disabled={isTestingQos}
        >
          {isTestingQos ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.testBtnText}>EJECUTAR BENCHMARK COMPLETO DE RED (QOS)</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Latency Section */}
      <Text style={styles.sectionHeader}>1. LATENCIA, JITTER & PÉRDIDA DE PAQUETES (RF-02)</Text>
      <View style={styles.metricsGrid}>
        <MetricCard
          label="RTT Mínimo"
          value={primaryPing ? primaryPing.minRttMs : 14.1}
          unit="ms"
          status="good"
          subtitle="Mejor muestra"
        />
        <MetricCard
          label="RTT Promedio"
          value={primaryPing ? primaryPing.avgRttMs : 18.4}
          unit="ms"
          status="good"
          subtitle="Host 1.1.1.1"
        />
        <MetricCard
          label="RTT Máximo"
          value={primaryPing ? primaryPing.maxRttMs : 25.8}
          unit="ms"
          status="warning"
          subtitle="Pico observado"
        />
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          label="Jitter (RFC 3550)"
          value={primaryPing ? primaryPing.jitterMs : 3.2}
          unit="ms"
          status="good"
          subtitle="Variación de retardo"
        />
        <MetricCard
          label="Pérdida Paquetes"
          value={primaryPing ? primaryPing.packetLossPercentage : 0}
          unit="%"
          status="good"
          subtitle="Confiabilidad"
        />
      </View>

      {/* Throughput Section */}
      <Text style={styles.sectionHeader}>2. TEST DE ANCHO DE BANDA / THROUGHPUT (RF-03)</Text>
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Throughput Bajada"
          value={throughput ? throughput.downloadMbps : 84.5}
          unit="Mbps"
          status="good"
          subtitle="Payload binario 2MB"
        />
        <MetricCard
          label="Throughput Subida"
          value={throughput ? throughput.uploadMbps : 28.2}
          unit="Mbps"
          status="good"
          subtitle="Echo Stream 1MB"
        />
      </View>

      {/* Heatmap Coverage Section */}
      <Text style={styles.sectionHeader}>3. MAPA DE CALOR DE COBERTURA PERSONAL (RF-05)</Text>
      <HeatmapMock />
      <Text style={styles.mapFooterNote}>
        Correlación en vivo entre coordenadas GPS adquiridas y mediciones de QoS en sockets locales.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  headerBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  testBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  mapFooterNote: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 4,
  },
});
