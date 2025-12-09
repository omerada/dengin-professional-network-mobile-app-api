// src/features/auth/components/ProfessionSelector.tsx
// Smart Profession Dropdown Selector - Backend API integrated
// Uses backend /api/professions endpoints

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
import Icon from 'react-native-vector-icons/Feather';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';
import { useProfessionsByCategory, useSearchProfessions } from '@shared/hooks';
import type { Profession } from '@shared/types/api.types';

const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

interface ProfessionSelectorProps {
  /** Selected profession ID */
  value?: number | null;
  /** Callback when profession is selected */
  onSelect: (professionId: number | null) => void;
  /** Currently selected sector code (to filter professions) */
  sectorCode?: string | null;
  /** Error message */
  error?: string;
  /** Show description in dropdown */
  showDescription?: boolean;
}

/**
 * Smart Profession Selector Component
 *
 * Features:
 * - Fetches professions from backend based on sector
 * - Real-time search with backend query
 * - Shows verification badge for professions requiring verification
 * - Disabled state when no sector selected
 * - Clean card-based design
 *
 * @example
 * <ProfessionSelector
 *   value={professionId}
 *   sectorCode={selectedSectorCode}
 *   onSelect={(id) => setValue('professionId', id)}
 *   error={errors.professionId?.message}
 * />
 */
export const ProfessionSelector: React.FC<ProfessionSelectorProps> = ({
  value,
  onSelect,
  sectorCode,
  error,
  showDescription = false,
}) => {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch professions by sector category
  const {
    data: professions,
    isLoading,
    isError,
  } = useProfessionsByCategory(sectorCode || '', !!sectorCode);

  // Search professions
  const { data: searchResults } = useSearchProfessions(searchQuery, searchQuery.length > 0);

  // Determine which list to show
  const displayProfessions = searchQuery.length > 0 ? searchResults : professions;

  // Find selected profession
  const selectedProfession = useMemo(() => {
    if (!value || !professions) return null;
    return professions.find(p => p.id === value);
  }, [value, professions]);

  const handleProfessionSelect = useCallback(
    (profession: Profession) => {
      onSelect(profession.id);
      setModalVisible(false);
      setSearchQuery('');
    },
    [onSelect],
  );

  const displayText = useMemo(() => {
    return selectedProfession?.name || 'Mesleğinizi seçin';
  }, [selectedProfession]);

  const isDisabled = !sectorCode;

  // Render profession item
  const renderProfessionItem = ({ item }: { item: Profession }) => {
    const isSelected = item.id === value;

    return (
      <TouchableOpacity
        style={[
          styles.professionItem,
          {
            backgroundColor: isSelected ? colors.interactive.subtle : colors.background.primary,
            borderColor: isSelected ? colors.interactive.default : colors.border.default,
          },
        ]}
        onPress={() => handleProfessionSelect(item)}
        activeOpacity={0.7}>
        <View style={styles.professionContent}>
          <Text
            style={[
              styles.professionName,
              {
                color: isSelected ? colors.interactive.default : colors.text.primary,
                fontWeight: isSelected ? '600' : '500',
              },
            ]}>
            {item.name}
          </Text>

          {item.requiresVerification && (
            <View style={[styles.verificationBadge, { backgroundColor: colors.status.warningBg }]}>
              <Icon name="shield" size={12} color={colors.status.warning} />
              <Text style={[styles.badgeText, { color: colors.status.warning }]}>Doğrulama</Text>
            </View>
          )}

          {showDescription && item.description && (
            <Text
              style={[styles.professionDescription, { color: colors.text.secondary }]}
              numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>

        {/* Check icon */}
        {isSelected && <Icon name="check-circle" size={24} color={colors.interactive.default} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text.primary }]}>
          Mesleğiniz nedir? {!isDisabled && <Text style={{ color: colors.status.error }}>*</Text>}
        </Text>
      </View>

      {/* Selector Button */}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: isDisabled ? colors.background.tertiary : colors.background.secondary,
            borderColor: error ? colors.status.error : colors.border.default,
            opacity: isDisabled ? 0.6 : 1,
          },
        ]}
        onPress={() => !isDisabled && setModalVisible(true)}
        disabled={isDisabled}
        activeOpacity={0.7}>
        {selectedProfession && (
          <View
            style={[styles.selectedIconContainer, { backgroundColor: colors.background.tertiary }]}>
            <Icon name="briefcase" size={20} color={colors.interactive.default} />
          </View>
        )}
        <Text
          style={[
            styles.selectorText,
            {
              color: selectedProfession ? colors.text.primary : colors.text.tertiary,
            },
          ]}>
          {displayText}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>}

      {/* Hint */}
      {!error && isDisabled && (
        <Text style={[styles.hint, { color: colors.text.tertiary }]}>
          Önce çalışma alanınızı seçin
        </Text>
      )}
      {!error && !isDisabled && (
        <Text style={[styles.hint, { color: colors.text.tertiary }]}>
          Sektörünüzdeki mesleğinizi seçin
        </Text>
      )}

      {/* Verification badge */}
      {selectedProfession?.requiresVerification && (
        <View style={[styles.infoBox, { backgroundColor: colors.status.infoBg }]}>
          <Icon name="info" size={16} color={colors.status.info} />
          <Text style={[styles.infoText, { color: colors.status.info }]}>
            Bu meslek için doğrulama gereklidir
          </Text>
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.background.primary }]}
            onPress={e => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Mesleğinizi Seçin
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="x" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}>
              <Icon name="search" size={20} color={colors.text.tertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text.primary }]}
                placeholder="Meslek ara..."
                placeholderTextColor={colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="x-circle" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Profession List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.interactive.default} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                  Meslekler yükleniyor...
                </Text>
              </View>
            ) : isError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color={colors.status.error} />
                <Text style={[styles.errorTitle, { color: colors.text.primary }]}>
                  Meslekler yüklenemedi
                </Text>
                <Text style={[styles.errorMessage, { color: colors.text.secondary }]}>
                  Lütfen tekrar deneyin
                </Text>
              </View>
            ) : (
              <FlatList
                data={displayProfessions}
                renderItem={renderProfessionItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Icon name="search" size={48} color={colors.text.tertiary} />
                    <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                      Meslek bulunamadı
                    </Text>
                    <Text style={[styles.emptyMessage, { color: colors.text.secondary }]}>
                      Farklı anahtar kelimeler deneyin
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
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  selectedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    marginLeft: spacing.xs,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  professionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  professionContent: {
    flex: 1,
  },
  professionName: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  professionDescription: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  loadingText: {
    fontSize: 14,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  errorMessage: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptyMessage: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
