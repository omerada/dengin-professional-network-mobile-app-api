// src/features/auth/components/ProfessionSelector.tsx
// Smart Profession Dropdown Selector
// Backend ile %100 uyumlu meslek seçici

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { PROFESSIONS, type Profession } from '../constants/professions';

const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

interface ProfessionSelectorProps {
  value?: number | null; // Selected profession ID
  customValue?: string; // Custom profession text if "OTHER" selected
  onSelect: (professionId: number | null, customText?: string) => void;
  error?: string;
}

const PROFANITY_WORDS = [
  'amk',
  'aq',
  'mk',
  'amq',
  'a.q',
  'm.k',
  'a.q.',
  'am',
  'amcık',
  'amına',
  'amın',
  'amı',
  'amını',
  'amına koyayım',
  'amına koyim',
  'sik',
  's1k',
  's!k',
  'siik',
  'siktir',
  'siktirgit',
  'sikerim',
  'sikeyim',
  'sikti',
  'sikiyor',
  'göt',
  'got',
  'götün',
  'götüne',
  'götünü',
  'götveren',
  'götlek',
  'göt herif',
  'yarak',
  'yarrak',
  'yrk',
  'yrrk',
  'yarrağ',
  'yarrağı',
  'yarrağın',
  'yarram',
  'piç',
  'piq',
  'pıc',
  'pıç',
  'puç',
  'orospu',
  'oç',
  'orospunun',
  'orospucocugu',
  'orospucocu',
  'orosbu',
  'orospular',
  'pezevenk',
  'pezo',
  'gerizekalı',
  'geri zekalı',
  'salak',
  'aptal',
  'mall',
  'mal',
  'dangalak',
  'dangoz',
  'şerefsiz',
  'şrfsz',
  'şrfsiz',
  'yavşak',
  'yavsak',
  'puşt',
  'pust',
  'pustt',
  'ibne',
  'ibn*',
  'ibine',
  'kahpe',
  'kahbe',
  'kaltak',
  'kaltag',
];

const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return PROFANITY_WORDS.some(word => lowerText.includes(word));
};

/**
 * Smart Profession Selector Component
 * - Dropdown list from backend professions
 * - "Diğer" option for custom profession
 * - Profanity filter
 * - Shows verification requirement badge
 */
