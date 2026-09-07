import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToConfirmationPending: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onNavigateToConfirmationPending,
}) => {
  const colors = useThemeColors();
  const { signIn, isMockMode, mockLoginAsDemo } = useAuth();
  const { secondsLeft, isActive: isCooldownActive, startCooldown } = useCooldown(60);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isEmailValid = useMemo(() => isValidEmailFormat(email), [email]);
  const isPasswordProvided = useMemo(() => password.trim().length > 0, [password]);
  const isFormValid = isEmailValid && isPasswordProvided && !isCooldownActive;

  const handleSignIn = async () => {
    if (!isFormValid || isLoading || isCooldownActive) return;

    setIsLoading(true);
    setGeneralError(null);

    try {
      const result = await signIn(email, password);

      if (!result.success && result.error) {
        if (result.error.isEmailNotConfirmed) {
          onNavigateToConfirmationPending(email.trim());
          return;
        }

        if (result.error.isRateLimit) {
          startCooldown(60);
        }

        setGeneralError(result.error.userMessage);
      }
    } catch {
      setGeneralError('Email o contraseña incorrectos.');
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
          title="Iniciar Sesión"
          subtitle="Ingresá tus credenciales bancarias para operar con seguridad."
        />

        {generalError ? (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: colors.errorLight, borderColor: colors.error },
            ]}
          >
            <Text style={[styles.errorBannerText, { color: colors.error }]}>
              {generalError}
            </Text>
          </View>
        ) : null}

        <CooldownTimerBadge
          secondsLeft={secondsLeft}
          message="Límite alcanzado. Reintentá en"
        />

        <View style={styles.formContainer}>
          <CustomInput
            label="Correo electrónico"
            placeholder="ejemplo@banco.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (generalError) setGeneralError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            iconName="mail-outline"
            editable={!isLoading && !isCooldownActive}
          />

          <CustomInput
            label="Contraseña"
            placeholder="Ingresá tu clave"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (generalError) setGeneralError(null);
            }}
            isPassword
            iconName="lock-closed-outline"
            editable={!isLoading && !isCooldownActive}
          />

          <View style={styles.forgotRow}>
            <TouchableOpacity
              onPress={onNavigateToForgotPassword}
              disabled={isLoading}
              style={styles.forgotButton}
            >
              <Text style={[styles.forgotText, { color: colors.secondary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title={isCooldownActive ? `Esperá ${secondsLeft}s` : 'Ingresar'}
            onPress={handleSignIn}
            loading={isLoading}
            loadingText="Autenticando..."
            disabled={!isFormValid || isCooldownActive}
            style={styles.submitButton}
          />

          {isMockMode && (
            <TouchableOpacity
              onPress={mockLoginAsDemo}
              style={[
                styles.demoButton,
                { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
              ]}
            >
              <Text style={[styles.demoButtonText, { color: colors.primaryLight }]}>
                ⚡ Acceso Rápido Demo (Modo Prueba)
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              ¿No tenés una cuenta iBank?{' '}
            </Text>
            <TouchableOpacity
              onPress={onNavigateToSignUp}
              disabled={isLoading}
              style={styles.registerLink}
            >
              <Text style={[styles.registerText, { color: colors.primaryLight }]}>
                Registrate acá
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 36,
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
    lineHeight: 18,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 4,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotButton: {
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 4,
  },
  demoButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    paddingVertical: 4,
  },
  registerText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
