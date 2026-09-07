import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ConfirmationPendingScreen } from '../screens/auth/ConfirmationPendingScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { HomeScreen } from '../screens/home/HomeScreen';

type ActiveAuthScreen =
  | 'login'
  | 'signUp'
  | 'confirmationPending'
  | 'forgotPassword'
  | 'resetPassword';

export const AppNavigator: React.FC = () => {
  const colors = useThemeColors();
  const { session, isLoading, isRecoveryMode, clearRecoveryMode } = useAuth();

  const [currentAuthScreen, setCurrentAuthScreen] = useState<ActiveAuthScreen>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [loginBannerMessage, setLoginBannerMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.splashIconCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
        </View>
        <Text style={[styles.splashTitle, { color: colors.textPrimary }]}>
          i<Text style={{ color: colors.secondary }}>Bank</Text>
        </Text>
        <ActivityIndicator
          size="small"
          color={colors.secondary}
          style={{ marginTop: 24 }}
        />
        <Text style={[styles.splashSubtitle, { color: colors.textSecondary }]}>
          Iniciando entorno seguro...
        </Text>
      </View>
    );
  }

  if (session && !isRecoveryMode) {
    return <HomeScreen />;
  }

  if (isRecoveryMode || currentAuthScreen === 'resetPassword') {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
            paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 36 : 0,
          },
        ]}
      >
        <ResetPasswordScreen
          onNavigateToLogin={(msg) => {
            clearRecoveryMode();
            if (msg) setLoginBannerMessage(msg);
            setCurrentAuthScreen('login');
          }}
          onRequestNewReset={() => {
            clearRecoveryMode();
            setCurrentAuthScreen('forgotPassword');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 36 : 0,
        },
      ]}
    >
      {loginBannerMessage && currentAuthScreen === 'login' ? (
        <View
          style={[
            styles.bannerContainer,
            { backgroundColor: colors.successLight, borderColor: colors.success },
          ]}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
          <Text style={[styles.bannerText, { color: colors.success }]}>
            {loginBannerMessage}
          </Text>
        </View>
      ) : null}

      {currentAuthScreen === 'login' && (
        <LoginScreen
          onNavigateToSignUp={() => {
            setLoginBannerMessage(null);
            setCurrentAuthScreen('signUp');
          }}
          onNavigateToForgotPassword={() => {
            setLoginBannerMessage(null);
            setCurrentAuthScreen('forgotPassword');
          }}
          onNavigateToConfirmationPending={(email) => {
            setPendingEmail(email);
            setCurrentAuthScreen('confirmationPending');
          }}
        />
      )}

      {currentAuthScreen === 'signUp' && (
        <SignUpScreen
          onNavigateToLogin={() => setCurrentAuthScreen('login')}
          onNavigateToConfirmationPending={(email) => {
            setPendingEmail(email);
            setCurrentAuthScreen('confirmationPending');
          }}
        />
      )}

      {currentAuthScreen === 'confirmationPending' && (
        <ConfirmationPendingScreen
          email={pendingEmail || 'usuario@ejemplo.com'}
          onNavigateToLogin={() => setCurrentAuthScreen('login')}
        />
      )}

      {currentAuthScreen === 'forgotPassword' && (
        <ForgotPasswordScreen
          initialEmail={pendingEmail}
          onNavigateToLogin={() => setCurrentAuthScreen('login')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  splashSubtitle: {
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
