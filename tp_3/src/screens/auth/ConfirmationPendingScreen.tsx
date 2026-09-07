import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCooldown } from '../../hooks/useCooldown';
import { BankHeader } from '../../components/common/BankHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { CooldownTimerBadge } from '../../components/common/CooldownTimerBadge';

interface ConfirmationPendingScreenProps {
  email: string;
  onNavigateToLogin: () => void;
}

export const ConfirmationPendingScreen: React.FC<ConfirmationPendingScreenProps> = ({
  email,
  onNavigateToLogin,
}) => {
  const colors = useThemeColors();
  const { resendConfirmation } = useAuth();
  const { secondsLeft, isActive: isCooldownActive, startCooldown } = useCooldown(60);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState(false);

  const handleResend = async () => {
    if (isLoading || isCooldownActive) return;

    setIsLoading(true);
    setStatusMessage(null);
    setIsErrorMessage(false);

    try {
      const result = await resendConfirmation(email);

      if (!result.success && result.error) {
        if (result.error.isRateLimit) {
          startCooldown(60);
        }
        setStatusMessage(result.error.userMessage);
        setIsErrorMessage(true);
        return;
      }

      startCooldown(60);
      setStatusMessage('¡Enlace reenviado con éxito! Revisá tu bandeja de entrada o spam.');
      setIsErrorMessage(false);
    } catch {
      setStatusMessage('Ocurrió un error al reenviar el correo. Intentá nuevamente.');
      setIsErrorMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BankHeader
          title="Verificá tu Correo"
          subtitle="Te enviamos un enlace de confirmación para activar tu cuenta iBank."
          onBack={onNavigateToLogin}
        />

        <View style={styles.contentCard}>
          <View
            style={[
              styles.mailIconCircle,
              { backgroundColor: colors.surfaceHighlight, borderColor: colors.surfaceBorder },
            ]}
          >
            <Ionicons name="mail-unread-outline" size={44} color={colors.primaryLight} />
          </View>

          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Enviamos un correo electrónico a:
          </Text>

          <View
            style={[
              styles.emailBadge,
              { backgroundColor: colors.inputBackground, borderColor: colors.surfaceBorder },
            ]}
          >
            <Ionicons
              name="lock-closed"
              size={14}
              color={colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.emailText, { color: colors.textPrimary }]} numberOfLines={1}>
              {email}
            </Text>
          </View>

          <Text style={[styles.instructionText, { color: colors.textMuted }]}>
            Hacé clic en el botón de confirmación que recibiste para habilitar tus operaciones. Al hacerlo, ingresarás automáticamente al sistema.
          </Text>

          {statusMessage ? (
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor: isErrorMessage ? colors.errorLight : colors.successLight,
                  borderColor: isErrorMessage ? colors.error : colors.success,
                },
              ]}
            >
              <Text
                style={[
                  styles.feedbackText,
                  { color: isErrorMessage ? colors.error : colors.success },
                ]}
              >
                {statusMessage}
              </Text>
            </View>
          ) : null}

          <CooldownTimerBadge
            secondsLeft={secondsLeft}
            message="Podrás reenviar en"
          />

          <View style={styles.actionContainer}>
            <CustomButton
              title={
                isCooldownActive
                  ? `Reenviar en ${secondsLeft}s`
                  : 'Reenviar email de confirmación'
              }
              onPress={handleResend}
              loading={isLoading}
              loadingText="Enviando..."
              disabled={isCooldownActive}
              variant="outline"
              iconName="refresh-outline"
              style={styles.resendButton}
            />

            <CustomButton
              title="Volver a Iniciar Sesión"
              onPress={onNavigateToLogin}
              variant="ghost"
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },
  contentCard: {
    alignItems: 'center',
    marginTop: 10,
  },
  mailIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    maxWidth: '90%',
  },
  emailText: {
    fontSize: 15,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    marginTop: 12,
    gap: 10,
  },
  resendButton: {
    marginBottom: 4,
  },
});