export const ProfessionSelector: React.FC<ProfessionSelectorProps> = ({
  value,
  customValue,
  onSelect,
  error,
}) => {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customText, setCustomText] = useState(customValue || '');
  const [customError, setCustomError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Use hardcoded professions
  const professions = PROFESSIONS;
  const isLoading = false;

  // Find selected profession
  const selectedProfession = useMemo(() => {
    if (!value || !professions) return null;
    return professions.find(p => p.id === value);
  }, [value, professions]);

  // Filter professions based on search
  const filteredProfessions = useMemo(() => {
    if (!professions) return [];
    if (!searchQuery) return professions;
    const query = searchQuery.toLowerCase();
    return professions.filter(p => p.name.toLowerCase().includes(query));
  }, [professions, searchQuery]);

  // Check if selected profession is "OTHER" category
  const isOtherCategory = selectedProfession?.category === 'OTHER';

  const handleProfessionSelect = useCallback(
    (profession: Profession) => {
      if (profession.category === 'OTHER') {
        setModalVisible(false);
        setShowCustomInput(true);
        onSelect(profession.id, '');
      } else {
        setShowCustomInput(false);
        setCustomText('');
        setCustomError('');
        onSelect(profession.id);
        setModalVisible(false);
      }
      setSearchQuery('');
    },
    [onSelect],
  );

  const handleCustomTextChange = useCallback((text: string) => {
    setCustomText(text);
    if (containsProfanity(text)) {
      setCustomError('Geçersiz meslek adı. Lütfen uygun bir meslek giriniz.');
    } else if (text.length > 100) {
      setCustomError('Meslek adı en fazla 100 karakter olabilir.');
    } else {
      setCustomError('');
    }
  }, []);

  const handleCustomTextConfirm = useCallback(() => {
    if (!customError && customText.trim()) {
      onSelect(selectedProfession?.id || null, customText.trim());
      setModalVisible(false);
      setShowCustomInput(false);
    }
  }, [customError, customText, onSelect, selectedProfession]);

  const displayText = useMemo(() => {
    if (isOtherCategory && customValue) {
      return customValue;
    }
    return selectedProfession?.name || 'Mesleğinizi seçin';
  }, [selectedProfession, isOtherCategory, customValue]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text.primary }]}>
        Meslek <Text style={{ color: colors.status.error }}>*</Text>
      </Text>

      {/* Selection Button */}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.background.secondary,
            borderColor: error ? colors.status.error : colors.border.default,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.selectorText,
            {
              color: selectedProfession ? colors.text.primary : colors.text.tertiary,
            },
          ]}>
          {displayText}
        </Text>
        <Text style={[styles.arrow, { color: colors.text.tertiary }]}>▼</Text>
      </TouchableOpacity>

      {/* Verification Badge */}
      {selectedProfession?.requiresVerification && !isOtherCategory && (
        <View style={[styles.badge, { backgroundColor: colors.interactive.subtle }]}>
          <Text style={[styles.badgeText, { color: colors.interactive.default }]}>
            ✓ Doğrulama gerektirir
          </Text>
        </View>
      )}

      {/* Custom Input for OTHER category */}
      {isOtherCategory && showCustomInput && (
        <View style={styles.customInputContainer}>
          <TextInput
            style={[
              styles.customInput,
              {
                backgroundColor: colors.background.secondary,
                borderColor: customError ? colors.status.error : colors.border.default,
                color: colors.text.primary,
              },
            ]}
            value={customText}
            onChangeText={handleCustomTextChange}
            placeholder="Mesleğinizi yazın"
            placeholderTextColor={colors.text.tertiary}
            maxLength={100}
            autoFocus
          />
          {customError && (
            <Text style={[styles.errorText, { color: colors.status.error }]}>{customError}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: colors.interactive.default },
              (customError || !customText.trim()) && styles.confirmButtonDisabled,
            ]}
            onPress={handleCustomTextConfirm}
            disabled={!customText.trim() || !!customError}>
            <Text style={[styles.confirmButtonText, { color: colors.text.inverse }]}>Tamam</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.background.primary }]}
            onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Meslek Seçin</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.text.secondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                    color: colors.text.primary,
                  },
                ]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Meslek ara..."
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            {/* List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.interactive.default} />
              </View>
            ) : (
              <FlatList
                data={filteredProfessions}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.professionItem,
                      {
                        backgroundColor:
                          item.id === value ? colors.interactive.subtle : colors.background.primary,
                      },
                    ]}
                    onPress={() => handleProfessionSelect(item)}>
                    <View style={styles.professionInfo}>
                      <Text style={[styles.professionName, { color: colors.text.primary }]}>
                        {item.name}
                      </Text>
                      {item.requiresVerification && (
                        <View
                          style={[
                            styles.verificationBadge,
                            { backgroundColor: colors.status.infoBg },
                          ]}>
                          <Text
                            style={[styles.verificationBadgeText, { color: colors.status.info }]}>
                            Doğrulama
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                      Meslek bulunamadı
                    </Text>
                  </View>
                }
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    fontSize: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
  },
  confirmButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    marginBottom: spacing.md,
  },
  customInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  customInputContainer: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    marginTop: '20%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalOverlay: {
    backgroundColor: MODAL_OVERLAY_COLOR,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  professionInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  professionItem: {
    borderRadius: 8,
    marginHorizontal: spacing.md,
    marginVertical: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  professionName: {
    flex: 1,
    fontSize: 15,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selector: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
  },
  verificationBadge: {
    borderRadius: 8,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  verificationBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
