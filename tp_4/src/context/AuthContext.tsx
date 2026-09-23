import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Membership, Organization, UserRole } from '../types/agropulse.types';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthContextType {
  user: UserProfile | null;
  organization: Organization | null;
  organizations: Organization[];
  membership: Membership | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
}

const DEMO_ORG: Organization = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Estancia Didáctica Concordia',
  region: 'Concordia, Entre Ríos',
};

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  producer: {
    id: 'u0000000-0000-0000-0000-000000000001',
    email: 'productor@agropulse.test',
    fullName: 'Carlos Productor',
    role: 'producer',
  },
  operator: {
    id: 'u0000000-0000-0000-0000-000000000002',
    email: 'operador@agropulse.test',
    fullName: 'Mateo Operador',
    role: 'operator',
  },
  advisor: {
    id: 'u0000000-0000-0000-0000-000000000003',
    email: 'asesor@agropulse.test',
    fullName: 'Ing. Agr. Lucía Asesora',
    role: 'advisor',
  },
};

const AUTH_STORAGE_KEY = '@agropulse:session_profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(DEMO_ORG);
  const [organizations] = useState<Organization[]>([DEMO_ORG]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore stored session on startup
  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setMembership({
            id: 'm-' + parsed.id,
            user_id: parsed.id,
            organization_id: DEMO_ORG.id,
            role: parsed.role,
          });
        }
      } catch (err) {
        console.error('[AUTH] Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      // 1. Check if matches one of our demo users directly
      const foundDemoRole = (Object.keys(DEMO_USERS) as UserRole[]).find(
        (role) => DEMO_USERS[role].email.toLowerCase() === email.trim().toLowerCase()
      );

      if (foundDemoRole) {
        const profile = DEMO_USERS[foundDemoRole];
        setUser(profile);
        setMembership({
          id: 'm-' + profile.id,
          user_id: profile.id,
          organization_id: DEMO_ORG.id,
          role: profile.role,
        });
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return {};
      }

      // 2. If Supabase is configured, attempt real authentication
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          // Fetch membership role from Supabase
          const { data: memberData } = await supabase
            .from('memberships')
            .select('role, organization_id')
            .eq('user_id', data.user.id)
            .single();

          const role: UserRole = memberData?.role || 'advisor';
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: (data.user.user_metadata?.full_name as string) || email.split('@')[0],
            role,
          };

          setUser(profile);
          setMembership({
            id: 'm-' + profile.id,
            user_id: profile.id,
            organization_id: memberData?.organization_id || DEMO_ORG.id,
            role,
          });
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          return {};
        }
      }

      return { error: 'Credenciales inválidas. Utilice una de las cuentas de prueba didácticas.' };
    } catch (err: any) {
      return { error: err?.message || 'Error durante la autenticación' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    setIsLoading(true);
    const profile = DEMO_USERS[role];
    setUser(profile);
    setMembership({
      id: 'm-' + profile.id,
      user_id: profile.id,
      organization_id: DEMO_ORG.id,
      role: profile.role,
    });
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setMembership(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const target = organizations.find((o) => o.id === orgId);
    if (target) {
      setOrganization(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizations,
        membership,
        isLoading,
        login,
        loginAsDemo,
        logout,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
