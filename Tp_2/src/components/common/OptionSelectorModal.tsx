import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeColors } from '../../hooks/useThemeStyles';

interface OptionSelectorModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const OptionSelectorModal: React.FC<OptionSelectorModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = item === selectedValue;
                  return (
                    <TouchableOpacity
                      style={[styles.optionRow, isSelected && styles.selectedOptionRow]}
                      onPress={() => {
                        onSelect(item);
                        onClose();
                      }}
                    >
                      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                        {item}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={themeColors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 18,
    paddingBottom: 28,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderLight,
  },
  selectedOptionRow: {
    backgroundColor: themeColors.primaryLight,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: themeColors.textPrimary,
  },
  selectedOptionText: {
    fontWeight: '700',
    color: themeColors.primary,
  },
});
