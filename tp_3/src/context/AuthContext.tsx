import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapSupabaseAuthError, MappedAuthError } from '../utils/errorMapper';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isRecoveryMode: boolean;
  recoveryError: string | null;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: MappedAuthError }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ success: boolean; error?: MappedAuthError }>;
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: MappedAuthError }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: MappedAuthError }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: MappedAuthError }>;
  signOut: () => Promise<void>;
  clearRecoveryMode: () => void;
  mockLoginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(!isSupabaseConfigured);

  const handleDeepLinkUrl = useCallback(async (url: string | null) => {
    if (!url) return;

    try {
      const parsed = Linking.parse(url);

      if (parsed.path === 'reset-password' || url.includes('reset-password')) {
        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        if (parsed.queryParams?.access_token) {
          accessToken = parsed.queryParams.access_token as string;
          refreshToken = (parsed.queryParams.refresh_token as string) || '';
        } else if (url.includes('#')) {
          const hash = url.split('#')[1];
          const hashParams = new URLSearchParams(hash);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token') || '';
        }

        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            setRecoveryError('El enlace de recuperación ha expirado o no es válido.');
            setIsRecoveryMode(true);
            return;
          }
        }

        setIsRecoveryMode(true);
        setRecoveryError(null);
      } else if (parsed.path === 'confirm' || url.includes('confirm')) {
        if (url.includes('#')) {
          const hash = url.split('#')[1];
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || '';

          if (accessToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    } catch {
      setRecoveryError('Ocurrió un error al procesar el enlace de autenticación.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const {
            data: { session: existingSession },
          } = await supabase.auth.getSession();

          if (isMounted) {
            setSession(existingSession);
            setUser(existingSession?.user ?? null);
          }
        }

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && isMounted) {
          await handleDeepLinkUrl(initialUrl);
        }
      } catch {
        // Fallback gracefully on initialization issues
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setRecoveryError(null);
      } else if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
        setRecoveryError(null);
      }
    });

    const urlSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLinkUrl(event.url);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      urlSubscription.remove();
    };
  }, [handleDeepLinkUrl]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || isMockMode) {
      if (email.toLowerCase().includes('unconfirmed')) {
        return {
          success: false,
          error: mapSupabaseAuthError({ code: 'email_not_confirmed' }),
        };
      }
      if (password === 'wrongpass' || password === 'error') {
        return {
          success: false,
          error: mapSupabaseAuthError({ code: 'invalid_credentials' }),
        };
      }

      const mockUser: User = {
        id: 'mock-user-12345',
        app_metadata: {},
        user_metadata: { full_name: 'Usuario iBank' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: email.trim(),
      };
      const mockSession: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      setUser(mockUser);
      setSession(mockSession);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
      }

      setSession(data.session);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: mapSupabaseAuthError(err) };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectTo = Linking.createURL('confirm');

    if (!isSupabaseConfigured || isMockMode) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: mapSupabaseAuthError(err) };
    }
  };

  const resendConfirmation = async (email: string) => {
    if (!isSupabaseConfigured || isMockMode) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: mapSupabaseAuthError(err) };
    }
  };

  const sendPasswordReset = async (email: string) => {
    const redirectTo = Linking.createURL('reset-password');

    if (!isSupabaseConfigured || isMockMode) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: mapSupabaseAuthError(err) };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured || isMockMode) {
      await signOut();
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: mapSupabaseAuthError(error) };
      }

      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsRecoveryMode(false);
      setRecoveryError(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: mapSupabaseAuthError(err) };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error during Supabase signOut:', err);
    } finally {
      setSession(null);
      setUser(null);
      setIsRecoveryMode(false);
      setRecoveryError(null);
    }
  };

  const clearRecoveryMode = () => {
    setIsRecoveryMode(false);
    setRecoveryError(null);
  };

  const mockLoginAsDemo = () => {
    setIsMockMode(true);
    const demoUser: User = {
      id: 'demo-user-ibank-01',
      app_metadata: {},
      user_metadata: { full_name: 'Santiago Romero' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'santiago.romero@ibank.com',
    };
    setUser(demoUser);
    setSession({
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: demoUser,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isRecoveryMode,
        recoveryError,
        isMockMode,
        signIn,
        signUp,
        resendConfirmation,
        sendPasswordReset,
        updatePassword,
        signOut,
        clearRecoveryMode,
        mockLoginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
