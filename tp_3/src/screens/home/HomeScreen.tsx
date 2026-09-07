import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { BankCardView } from '../../components/bank/BankCardView';
import { QuickActionTile } from '../../components/bank/QuickActionTile';

export const HomeScreen: React.FC = () => {
  const colors = useThemeColors();
  const { user, signOut, isMockMode } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Usuario iBank';
  const email = user?.email || 'usuario@ibank.com';

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseás cerrar la sesión en este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleActionPress = (action: string) => {
    Alert.alert('iBank', `Módulo de ${action} disponible en la próxima actualización.`);
  };

  const transactions = [
    {
      id: 'tx-1',
      title: 'Transferencia recibida',
      subtitle: 'De Martín Gómez (Banco Santander)',
      amount: '+$ 85.000,00',
      positive: true,
      date: 'Hoy, 13:45',
      icon: 'arrow-down-circle',
    },
    {
      id: 'tx-2',
      title: 'Pago con Tarjeta iBank',
      subtitle: 'Supermercados Coto',
      amount: '-$ 24.320,50',
      positive: false,
      date: 'Ayer, 19:12',
      icon: 'cart-outline',
    },
    {
      id: 'tx-3',
      title: 'Rendimiento diario',
      subtitle: 'Fondo Común de Inversión iBank',
      amount: '+$ 1.840,20',
      positive: true,
      date: 'Ayer, 08:00',
      icon: 'trending-up',
    },
    {
      id: 'tx-4',
      title: 'Pago de Servicios',
      subtitle: 'Telecom Fibertel / Personal',
      amount: '-$ 18.250,00',
      positive: false,
      date: '04 Sep, 10:15',
      icon: 'receipt-outline',
    },
  ];

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
      <View style={styles.topBar}>
        <View style={styles.userProfileRow}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.surfaceHighlight, borderColor: colors.surfaceBorder },
            ]}
          >
            <Ionicons name="person" size={20} color={colors.primaryLight} />
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Bienvenido a iBank
            </Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {fullName}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            { backgroundColor: colors.errorLight, borderColor: colors.error },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isMockMode && (
          <View
            style={[
              styles.modeBadge,
              { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
            ]}
          >
            <Ionicons name="information-circle-outline" size={16} color={colors.secondary} />
            <Text style={[styles.modeBadgeText, { color: colors.textSecondary }]}>
              Modo Autenticación Local / Demo — Supabase listo para producción
            </Text>
          </View>
        )}

        <BankCardView
          cardHolderName={fullName}
          balance="$ 345.280,50"
          accountNumber="•••• •••• •••• 9104"
        />

        <View style={styles.actionsContainer}>
          <QuickActionTile
            label="Transferir"
            iconName="paper-plane-outline"
            onPress={() => handleActionPress('Transferencias')}
          />
          <QuickActionTile
            label="Pagar"
            iconName="receipt-outline"
            onPress={() => handleActionPress('Pago de Servicios')}
          />
          <QuickActionTile
            label="Ingresar"
            iconName="add-circle-outline"
            onPress={() => handleActionPress('Carga de Dinero')}
          />
          <QuickActionTile
            label="Inversiones"
            iconName="trending-up-outline"
            onPress={() => handleActionPress('Inversiones')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Actividad Reciente
          </Text>
          <TouchableOpacity onPress={() => handleActionPress('Historial Completo')}>
            <Text style={[styles.seeAllText, { color: colors.primaryLight }]}>
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.transactionsList,
            { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
          ]}
        >
          {transactions.map((tx, index) => (
            <View
              key={tx.id}
              style={[
                styles.transactionItem,
                index < transactions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.surfaceBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.txIconSlot,
                  {
                    backgroundColor: tx.positive ? colors.successLight : colors.surfaceHighlight,
                  },
                ]}
              >
                <Ionicons
                  name={tx.icon as any}
                  size={20}
                  color={tx.positive ? colors.success : colors.textSecondary}
                />
              </View>

              <View style={styles.txDetails}>
                <Text style={[styles.txTitle, { color: colors.textPrimary }]}>
                  {tx.title}
                </Text>
                <Text style={[styles.txSubtitle, { color: colors.textMuted }]}>
                  {tx.subtitle} · {tx.date}
                </Text>
              </View>

              <Text
                style={[
                  styles.txAmount,
                  { color: tx.positive ? colors.success : colors.textPrimary },
                ]}
              >
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text style={[styles.securityText, { color: colors.textMuted }]}>
            Sesión activa protegida con Supabase Auth y cifrado bancario TLS 1.3
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  transactionsList: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  txIconSlot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  txSubtitle: {
    fontSize: 12,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
  },
});
