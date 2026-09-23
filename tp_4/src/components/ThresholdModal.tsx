import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlotWithTelemetry } from '../types/agropulse.types';
import { useAuth } from '../context/AuthContext';
import { useAgro } from '../context/AgroContext';
import { colors } from '../theme/colors';

interface ThresholdModalProps {
  visible: boolean;
  plot: PlotWithTelemetry;
  onClose: () => void;
}

export const ThresholdModal: React.FC<ThresholdModalProps> = ({
  visible,
  plot,
  onClose,
}) => {
  const { user } = useAuth();
  const { updatePlotThresholds } = useAgro();

  const [minVal, setMinVal] = useState<string>(String(plot.threshold_min));
  const [maxVal, setMaxVal] = useState<string>(String(plot.threshold_max));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdvisor = user?.role === 'advisor';

  const handleSave = async () => {
    setErrorMsg(null);
    const minNum = parseFloat(minVal);
    const maxNum = parseFloat(maxVal);

    if (isNaN(minNum) || isNaN(maxNum)) {
      setErrorMsg('Ingrese valores numéricos válidos para los umbrales.');
      return;
    }

    if (minNum < 0 || maxNum > 100) {
      setErrorMsg('Los porcentajes deben estar entre 0% y 100%.');
      return;
    }

    if (minNum >= maxNum) {
      setErrorMsg('El umbral mínimo debe ser estrictamente menor al máximo.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updatePlotThresholds(plot.id, minNum, maxNum);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Configurar Umbrales — {plot.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isAdvisor && (
            <View style={styles.advisorNotice}>
              <MaterialCommunityIcons name="lock-outline" size={18} color="#9A3412" />
              <Text style={styles.advisorNoticeText}>
                Los asesores no tienen permisos para modificar umbrales (solo lectura).
              </Text>
            </View>
          )}

          {errorMsg && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#B91C1C" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.helperText}>
            Define los límites volumétricos de humedad (%) para disparar el semáforo (Seco &lt; Mínimo,
            Húmedo &gt; Máximo).
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Umbral Mínimo (Alerta de Riego) %</Text>
            <TextInput
              style={[styles.input, isAdvisor && styles.inputDisabled]}
              value={minVal}
              onChangeText={setMinVal}
              keyboardType="numeric"
              editable={!isAdvisor && !isSaving}
              placeholder="Ej: 25"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Umbral Máximo (Saturación) %</Text>
            <TextInput
              style={[styles.input, isAdvisor && styles.inputDisabled]}
              value={maxVal}
              onChangeText={setMaxVal}
              keyboardType="numeric"
              editable={!isAdvisor && !isSaving}
              placeholder="Ej: 45"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cerrar</Text>
            </TouchableOpacity>
            {!isAdvisor && (
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveText}>Guardar Umbrales</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  advisorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  advisorNoticeText: {
    fontSize: 11,
    color: '#9A3412',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    gap: 6,
  },
  errorText: {
    fontSize: 11,
    color: '#B91C1C',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
