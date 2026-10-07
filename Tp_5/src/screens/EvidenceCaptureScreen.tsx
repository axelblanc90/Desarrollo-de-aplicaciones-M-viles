import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import { Colors } from '../theme/colors';

export const EvidenceCaptureScreen: React.FC = () => {
  const {
    activeDevice,
    scanDeviceQr,
    captureFieldEvidence,
    currentEvidence,
    saveAuditRecord,
    capturedPhotosCount,
  } = useAppStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleScanSample = async (type: 'CISCO_SWITCH' | 'MIKROTIK_ROUTER' | 'UBIQUITI_AP') => {
    setIsProcessing(true);
    await scanDeviceQr(type);
    setIsProcessing(false);
  };

  const handleCaptureEvidence = async () => {
    setIsProcessing(true);
    await captureFieldEvidence('Inspección de rack físico y conectorización óptica.');
    setIsProcessing(false);
  };

  const handleSaveToDatabase = async () => {
    await saveAuditRecord();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Capa de Evidencia Técnica (Layer 3)</Text>
        <Text style={styles.subtitle}>
          Escaneo QR del equipo + Foto técnica de instalación + Georreferenciación GPS
        </Text>
      </View>

      {/* QR Scanning Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. IDENTIFICACIÓN DE EQUIPO (QR CODE)</Text>
        <Text style={styles.helperText}>
          Simula el escaneo con la cámara del sticker de identificación de un equipo de red:
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => handleScanSample('CISCO_SWITCH')}
          >
            <Text style={styles.qrBtnText}>Switch Cisco</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => handleScanSample('MIKROTIK_ROUTER')}
          >
            <Text style={styles.qrBtnText}>Router MikroTik</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => handleScanSample('UBIQUITI_AP')}
          >
            <Text style={styles.qrBtnText}>Antena / AP UniFi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deviceInfoCard}>
          <Text style={styles.deviceField}>
            Equipo: <Text style={styles.fieldVal}>{activeDevice?.model || 'Catalyst 2960'}</Text>
          </Text>
          <Text style={styles.deviceField}>
            Fabricante: <Text style={styles.fieldVal}>{activeDevice?.vendor || 'Cisco'}</Text>
          </Text>
          <Text style={styles.deviceField}>
            N° Serie: <Text style={styles.fieldValMono}>{activeDevice?.serialNumber || 'FOC2134L09A'}</Text>
          </Text>
          <Text style={styles.deviceField}>
            Dirección MAC: <Text style={styles.fieldValMono}>{activeDevice?.macAddress || '00:1A:2B:3C:4D:5E'}</Text>
          </Text>
        </View>
      </View>

      {/* Photo and GPS Evidence Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>2. EVIDENCIA FOTOGRÁFICA & GPS</Text>
        <Text style={styles.helperText}>
          Captura la foto del rack y estampa las coordenadas satelitales:
        </Text>

        <TouchableOpacity
          style={[styles.primaryActionBtn, isProcessing && styles.btnDisabled]}
          onPress={handleCaptureEvidence}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryActionText}>
              📷 CAPTURAR FOTO CON POSICIONAMIENTO GPS
            </Text>
          )}
        </TouchableOpacity>

        {currentEvidence && (
          <View style={styles.evidenceResultBox}>
            <View style={styles.evidenceRow}>
              <Text style={styles.evidenceLabel}>Coordenadas GPS:</Text>
              <Text style={styles.evidenceVal}>
                {currentEvidence.gps.latitude}°, {currentEvidence.gps.longitude}° (±{currentEvidence.gps.accuracy}m)
              </Text>
            </View>
            <View style={styles.evidenceRow}>
              <Text style={styles.evidenceLabel}>Timestamp UTC:</Text>
              <Text style={styles.evidenceVal}>{currentEvidence.capturedAt}</Text>
            </View>
            <View style={styles.evidenceRow}>
              <Text style={styles.evidenceLabel}>Archivo Foto:</Text>
              <Text style={styles.evidenceValMono}>{currentEvidence.photoUri}</Text>
            </View>
            <Text style={styles.evidenceSuccessTag}>✓ Evidencia empaquetada e inmutable</Text>
          </View>
        )}
      </View>

      {/* Save to Local WatermelonDB */}
      <View style={styles.saveSection}>
        <TouchableOpacity
          style={[styles.saveBtn, !currentEvidence && styles.btnDisabled]}
          onPress={handleSaveToDatabase}
          disabled={!currentEvidence}
        >
          <Text style={styles.saveBtnText}>
            💾 GUARDAR EN WATERMELON DB (OFFLINE FIRST)
          </Text>
        </TouchableOpacity>

        {saveSuccess && (
          <Text style={styles.successMessage}>
            ✓ Auditoría guardada exitosamente en la base local y encolada en SyncQueue.
          </Text>
        )}
      </View>
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
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  qrBtn: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  qrBtnText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  deviceInfoCard: {
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  deviceField: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  fieldVal: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  fieldValMono: {
    color: Colors.accent,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  evidenceResultBox: {
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  evidenceRow: {
    marginBottom: 6,
  },
  evidenceLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  evidenceVal: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  evidenceValMono: {
    color: Colors.accent,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  evidenceSuccessTag: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 6,
  },
  saveSection: {
    marginBottom: 30,
  },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  successMessage: {
    color: Colors.success,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});
