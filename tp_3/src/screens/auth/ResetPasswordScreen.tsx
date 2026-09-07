import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import {
  validatePasswordCriteria,
  doPasswordsMatch,
} from '../../utils/validationRules';
import { BankHeader } from '../../components/common/BankHeader';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { PasswordCriteriaChecklist } from '../../components/common/PasswordCriteriaChecklist';

interface ResetPasswordScreenProps {
  onNavigateToLogin: (successMessage?: string) => void;
  onRequestNewReset: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  onNavigateToLogin,
  onRequestNewReset,
}) => {
  const colors = useThemeColors();
  const { updatePassword, recoveryError, isRecoveryMode, clearRecoveryMode } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const passwordValidation = useMemo(
    () => validatePasswordCriteria(password),
    [password]
  );
  const isPasswordMatching = useMemo(
    () => doPasswordsMatch(password, confirmPassword),
    [password, confirmPassword]
  );

  const isFormValid =
    passwordValidation.isValid && isPasswordMatching && !generalError;

  const handleUpdatePassword = async () => {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setGeneralError(null);

    try {
      const result = await updatePassword(password);

      if (!result.success && result.error) {
        setGeneralError(result.error.userMessage);
        return;
      }

      clearRecoveryMode();
      onNavigateToLogin(
        'Contraseña actualizada con éxito. Iniciá sesión con tu nueva contraseña.'
      );
    } catch {
      setGeneralError('Error al actualizar la contraseña. Intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (recoveryError || (!isRecoveryMode && !recoveryError)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorStateContainer}>
          <View
            style={[
              styles.errorIconCircle,
              { backgroundColor: colors.errorLight, borderColor: colors.error },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          </View>

          <Text style={[styles.errorStateTitle, { color: colors.textPrimary }]}>
            Enlace Inválido o Expirado
          </Text>

          <Text style={[styles.errorStateDescription, { color: colors.textSecondary }]}>
            {recoveryError ||
              'No se detectó una sesión válida de recuperación. El enlace puede haber vencido o ya fue utilizado.'}
          </Text>

          <CustomButton
            title="Solicitar nuevo enlace de recuperación"
            onPress={onRequestNewReset}
            style={{ marginTop: 20 }}
          />

          <CustomButton
            title="Volver a Iniciar Sesión"
            onPress={() => onNavigateToLogin()}
            variant="ghost"
            style={{ marginTop: 10 }}
          />
        </View>
      </View>
    );
  }

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
          title="Nueva Contraseña"
          subtitle="Definí una nueva clave segura para tu cuenta bancaria iBank."
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

        <View style={styles.formContainer}>
          <CustomInput
            label="Nueva contraseña"
            placeholder="Ingresá tu nueva clave"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (generalError) setGeneralError(null);
            }}
            isPassword
            iconName="lock-closed-outline"
            editable={!isLoading}
          />

          <PasswordCriteriaChecklist
            validation={passwordValidation}
            passwordLength={password.length}
            showWhenEmpty={true}
          />

          <CustomInput
            label="Confirmar nueva contraseña"
            placeholder="Reescribí tu clave"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (generalError) setGeneralError(null);
            }}
            isPassword
            iconName="shield-outline"
            errorMessage={
              confirmPassword.length > 0 && !isPasswordMatching
                ? 'Las contraseñas no coinciden'
                : undefined
            }
            editable={!isLoading}
          />

          <CustomButton
            title="Guardar nueva contraseña"
            onPress={handleUpdatePassword}
            loading={isLoading}
            loadingText="Actualizando..."
            disabled={!isFormValid}
            style={styles.submitButton}
          />

          <CustomButton
            title="Cancelar"
            onPress={() => {
              clearRecoveryMode();
              onNavigateToLogin();
            }}
            variant="ghost"
            disabled={isLoading}
            style={{ marginTop: 10 }}
          />
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
    paddingBottom: 40,
  },
  formContainer: {
    marginTop: 6,
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
    marginTop: 10,
  },
  errorStateContainer: {
    flex: 1,
    paddingHorizontal: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorStateDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
});
