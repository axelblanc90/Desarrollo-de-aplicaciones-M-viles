import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface LogoutConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const colors = useThemeColors();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await onConfirm();
    } finally {
      setIsLoggingOut(false);
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isLoggingOut) onCancel();
      }}
    >
      <TouchableWithoutFeedback onPress={() => !isLoggingOut && onCancel()}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
              ]}
            >
              <View
                style={[
                  styles.iconSlot,
                  { backgroundColor: colors.errorLight, borderColor: colors.error },
                ]}
              >
                <Ionicons name="log-out-outline" size={28} color={colors.error} />
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                ¿Cerrar Sesión?
              </Text>

              <Text style={[styles.message, { color: colors.textSecondary }]}>
                ¿Estás seguro de que deseás cerrar la sesión en este dispositivo? Deberás ingresar tus credenciales nuevamente para acceder.
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.surfaceHighlight,
                      borderColor: colors.surfaceBorder,
                    },
                  ]}
                  onPress={onCancel}
                  disabled={isLoggingOut}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.error },
                  ]}
                  onPress={handleConfirm}
                  disabled={isLoggingOut}
                  activeOpacity={0.8}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Cerrar Sesión</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconSlot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
