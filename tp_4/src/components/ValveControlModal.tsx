import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert as NativeAlert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommandAction, IrrigationCommand, PlotWithTelemetry, Valve } from '../types/agropulse.types';
import { useAuth } from '../context/AuthContext';
import { useAgro } from '../context/AgroContext';
import { colors } from '../theme/colors';

interface ValveControlModalProps {
  visible: boolean;
  plot: PlotWithTelemetry;
  onClose: () => void;
}

export const ValveControlModal: React.FC<ValveControlModalProps> = ({
  visible,
  plot,
  onClose,
}) => {
  const { user } = useAuth();
  const { commands, sendIrrigationCommand, cancelPendingCommand } = useAgro();

  const [selectedValve, setSelectedValve] = useState<Valve | null>(plot.valves[0] || null);
  const [action, setAction] = useState<CommandAction>('open');
  const [durationMin, setDurationMin] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isAdvisor = user?.role === 'advisor';

  // Find pending command for selected valve if any
  const pendingCommandForValve = commands.find(
    (c) => c.valve_id === selectedValve?.id && c.status === 'pending'
  );

  const handleSendCommand = async () => {
    if (!selectedValve) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Advisor check (OA-1, H2)
    if (isAdvisor) {
      setErrorMessage('Permiso denegado (403): El rol Asesor no puede emitir órdenes de irrigación.');
      return;
    }

    // 2. RF-16 validation check
    if (pendingCommandForValve) {
      setErrorMessage('Operación rechazada (RF-16): Ya existe un comando pendiente sobre esta válvula.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendIrrigationCommand({
        valveId: selectedValve.id,
        plotId: plot.id,
        action,
        durationMin: action === 'open' ? durationMin : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Error al emitir comando de irrigación');
      } else {
        setSuccessMessage(
          `Comando emitido exitosamente. En proceso de aplicación (${action.toUpperCase()} ${
            action === 'open' ? `por ${durationMin} min` : ''
          }).`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPending = async (cmdId: string) => {
    try {
      const res = await cancelPendingCommand(cmdId);
      if (res.success) {
        setSuccessMessage('Comando cancelado exitosamente.');
      } else {
        setErrorMessage(res.error || 'No se pudo cancelar el comando.');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Recent commands for this plot's valves
  const plotCommands = commands
    .filter((c) => plot.valves.some((v) => v.id === c.valve_id))
    .slice(0, 10);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="sprinkler-variant" size={24} color={colors.primary} />
              <Text style={styles.title}>Control de Riego — {plot.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Advisor restriction banner */}
            {isAdvisor && (
              <View style={styles.advisorWarning}>
                <MaterialCommunityIcons name="shield-alert-outline" size={20} color="#C2410C" />
                <Text style={styles.advisorWarningText}>
                  Estás conectado como <Text style={{ fontWeight: 'bold' }}>Asesor</Text>. Tu rol es
                  exclusivamente de solo lectura; los actuadores están bloqueados.
                </Text>
              </View>
            )}

            {/* Error or Success feedback */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#B91C1C" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {successMessage && (
              <View style={styles.successBanner}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#15803D" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Valve selection */}
            <Text style={styles.sectionLabel}>Seleccionar Válvula del Lote</Text>
            <View style={styles.valvesContainer}>
              {plot.valves.map((v) => {
                const isSelected = selectedValve?.id === v.id;
                const isOpen = v.status === 'open';
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.valveOption,
                      isSelected && styles.valveOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedValve(v);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={isOpen ? 'valve-open' : 'valve-closed'}
                      size={22}
                      color={isOpen ? colors.primaryLight : colors.statusStale}
                    />
                    <View style={styles.valveInfo}>
                      <Text style={styles.valveName}>{v.name}</Text>
                      <Text
                        style={[
                          styles.valveStatus,
                          { color: isOpen ? colors.primaryLight : colors.statusStale },
                        ]}
                      >
                        Estado actual: {isOpen ? 'ABIERTA' : 'CERRADA'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* In-flight Pending command indicator (RF-15, RF-16) */}
            {pendingCommandForValve && (
              <View style={styles.pendingCard}>
                <View style={styles.pendingHeader}>
                  <ActivityIndicator size="small" color="#E65100" />
                  <Text style={styles.pendingTitle}>Comando en Vuelo (Pending)</Text>
                </View>
                <Text style={styles.pendingDesc}>
                  Acción: {pendingCommandForValve.action.toUpperCase()}
                  {pendingCommandForValve.duration_min
                    ? ` • ${pendingCommandForValve.duration_min} min`
                    : ''}
                </Text>
                <Text style={styles.pendingId}>
                  ID: {pendingCommandForValve.client_request_id.slice(0, 8)}...
                </Text>
                {!isAdvisor && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancelPending(pendingCommandForValve.id)}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar Comando</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Action Selection */}
            <Text style={styles.sectionLabel}>Acción a Ejecutar</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  action === 'open' && styles.actionButtonActive,
                ]}
                onPress={() => setAction('open')}
              >
                <MaterialCommunityIcons
                  name="play-circle-outline"
                  size={20}
                  color={action === 'open' ? '#FFFFFF' : colors.primary}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    action === 'open' && styles.actionButtonTextActive,
                  ]}
                >
                  Abrir / Regar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  action === 'close' && styles.actionButtonActiveClose,
                ]}
                onPress={() => setAction('close')}
              >
                <MaterialCommunityIcons
                  name="stop-circle-outline"
                  size={20}
                  color={action === 'close' ? '#FFFFFF' : '#D32F2F'}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    action === 'close' && styles.actionButtonTextActive,
                  ]}
                >
                  Cerrar Válvula
                </Text>
              </TouchableOpacity>
            </View>

            {/* Duration Selector when action is 'open' */}
            {action === 'open' && (
              <View style={styles.durationSection}>
                <Text style={styles.sectionLabel}>Duración del Riego: {durationMin} min</Text>
                <View style={styles.durationChips}>
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      style={[
                        styles.chip,
                        durationMin === mins && styles.chipSelected,
                      ]}
                      onPress={() => setDurationMin(mins)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          durationMin === mins && styles.chipTextSelected,
                        ]}
                      >
                        {mins}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Submit CTA */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (isAdvisor || Boolean(pendingCommandForValve) || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSendCommand}
              disabled={isAdvisor || Boolean(pendingCommandForValve) || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {action === 'open'
                      ? `Confirmar Orden de Riego (${durationMin} min)`
                      : 'Confirmar Cierre de Válvula'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Recent Commands Audit History (RF-18) */}
            {plotCommands.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Últimos Comandos Auditados (RF-18)</Text>
                {plotCommands.map((cmd) => (
                  <View key={cmd.id} style={styles.historyItem}>
                    <View style={styles.historyRow}>
                      <Text style={styles.historyAction}>
                        {cmd.action.toUpperCase()}{' '}
                        {cmd.duration_min ? `(${cmd.duration_min} min)` : ''}
                      </Text>
                      <View
                        style={[
                          styles.statusBadgeSmall,
                          {
                            backgroundColor:
                              cmd.status === 'applied'
                                ? '#DCFCE7'
                                : cmd.status === 'failed'
                                ? '#FEE2E2'
                                : cmd.status === 'cancelled'
                                ? '#F3F4F6'
                                : '#FEF3C7',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeSmallText,
                            {
                              color:
                                cmd.status === 'applied'
                                  ? '#166534'
                                  : cmd.status === 'failed'
                                  ? '#991B1B'
                                  : cmd.status === 'cancelled'
                                  ? '#374151'
                                  : '#92400E',
                            },
                          ]}
                        >
                          {cmd.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(cmd.created_at).toLocaleTimeString()} • Id: {cmd.client_request_id.slice(0, 8)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  advisorWarning: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  advisorWarningText: {
    fontSize: 12,
    color: '#9A3412',
    flex: 1,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  successText: {
    fontSize: 12,
    color: '#15803D',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 6,
  },
  valvesContainer: {
    gap: 8,
    marginBottom: 16,
  },
  valveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  valveOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  valveInfo: {
    flex: 1,
  },
  valveName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  valveStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentAmber,
  },
  pendingDesc: {
    fontSize: 12,
    color: '#451A03',
    marginTop: 4,
  },
  pendingId: {
    fontSize: 10,
    color: '#78350F',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  cancelBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.accentRed,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.bgSubtle,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
  },
  actionButtonActiveClose: {
    backgroundColor: colors.accentRed,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
  durationSection: {
    marginBottom: 16,
  },
  durationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    backgroundColor: colors.bgSubtle,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  historySection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.bgSubtle,
    paddingTop: 12,
  },
  historyItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeSmallText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
