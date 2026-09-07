import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { CustomButton } from './CustomButton';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Términos y Condiciones — iBank
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>
              1. Condiciones Generales del Servicio Bancario
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Al registrarse en iBank — Banking & E-Money Management, el usuario acepta de forma plena y sin reservas los presentes términos de uso, políticas de privacidad y condiciones operativas para la gestión de cuentas digitales y billeteras electrónicas.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>
              2. Seguridad y Custodia de Credenciales
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              El titular es el único responsable de mantener la confidencialidad de su contraseña y de las credenciales de acceso vinculadas a su cuenta iBank. Nuestra plataforma utiliza cifrado de grado bancario y cumple con los estándares más rigurosos de protección de datos.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>
              3. Protección de Datos y Privacidad
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              iBank no compartirá información sensible con terceros salvo expresa autorización judicial o legal. Todos los datos de sesión y tokens de autenticación se gestionan bajo protocolos de seguridad con Supabase Auth e infraestructura certificada.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>
              4. Transacciones y Límites Operativos
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Las transferencias y pagos se rigen bajo las regulaciones bancarias y de dinero electrónico vigentes, sujetas a límites diarios establecidos para la protección del usuario.
            </Text>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.surfaceBorder }]}>
            <CustomButton
              title="Entendido y Aceptar Términos"
              onPress={() => {
                onAccept();
                onClose();
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});
