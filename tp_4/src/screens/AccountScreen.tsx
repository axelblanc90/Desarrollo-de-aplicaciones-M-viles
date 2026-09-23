import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useAgro } from '../context/AgroContext';
import { isSupabaseConfigured } from '../services/supabase';
import { UserRole } from '../types/agropulse.types';
import { colors } from '../theme/colors';

export const AccountScreen: React.FC = () => {
  const { user, organization, logout, loginAsDemo } = useAuth();
  const { lastTickTime, apparentLagMs } = useAgro();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Está seguro de que desea salir del sistema AgroPulse?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
    ]);
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'producer':
        return 'Productor (Control Total)';
      case 'operator':
        return 'Operador de Riego (Comandos)';
      case 'advisor':
        return 'Asesor Agrónomo (Solo Lectura)';
      default:
        return 'Usuario';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{user?.fullName || 'Usuario AgroPulse'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{getRoleLabel(user?.role)}</Text>
        </View>
      </View>

      {/* Oral Defense Switcher Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="swap-horizontal-bold" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Conmutador Rápido de Roles (Defensa Oral)</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Permite evaluar instantáneamente las políticas RLS y restricciones de interfaz para H1 (Productor) y H2 (Asesor):
        </Text>

        <View style={styles.demoButtonsContainer}>
          {(['producer', 'operator', 'advisor'] as const).map((r) => {
            const isActive = user?.role === r;
            const profile = DEMO_USERS[r];
            return (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, isActive && styles.roleBtnActive]}
                onPress={() => loginAsDemo(r)}
              >
                <View style={styles.roleBtnLeft}>
                  <MaterialCommunityIcons
                    name={
                      r === 'producer'
                        ? 'shield-crown'
                        : r === 'operator'
                        ? 'valve'
                        : 'eye-outline'
                    }
                    size={20}
                    color={isActive ? '#FFFFFF' : colors.primary}
                  />
                  <View>
                    <Text style={[styles.roleBtnTitle, isActive && styles.roleBtnTitleActive]}>
                      {profile.fullName}
                    </Text>
                    <Text style={[styles.roleBtnSub, isActive && styles.roleBtnSubActive]}>
                      {profile.email} • {r.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {isActive && (
                  <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Academic Diagnostic Panel (RF-23) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="developer-board" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Panel de Diagnóstico Técnico (RF-23)</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Métricas de observabilidad requeridas para validación de rúbrica:
        </Text>

        <View style={styles.diagList}>
          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>ID Usuario Autenticado:</Text>
            <Text style={styles.diagValue} numberOfLines={1}>
              {user?.id || 'N/A'}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Establecimiento Activo:</Text>
            <Text style={styles.diagValue} numberOfLines={1}>
              {organization?.name} ({organization?.id.slice(0, 8)}...)
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Modo de Datos / BaaS:</Text>
            <Text
              style={[
                styles.diagValue,
                { color: isSupabaseConfigured ? '#166534' : '#B45309' },
              ]}
            >
              {isSupabaseConfigured ? 'Supabase Live + Realtime' : 'Simulación Autónoma (Memoria)'}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Último Tick Recibido:</Text>
            <Text style={styles.diagValue}>
              {lastTickTime ? new Date(lastTickTime).toLocaleTimeString() : 'Esperando...'}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <Text style={styles.diagLabel}>Lag Aparente de Red:</Text>
            <Text style={[styles.diagValue, { color: apparentLagMs < 200 ? '#166534' : '#B45309' }]}>
              {apparentLagMs} ms (≤ 3s SLA RNF-04)
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
        <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.academicFooter}>
        AgroPulse v1.0.0 • FCyT UADER 2026 • Trabajo Práctico 4
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.primarySubtle,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  roleBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  demoButtonsContainer: {
    gap: 8,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgApp,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleBtnTitleActive: {
    color: '#FFFFFF',
  },
  roleBtnSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  roleBtnSubActive: {
    color: '#E2E8F0',
  },
  diagList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diagLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  diagValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
    marginBottom: 14,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  academicFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
  },
});
