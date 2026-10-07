import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../state/useAppStore';
import { Colors } from '../theme/colors';

export const ReportsHistoryScreen: React.FC = () => {
  const {
    auditHistory,
    generatePdf,
    latestPdfResult,
    pendingSyncCount,
    isSyncing,
    triggerManualSync,
    isConnected,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    await generatePdf();
    setIsGenerating(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Historial Offline & Reportes PDF (Layer 6)</Text>
        <Text style={styles.subtitle}>
          Persistencia reactiva en WatermelonDB + Exportación de reporte técnico formal en PDF
        </Text>

        <TouchableOpacity
          style={[styles.pdfButton, isGenerating && styles.btnDisabled]}
          onPress={handleGeneratePdf}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.pdfButtonText}>📄 GENERAR REPORTE TÉCNICO EN PDF</Text>
          )}
        </TouchableOpacity>

        {/* RF-08: Exportación CSV y JSON */}
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => {
              const json = reportingLayer.export.exportToJson(auditHistory);
              alert(`JSON Exportado (${auditHistory.length} registros)`);
            }}
          >
            <Text style={styles.exportBtnText}>💾 EXPORTAR JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => {
              const csv = reportingLayer.export.exportToCsv(auditHistory);
              alert(`CSV Exportado (${auditHistory.length} registros)`);
            }}
          >
            <Text style={styles.exportBtnText}>📊 EXPORTAR CSV</Text>
          </TouchableOpacity>
        </View>

        {latestPdfResult && (
          <View style={styles.pdfGeneratedAlert}>
            <Text style={styles.pdfGeneratedTitle}>✓ Reporte PDF generado con éxito:</Text>
            <Text style={styles.pdfGeneratedPath}>{latestPdfResult.fileName}</Text>
            <Text style={styles.pdfGeneratedSub}>Ubicación: {latestPdfResult.filePath}</Text>
          </View>
        )}
      </View>

      {/* Sync Engine Status */}
      <View style={styles.syncCard}>
        <View style={styles.syncTop}>
          <Text style={styles.syncTitle}>ESTADO DEL MOTOR DE SINCRONIZACIÓN (OFFLINE FIRST)</Text>
          <View
            style={[
              styles.syncDot,
              { backgroundColor: isConnected ? Colors.success : Colors.warning },
            ]}
          />
        </View>

        <Text style={styles.syncStatusText}>
          {pendingSyncCount > 0
            ? `Hay ${pendingSyncCount} paquetes de auditoría pendientes de subida en cola.`
            : 'Todos los registros están sincronizados con el servidor central.'}
        </Text>

        <TouchableOpacity
          style={[styles.syncActionBtn, (!isConnected || isSyncing) && styles.btnDisabled]}
          onPress={triggerManualSync}
          disabled={!isConnected || isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.syncActionText}>
              {isConnected ? 'DISPARAR SYNC INMEDIATO CON BACKEND' : 'OFFLINE - SINCRONIZACIÓN EN PAUSA'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Audit History Records */}
      <Text style={styles.sectionHeader}>REGISTROS GUARDADOS EN WATERMELON DB ({auditHistory.length})</Text>

      {auditHistory.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No hay registros almacenados. Ve a la pestaña "Evidencia", captura los datos del equipo y guárdalos.
          </Text>
        </View>
      ) : (
        auditHistory.map((item, idx) => (
          <View key={item.id || idx} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordDevice}>{item.device?.model || 'Equipo Auditado'}</Text>
              <Text style={styles.recordDate}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <Text style={styles.recordSerial}>
              S/N: {item.device?.serialNumber} | IP: {item.device?.ip}
            </Text>

            {item.evidence?.gps && (
              <Text style={styles.recordGps}>
                GPS: {item.evidence.gps.latitude}°, {item.evidence.gps.longitude}° (±{item.evidence.gps.accuracy}m)
              </Text>
            )}

            <View style={styles.badgeRow}>
              <Text style={styles.badgeOffline}>WatermelonDB Local</Text>
              <Text style={styles.badgeTag}>Evidencia Adjunta</Text>
            </View>
          </View>
        ))
      )}
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
  pdfButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  exportBtnText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },
  pdfGeneratedAlert: {
    marginTop: 12,
    backgroundColor: '#064E3B',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  pdfGeneratedTitle: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pdfGeneratedPath: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  pdfGeneratedSub: {
    color: '#D1FAE5',
    fontSize: 10,
    marginTop: 2,
  },
  syncCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  syncTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  syncTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncStatusText: {
    color: Colors.textPrimary,
    fontSize: 12,
    marginBottom: 10,
  },
  syncActionBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  syncActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  recordCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDevice: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordDate: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  recordSerial: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  recordGps: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  badgeOffline: {
    backgroundColor: '#0F172A',
    color: Colors.textSecondary,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTag: {
    backgroundColor: '#1E3A8A',
    color: '#93C5FD',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
