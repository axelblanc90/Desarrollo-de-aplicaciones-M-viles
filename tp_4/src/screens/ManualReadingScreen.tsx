import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAgro } from '../context/AgroContext';
import { PlotWithTelemetry } from '../types/agropulse.types';
import { colors } from '../theme/colors';

interface ManualReadingScreenProps {
  initialPlot?: PlotWithTelemetry;
  onBack: () => void;
}

export const ManualReadingScreen: React.FC<ManualReadingScreenProps> = ({
  initialPlot,
  onBack,
}) => {
  const { plots, submitManualReading } = useAgro();

  const [selectedPlot, setSelectedPlot] = useState<PlotWithTelemetry>(initialPlot || plots[0]);
  const [moisture, setMoisture] = useState<string>('24.5');
  const [temperature, setTemperature] = useState<string>('23.0');
  const [rainMm, setRainMm] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'queued' | 'error'; message: string } | null>(
    null
  );

  const handleCaptureGps = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Requerido', 'No se concedió acceso a la ubicación GPS.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGpsCoords({
        lat: Number(loc.coords.latitude.toFixed(6)),
        lng: Number(loc.coords.longitude.toFixed(6)),
      });
    } catch (err: any) {
      Alert.alert('Error GPS', err.message || 'No se pudo obtener la posición satelital.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    setFeedback(null);
    const mNum = parseFloat(moisture);
    const tNum = parseFloat(temperature);
    const rNum = parseFloat(rainMm) || 0;

    if (isNaN(mNum) || isNaN(tNum)) {
      setFeedback({ type: 'error', message: 'Humedad y temperatura deben ser números válidos.' });
      return;
    }

    if (mNum < 0 || mNum > 100) {
      setFeedback({ type: 'error', message: 'La humedad debe estar entre 0% y 100%.' });
      return;
    }

    const targetStation = selectedPlot.stations[0];
    if (!targetStation) {
      setFeedback({ type: 'error', message: 'El lote seleccionado no posee estaciones asociadas.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitManualReading({
        stationId: targetStation.id,
        plotId: selectedPlot.id,
        moisturePct: mNum,
        tempC: tNum,
        rainMm: rNum,
        notes: notes.trim() || undefined,
        lat: gpsCoords?.lat,
        lng: gpsCoords?.lng,
      });

      if (res.queued) {
        setFeedback({
          type: 'queued',
          message:
            'Sin conexión directa: La lectura fue encolada localmente en el dispositivo y se sincronizará al restablecer la red.',
        });
      } else {
        setFeedback({
          type: 'success',
          message: 'Lectura manual registrada y sincronizada exitosamente con la base de datos.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al guardar la lectura.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Lectura Manual en Campo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            Permite ingresar observaciones agronómicas directas con sonda de campo o inspección ocular
            (RF-21). Funciona de forma transparente sin señal (offline).
          </Text>
        </View>

        {feedback && (
          <View
            style={[
              styles.feedbackBox,
              feedback.type === 'success' && styles.feedbackSuccess,
              feedback.type === 'queued' && styles.feedbackQueued,
              feedback.type === 'error' && styles.feedbackError,
            ]}
          >
            <MaterialCommunityIcons
              name={
                feedback.type === 'success'
                  ? 'check-circle-outline'
                  : feedback.type === 'queued'
                  ? 'cloud-sync-outline'
                  : 'alert-circle-outline'
              }
              size={20}
              color={
                feedback.type === 'success'
                  ? '#15803D'
                  : feedback.type === 'queued'
                  ? '#B45309'
                  : '#B91C1C'
              }
            />
            <Text
              style={[
                styles.feedbackText,
                feedback.type === 'success' && { color: '#15803D' },
                feedback.type === 'queued' && { color: '#B45309' },
                feedback.type === 'error' && { color: '#B91C1C' },
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          {/* Plot Selector */}
          <Text style={styles.label}>Lote a Inspeccionar</Text>
          <View style={styles.plotSelectorRow}>
            {plots.map((p) => {
              const isSelected = selectedPlot.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.plotChip, isSelected && styles.plotChipSelected]}
                  onPress={() => setSelectedPlot(p)}
                >
                  <Text style={[styles.plotChipText, isSelected && styles.plotChipTextSelected]}>
                    {p.name} ({p.crop})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Moisture Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Humedad Medida con Sonda (%)</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="water-percent" size={20} color={colors.primaryLight} />
              <TextInput
                style={styles.input}
                value={moisture}
                onChangeText={setMoisture}
                keyboardType="numeric"
                placeholder="Ej: 22.5"
              />
            </View>
          </View>

          {/* Temperature Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Temperatura de Suelo / Ambiente (°C)</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="thermometer" size={20} color="#C2410C" />
              <TextInput
                style={styles.input}
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
                placeholder="Ej: 24.0"
              />
            </View>
          </View>

          {/* Rain Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precipitación Observada (mm)</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="weather-rainy" size={20} color={colors.accentBlue} />
              <TextInput
                style={styles.input}
                value={rainMm}
                onChangeText={setRainMm}
                keyboardType="numeric"
                placeholder="Ej: 0"
              />
            </View>
          </View>

          {/* GPS Location Capture */}
          <View style={styles.gpsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Geolocalización In Situ</Text>
              <Text style={styles.gpsSub}>
                {gpsCoords
                  ? `Lat: ${gpsCoords.lat}, Lng: ${gpsCoords.lng}`
                  : 'Posición no registrada'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.gpsCaptureBtn}
              onPress={handleCaptureGps}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#FFFFFF" />
                  <Text style={styles.gpsCaptureBtnText}>Capturar GPS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notas y Observaciones Agronómicas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ej: Suelo seco en cabecera de lote. Sin presencia de plagas."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit CTA */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Guardar Lectura de Campo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  infoBannerText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  feedbackQueued: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  plotSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  plotChip: {
    backgroundColor: colors.bgSubtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plotChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  plotChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  plotChipTextSelected: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.bgApp,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.bgApp,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgApp,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gpsSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gpsCaptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentBlue,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  gpsCaptureBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
