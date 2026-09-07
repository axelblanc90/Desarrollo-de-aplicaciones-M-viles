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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import {
  isValidEmailFormat,
  validatePasswordCriteria,
  doPasswordsMatch,
} from '../../utils/validationRules';
import { BankHeader } from '../../components/common/BankHeader';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';
import { PasswordCriteriaChecklist } from '../../components/common/PasswordCriteriaChecklist';
import { TermsModal } from '../../components/common/TermsModal';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToConfirmationPending: (email: string) => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onNavigateToLogin,
  onNavigateToConfirmationPending,
}) => {
  const colors = useThemeColors();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isNameValid = fullName.trim().length >= 3;
  const isEmailValid = useMemo(() => isValidEmailFormat(email), [email]);
  const passwordValidation = useMemo(
    () => validatePasswordCriteria(password),
    [password]
  );
  const isPasswordMatching = useMemo(
    () => doPasswordsMatch(password, confirmPassword),
    [password, confirmPassword]
  );

  const isFormValid =
    isNameValid &&
    isEmailValid &&
    passwordValidation.isValid &&
    isPasswordMatching &&
    acceptedTerms;

  const handleSignUp = async () => {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setGeneralError(null);

    try {
      const result = await signUp(email, password, fullName);

      if (!result.success && result.error) {
        setGeneralError(result.error.userMessage);
        return;
      }

      onNavigateToConfirmationPending(email.trim());
    } catch {
      onNavigateToConfirmationPending(email.trim());
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
          title="Crear Cuenta"
          subtitle="Abrí tu cuenta digital iBank en simples pasos con máxima seguridad."
          onBack={onNavigateToLogin}
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
            label="Nombre y Apellido completo"
            placeholder="Santiago Romero"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            iconName="person-outline"
            editable={!isLoading}
          />

          <CustomInput
            label="Correo electrónico"
            placeholder="ejemplo@banco.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            iconName="mail-outline"
            editable={!isLoading}
          />

          <CustomInput
            label="Contraseña segura"
            placeholder="Crea una clave bancaria"
            value={password}
            onChangeText={setPassword}
            isPassword
            iconName="lock-closed-outline"
            editable={!isLoading}
          />

          <PasswordCriteriaChecklist
            validation={passwordValidation}
            passwordLength={password.length}
            showWhenEmpty={false}
          />

          <CustomInput
            label="Confirmar contraseña"
            placeholder="Reescribí tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            iconName="shield-outline"
            errorMessage={
              confirmPassword.length > 0 && !isPasswordMatching
                ? 'Las contraseñas no coinciden'
                : undefined
            }
            editable={!isLoading}
          />

          <View style={styles.termsRow}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                {
                  backgroundColor: acceptedTerms
                    ? colors.primary
                    : colors.inputBackground,
                  borderColor: acceptedTerms
                    ? colors.primary
                    : colors.inputBorder,
                },
              ]}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={isLoading}
              activeOpacity={0.8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
            >
              {acceptedTerms && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <View style={styles.termsTextContainer}>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                Acepto los{' '}
              </Text>
              <TouchableOpacity
                onPress={() => setShowTermsModal(true)}
                disabled={isLoading}
              >
                <Text style={[styles.termsLink, { color: colors.primaryLight }]}>
                  Términos, Condiciones y Políticas
                </Text>
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                {' '}de iBank.
              </Text>
            </View>
          </View>

          <CustomButton
            title="Crear mi cuenta"
            onPress={handleSignUp}
            loading={isLoading}
            loadingText="Creando cuenta..."
            disabled={!isFormValid}
            style={styles.submitButton}
          />

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              ¿Ya tenés cuenta en iBank?{' '}
            </Text>
            <TouchableOpacity
              onPress={onNavigateToLogin}
              disabled={isLoading}
              style={styles.loginLink}
            >
              <Text style={[styles.loginText, { color: colors.primaryLight }]}>
                Iniciá sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setAcceptedTerms(true)}
      />
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 13,
  },
  termsLink: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitButton: {
    marginTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    paddingVertical: 4,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
