import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCooldown } from '../../hooks/useCooldown';
import { isValidEmailFormat } from '../../utils/validationRules';
import { BankHeader } from '../../components/common/BankHeader';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { CooldownTimerBadge } from '../../components/common/CooldownTimerBadge';

interface ForgotPasswordScreenProps {
  initialEmail?: string;
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  initialEmail = '',
  onNavigateToLogin,
}) => {
  const colors = useThemeColors();
  const { sendPasswordReset } = useAuth();
  const { secondsLeft, isActive: isCooldownActive, startCooldown } = useCooldown(60);

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEmailValid = useMemo(() => isValidEmailFormat(email), [email]);
  const isButtonDisabled = !isEmailValid || isLoading || isCooldownActive;

  const handleResetRequest = async () => {
    if (isButtonDisabled) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await sendPasswordReset(email);

      if (!result.success && result.error) {
        if (result.error.isRateLimit) {
          startCooldown(60);
          setErrorMessage(result.error.userMessage);
        } else {
          setHasSubmitted(true);
          startCooldown(60);
        }
        return;
      }

      setHasSubmitted(true);
      startCooldown(60);
    } catch {
      setHasSubmitted(true);
      startCooldown(60);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <BankHeader
          title="Recuperar Contraseña"
          subtitle="Ingresá tu correo para recibir las instrucciones de restablecimiento."
          onBack={onNavigateToLogin}
        />

        {hasSubmitted ? (
          <View
            style={[
              styles.successCard,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.successTitle, { color: colors.primaryLight }]}>
              Solicitud de Restablecimiento Enviada
            </Text>
            <Text style={[styles.successBody, { color: colors.textSecondary }]}>
              Si el email existe en nuestro sistema, vas a recibir instrucciones para generar tu nueva clave bancaria en breve.
            </Text>
            <Text style={[styles.securityNotice, { color: colors.textMuted }]}>
              Por motivos de seguridad y para proteger tu cuenta bancaria, no revelamos si la casilla se encuentra o no registrada.
            </Text>

            <CooldownTimerBadge
              secondsLeft={secondsLeft}
              message="Podrás solicitar otro correo en"
            />

            <CustomButton
              title="Volver al Inicio de Sesión"
              onPress={onNavigateToLogin}
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            {errorMessage ? (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.errorLight, borderColor: colors.error },
                ]}
              >
                <Text style={[styles.errorBannerText, { color: colors.error }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <CustomInput
              label="Correo electrónico"
              placeholder="ejemplo@banco.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              iconName="mail-outline"
              editable={!isLoading && !isCooldownActive}
            />

            <CooldownTimerBadge
              secondsLeft={secondsLeft}
              message="Podrás enviar otra solicitud en"
            />

            <CustomButton
              title={
                isCooldownActive
                  ? `Reintentar en ${secondsLeft}s`
                  : 'Enviar instrucciones'
              }
              onPress={handleResetRequest}
              loading={isLoading}
              loadingText="Enviando solicitud..."
              disabled={isButtonDisabled}
              style={styles.submitButton}
            />

            <CustomButton
              title="Cancelar y Volver"
              onPress={onNavigateToLogin}
              variant="ghost"
              disabled={isLoading}
              style={{ marginTop: 10 }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  formContainer: {
    marginTop: 8,
  },
  errorBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
  },
  successCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  successBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  securityNotice: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 8,
  },
});
