// src/features/auth/components/SectorSelector.tsx
// Smart Sector Selector Component
// Sprint 1: Sector-based community structure

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
import { useSectors, useSearchSectors } from '@shared/hooks';
import type { Sector } from '@shared/types/api.types';

const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

interface SectorSelectorProps {
  value?: number | null; // Selected sector ID
  onSelect: (sectorId: number | null) => void;
  error?: string;
  showDescription?: boolean; // Show sector description in dropdown
}

/**
 * Sector icon mapping
 * Maps sector codes to Feather icons
 */
const SECTOR_ICONS: Record<string, string> = {
  MEDICAL: 'heart',
  ENGINEERING: 'cpu',
  LEGAL: 'shield',
  EDUCATION: 'book-open',
  TECH: 'monitor',
  FINANCE: 'dollar-sign',
  ARTS: 'image',
  OTHER: 'briefcase',
};

/**
 * Smart Sector Selector Component
 *
 * Features:
 * - Dropdown list from backend sectors API
 * - Real-time search with backend query
 * - Shows verification badge for professional sectors
 * - Clean card-based design
 * - Loading states and error handling
 *
 * @example
 * <SectorSelector
 *   value={sectorId}
 *   onSelect={(id) => setValue('sectorId', id)}
 *   error={errors.sectorId?.message}
 * />
 */
export const SectorSelector: React.FC<SectorSelectorProps> = ({
  value,
  onSelect,
  error,
  showDescription = false,
}) => {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sectors from backend
  const { data: sectors, isLoading, isError } = useSectors();
  const { data: searchResults } = useSearchSectors(searchQuery, searchQuery.length > 0);

  // Determine which list to show
  const displaySectors = searchQuery.length > 0 ? searchResults : sectors;

  // Find selected sector
  const selectedSector = useMemo(() => {
    if (!value || !sectors) return null;
    return sectors.find(s => s.id === value);
  }, [value, sectors]);

  const handleSectorSelect = useCallback(
    (sector: Sector) => {
      onSelect(sector.id);
      setModalVisible(false);
      setSearchQuery('');
    },
    [onSelect],
  );

  const displayText = useMemo(() => {
    return selectedSector?.name || 'Alanınızı seçin';
  }, [selectedSector]);

  const getSectorIcon = (code: string) => {
    return SECTOR_ICONS[code] || 'briefcase';
  };

  const renderSectorItem = ({ item }: { item: Sector }) => {
    const isSelected = item.id === value;
    const requiresVerification = ['MEDICAL', 'LEGAL', 'ENGINEERING', 'EDUCATION'].includes(
      item.code,
    );

    return (
      <TouchableOpacity
        style={[
          styles.sectorItem,
          {
            backgroundColor: isSelected
              ? colors.interactive.default + '15'
              : colors.background.secondary,
            borderColor: isSelected ? colors.interactive.default : colors.border.default,
          },
        ]}
        onPress={() => handleSectorSelect(item)}
        activeOpacity={0.7}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected ? colors.interactive.default : colors.background.tertiary,
            },
          ]}>
          <Icon
            name={getSectorIcon(item.code)}
            size={20}
            color={isSelected ? colors.text.inverse : colors.text.secondary}
          />
        </View>

        {/* Content */}
        <View style={styles.sectorContent}>
          <View style={styles.sectorHeader}>
            <Text
              style={[
                styles.sectorName,
                {
                  color: isSelected ? colors.interactive.default : colors.text.primary,
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}>
              {item.name}
            </Text>
            {requiresVerification && (
              <View
                style={[styles.verificationBadge, { backgroundColor: colors.status.warningBg }]}>
                <Icon name="shield" size={12} color={colors.status.warning} />
                <Text style={[styles.badgeText, { color: colors.status.warning }]}>Doğrulama</Text>
              </View>
            )}
          </View>

          {showDescription && item.description && (
            <Text
              style={[styles.sectorDescription, { color: colors.text.secondary }]}
              numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {item.userCount && item.userCount > 0 && (
            <Text style={[styles.userCount, { color: colors.text.tertiary }]}>
              <Icon name="users" size={12} color={colors.text.tertiary} />{' '}
              {item.userCount.toLocaleString('tr-TR')} kullanıcı
            </Text>
          )}
        </View>

        {/* Check icon */}
        {isSelected && (
          <Icon
            name="check-circle"
            size={24}
            color={colors.interactive.default}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text.primary }]}>
          Hangi alanda çalışıyorsunuz? <Text style={{ color: colors.status.error }}>*</Text>
        </Text>
      </View>

      {/* Selector Button */}
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
        {selectedSector && (
          <View
            style={[styles.selectedIconContainer, { backgroundColor: colors.background.tertiary }]}>
            <Icon
              name={getSectorIcon(selectedSector.code)}
              size={20}
              color={colors.interactive.default}
            />
          </View>
        )}
        <Text
          style={[
            styles.selectorText,
            {
              color: selectedSector ? colors.text.primary : colors.text.tertiary,
            },
          ]}>
          {displayText}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={[styles.errorText, { color: colors.status.error }]}>{error}</Text>}

      {/* Hint */}
      {!error && (
        <Text style={[styles.hint, { color: colors.text.tertiary }]}>
          Örneğin: Sağlık, Eğitim, Teknoloji, Hukuk...
        </Text>
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
                Çalışma Alanınızı Seçin
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
                placeholder="Alan ara..."
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

            {/* Sector List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.interactive.default} />
                <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                  Sektörler yükleniyor...
                </Text>
              </View>
            ) : isError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color={colors.status.error} />
                <Text style={[styles.errorTitle, { color: colors.text.primary }]}>
                  Sektörler yüklenemedi
                </Text>
                <Text style={[styles.errorDescription, { color: colors.text.secondary }]}>
                  Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.
                </Text>
              </View>
            ) : (
              <FlatList
                data={displaySectors || []}
                renderItem={renderSectorItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="inbox" size={48} color={colors.text.tertiary} />
                    <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                      {searchQuery ? 'Sektör bulunamadı' : 'Henüz sektör bulunmuyor'}
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
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  container: {
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    marginTop: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  errorDescription: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  hint: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  listContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    fontSize: 14,
    marginTop: spacing.md,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  modalOverlay: {
    backgroundColor: MODAL_OVERLAY_COLOR,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  sectorContent: {
    flex: 1,
    gap: spacing.xs,
  },
  sectorDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectorItem: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  sectorName: {
    flex: 1,
    fontSize: 16,
  },
  selectedIconContainer: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  selector: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 56,
    paddingHorizontal: spacing.md,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
  },
  userCount: {
    fontSize: 12,
  },
  verificationBadge: {
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
});
