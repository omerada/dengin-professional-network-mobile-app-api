// src/features/profile/screens/EditProfileScreen.tsx
// Edit profile screen with form and avatar picker
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md
// Backend: PUT /api/users/me, POST /api/users/me/avatar

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useProfessions } from '@shared/hooks/useProfessions';
import { useSectors } from '@shared/hooks/useSectors';
import { Button, Input, BottomSheet } from '@shared/components';
import { HAPTIC_TYPES } from '@constants/hapticPresets';
import { spacing, fontSize } from '@theme';
import { AvatarPicker } from '../components';
import {
  useMyProfile,
  useUpdateProfile,
  useUploadAvatarWithPresignedUrl,
  useDeleteAvatar,
} from '../hooks';
import { profileApi } from '../services';
import { useAuthStore } from '@features/auth/stores';
import type { UpdateProfileRequest, Gender, Profession } from '../types';
import type { Sector } from '@shared/types/api.types';

type GenderOption = { label: string; value: Gender };

const GENDER_OPTIONS: GenderOption[] = [
  { label: 'Erkek', value: 'MALE' },
  { label: 'Kadın', value: 'FEMALE' },
  { label: 'Diğer', value: 'OTHER' },
];

/**
 * EditProfileScreen
 *
 * Allows users to:
 * - Update profile photo
 * - Edit name, surname, bio
 * - Update date of birth
 * - Select gender
 */
export const EditProfileScreen: React.FC = () => {
  const colors = useColors();
  const toast = useToast();
  const navigation = useNavigation();
  const { trigger } = useHaptic();

  // Fetch current profile
  const { data: profile, isLoading: _isLoadingProfile, refetch } = useMyProfile();

  // Fetch professions and sectors
  const { data: professions = [], isLoading: isLoadingProfessions } = useProfessions();
  const { data: sectors = [], isLoading: isLoadingSectors } = useSectors();

  // Mutations
  const updateProfile = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatarWithPresignedUrl();
  const deleteAvatar = useDeleteAvatar();

  // Form state
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // Avatar state - pending upload
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);

  // Profession picker state
  const [showProfessionPicker, setShowProfessionPicker] = useState(false);
  const [professionSearchQuery, setProfessionSearchQuery] = useState('');

  // Sector picker state
  const [showSectorPicker, setShowSectorPicker] = useState(false);

  // Gender picker state
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({ day: '', month: '', year: '' });

  // Track changes for save button
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      console.log('[EditProfileScreen] Profile data:', {
        avatarUrl: profile.avatarUrl,
        name: profile.name,
        surname: profile.surname,
        profession: profile.profession,
      });
      setName(profile.name || '');
      setSurname(profile.surname || '');
      setBio(profile.bio || '');
      setDateOfBirth(profile.dateOfBirth || '');
      setGender(profile.gender || null);
      setSelectedProfession(profile.profession || null);
      setSelectedSector(profile.sector || null);
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const changed =
        name !== (profile.name || '') ||
        surname !== (profile.surname || '') ||
        bio !== (profile.bio || '') ||
        dateOfBirth !== (profile.dateOfBirth || '') ||
        gender !== (profile.gender || null) ||
        selectedProfession?.id !== profile.profession?.id ||
        selectedSector?.id !== profile.sector?.id ||
        pendingAvatarUri !== null ||
        shouldDeleteAvatar;
      setHasChanges(changed);
    }
  }, [
    name,
    surname,
    bio,
    dateOfBirth,
    gender,
    selectedProfession,
    selectedSector,
    profile,
    pendingAvatarUri,
    shouldDeleteAvatar,
  ]);

  // Handle avatar selection (just set pending, don't upload yet)
  const handleAvatarSelected = useCallback((uri: string) => {
    setPendingAvatarUri(uri);
    setShouldDeleteAvatar(false); // Cancel any pending delete
  }, []);

  // Handle avatar removal (just mark for deletion, don't delete yet)
  const handleAvatarRemove = useCallback(() => {
    setPendingAvatarUri(null);
    setShouldDeleteAvatar(true);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    // Validation
    if (!name.trim()) {
      toast.error('Ad alanı boş bırakılamaz.');
      return;
    }
    if (!surname.trim()) {
      toast.error('Soyad alanı boş bırakılamaz.');
      return;
    }

    try {
      // Step 1: Handle avatar changes first if any
      if (shouldDeleteAvatar) {
        await deleteAvatar.mutateAsync();
      } else if (pendingAvatarUri) {
        await new Promise<void>((resolve, reject) => {
          uploadAvatar(
            { imageUri: pendingAvatarUri },
            {
              onSuccess: () => resolve(),
              onError: error => reject(error),
            },
          );
        });
      }

      // Step 2: Handle profession change
      if (selectedProfession && selectedProfession.id !== profile?.profession?.id) {
        await profileApi.changeProfession({ professionId: selectedProfession.id });
      }

      // Step 3: Update profile data if there are field changes
      const updateData: UpdateProfileRequest = {};
      if (name !== profile?.name) updateData.name = name.trim();
      if (surname !== profile?.surname) updateData.surname = surname.trim();
      if (bio !== (profile?.bio || '')) updateData.bio = bio.trim();
      if (dateOfBirth !== (profile?.dateOfBirth || '')) updateData.dateOfBirth = dateOfBirth;
      if (gender !== (profile?.gender || null) && gender) updateData.gender = gender;

      if (Object.keys(updateData).length > 0) {
        await updateProfile.mutateAsync(updateData);
      }

      // Step 4: Update authStore with latest profession and sector
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          name: name.trim(),
          surname: surname.trim(),
          profession: (selectedProfession || authStore.user.profession) as any,
          sector: (selectedSector || authStore.user.sector) as any,
        });
      }

      // Success - Show toast with haptic
      trigger(HAPTIC_TYPES.success);
      toast.success('Profil güncellendi');

      // Clear pending states
      setPendingAvatarUri(null);
      setShouldDeleteAvatar(false);

      // Refetch to update UI in background
      refetch();
    } catch (error: any) {
      console.error('[EditProfileScreen] Save error:', error);
      trigger(HAPTIC_TYPES.error);
      toast.error(error.message || 'Profil güncellenirken bir hata oluştu.');
    }
  }, [
    hasChanges,
    name,
    surname,
    bio,
    dateOfBirth,
    gender,
    selectedProfession,
    profile,
    updateProfile,
    navigation,
    shouldDeleteAvatar,
    pendingAvatarUri,
    deleteAvatar,
    uploadAvatar,
    refetch,
    toast,
    trigger,
  ]);

  // Date picker handlers
  const handleOpenDatePicker = useCallback(() => {
    trigger(HAPTIC_TYPES.selection);
    // Parse existing date if available
    if (dateOfBirth) {
      const parts = dateOfBirth.split('-');
      if (parts.length === 3) {
        setTempDate({ year: parts[0], month: parts[1], day: parts[2] });
      }
    }
    setShowDatePicker(true);
  }, [trigger, dateOfBirth]);

  const handleCloseDatePicker = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const handleDateConfirm = useCallback(() => {
    if (tempDate.day && tempDate.month && tempDate.year) {
      const formatted = `${tempDate.year}-${tempDate.month.padStart(2, '0')}-${tempDate.day.padStart(2, '0')}`;
      setDateOfBirth(formatted);
    }
    handleCloseDatePicker();
  }, [tempDate, handleCloseDatePicker]);

  // Gender picker handlers
  const handleOpenGenderPicker = useCallback(() => {
    trigger(HAPTIC_TYPES.selection);
    setShowGenderPicker(true);
  }, [trigger]);

  const handleCloseGenderPicker = useCallback(() => {
    setShowGenderPicker(false);
  }, []);

  const handleGenderSelect = useCallback(
    (selectedGender: Gender) => {
      trigger(HAPTIC_TYPES.selection);
      setGender(selectedGender);
      handleCloseGenderPicker();
    },
    [trigger, handleCloseGenderPicker],
  );

  // Sector picker handlers
  const handleOpenSectorPicker = useCallback(() => {
    trigger(HAPTIC_TYPES.selection);
    setShowSectorPicker(true);
  }, [trigger]);

  const handleCloseSectorPicker = useCallback(() => {
    setShowSectorPicker(false);
  }, []);

  const handleSectorSelect = useCallback(
    (sector: Sector) => {
      trigger(HAPTIC_TYPES.selection);
      setSelectedSector(sector);
      // Clear profession selection if sector changes
      if (selectedSector?.id !== sector.id) {
        setSelectedProfession(null);
      }
      handleCloseSectorPicker();
    },
    [trigger, handleCloseSectorPicker, selectedSector],
  );

  // Profession picker handlers
  const handleOpenProfessionPicker = useCallback(() => {
    trigger(HAPTIC_TYPES.selection);
    setShowProfessionPicker(true);
  }, [trigger]);

  const handleCloseProfessionPicker = useCallback(() => {
    setShowProfessionPicker(false);
    setProfessionSearchQuery('');
  }, []);

  const handleProfessionSelect = useCallback(
    (profession: Profession) => {
      trigger(HAPTIC_TYPES.selection);
      setSelectedProfession(profession);
      handleCloseProfessionPicker();
    },
    [trigger, handleCloseProfessionPicker],
  );

  // Filter professions by selected sector AND search query
  const filteredProfessions = professions.filter(profession => {
    // First filter by sector category
    const matchesSector = selectedSector ? profession.category === selectedSector.code : true;
    // Then filter by search query
    const matchesSearch = profession.name
      .toLowerCase()
      .includes(professionSearchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const isLoading = updateProfile.isPending || isUploadingAvatar || deleteAvatar.isPending;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Avatar Picker */}
          <AvatarPicker
            currentAvatarUrl={
              pendingAvatarUri || (shouldDeleteAvatar ? null : (profile?.avatarUrl ?? null))
            }
            fullName={profile?.fullName || 'Kullanıcı'}
            onImageSelected={handleAvatarSelected}
            onRemove={
              (profile?.avatarUrl || pendingAvatarUri) && !shouldDeleteAvatar
                ? handleAvatarRemove
                : undefined
            }
            isLoading={false}
          />

          {/* Form Fields */}
          <View style={styles.form}>
            <Input
              label="Ad"
              value={name}
              onChangeText={setName}
              placeholder="Adınızı girin"
              autoCapitalize="words"
              maxLength={50}
            />

            <Input
              label="Soyad"
              value={surname}
              onChangeText={setSurname}
              placeholder="Soyadınızı girin"
              autoCapitalize="words"
              maxLength={50}
            />

            <Input
              label="Hakkımda"
              value={bio}
              onChangeText={setBio}
              placeholder="Kendinizi tanıtın..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            {/* Date of Birth Selection */}
            <View style={styles.selectorSection}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Doğum Tarihi</Text>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                  },
                ]}
                onPress={handleOpenDatePicker}>
                <Text
                  style={[
                    styles.selectorButtonText,
                    {
                      color: dateOfBirth ? colors.text.primary : colors.text.tertiary,
                    },
                  ]}>
                  {dateOfBirth || 'Doğum tarihi seçin'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sector Selection */}
            <View style={styles.selectorSection}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Çalışma Alanı</Text>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                  },
                ]}
                onPress={handleOpenSectorPicker}>
                <Text
                  style={[
                    styles.selectorButtonText,
                    {
                      color: selectedSector ? colors.text.primary : colors.text.tertiary,
                    },
                  ]}>
                  {selectedSector ? selectedSector.name : 'Çalışma alanı seçin'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Profession Selection */}
            <View style={styles.selectorSection}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Meslek</Text>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  {
                    backgroundColor: !selectedSector
                      ? colors.background.tertiary
                      : colors.background.secondary,
                    borderColor: colors.border.default,
                    opacity: !selectedSector ? 0.5 : 1,
                  },
                ]}
                onPress={handleOpenProfessionPicker}
                disabled={!selectedSector}>
                <Text
                  style={[
                    styles.selectorButtonText,
                    {
                      color: selectedProfession ? colors.text.primary : colors.text.tertiary,
                    },
                  ]}>
                  {selectedProfession ? selectedProfession.name : 'Meslek seçin'}
                </Text>
              </TouchableOpacity>
              {!selectedSector && (
                <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
                  Önce çalışma alanı seçin
                </Text>
              )}
            </View>

            {/* Gender Selection */}
            <View style={styles.selectorSection}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Cinsiyet</Text>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                  },
                ]}
                onPress={handleOpenGenderPicker}>
                <Text
                  style={[
                    styles.selectorButtonText,
                    {
                      color: gender ? colors.text.primary : colors.text.tertiary,
                    },
                  ]}>
                  {gender
                    ? GENDER_OPTIONS.find(g => g.value === gender)?.label || 'Cinsiyet seçin'
                    : 'Cinsiyet seçin'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
          <Button
            title="Kaydet"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={!hasChanges || isLoading}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Profession Picker - P2 Optimized: BottomSheet */}
      <BottomSheet
        visible={showProfessionPicker}
        onClose={handleCloseProfessionPicker}
        title="Meslek Seç"
        height={SCREEN_HEIGHT * 0.8}>
        <View style={styles.bottomSheetContent}>
          {/* Sector Info */}
          {selectedSector && (
            <View style={styles.sectorInfoBanner}>
              <Text style={[styles.sectorInfoText, { color: colors.text.secondary }]}>
                {selectedSector.name} alanındaki meslekler gösteriliyor
              </Text>
            </View>
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  borderColor: colors.border.default,
                },
              ]}
              placeholder="Meslek ara..."
              placeholderTextColor={colors.text.tertiary}
              value={professionSearchQuery}
              onChangeText={setProfessionSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Profession List */}
          <FlatList
            data={filteredProfessions}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.professionItem,
                  {
                    backgroundColor:
                      selectedProfession?.id === item.id
                        ? colors.background.tertiary
                        : colors.background.primary,
                  },
                ]}
                onPress={() => handleProfessionSelect(item)}>
                <Text style={[styles.professionItemName, { color: colors.text.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.professionItemCategory, { color: colors.text.secondary }]}>
                  {item.category}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
                  {isLoadingProfessions
                    ? 'Meslekler yükleniyor...'
                    : selectedSector
                      ? `${selectedSector.name} alanında meslek bulunamadı`
                      : 'Meslek bulunamadı'}
                </Text>
                {!selectedSector && !isLoadingProfessions && (
                  <Text style={[styles.emptyStateHint, { color: colors.text.tertiary }]}>
                    Önce bir çalışma alanı seçin
                  </Text>
                )}
              </View>
            }
            contentContainerStyle={styles.professionList}
          />
        </View>
      </BottomSheet>

      {/* Sector Picker - P2 Optimized: BottomSheet */}
      <BottomSheet
        visible={showSectorPicker}
        onClose={handleCloseSectorPicker}
        title="Çalışma Alanı Seç"
        height={SCREEN_HEIGHT * 0.7}>
        <View style={styles.bottomSheetContent}>
          <FlatList
            data={sectors}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  {
                    backgroundColor:
                      selectedSector?.id === item.id
                        ? colors.background.tertiary
                        : colors.background.primary,
                  },
                ]}
                onPress={() => handleSectorSelect(item)}>
                <Text style={[styles.listItemName, { color: colors.text.primary }]}>
                  {item.name}
                </Text>
                {item.description && (
                  <Text style={[styles.listItemDescription, { color: colors.text.secondary }]}>
                    {item.description}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
                  {isLoadingSectors ? 'Çalışma alanları yükleniyor...' : 'Çalışma alanı bulunamadı'}
                </Text>
              </View>
            }
            contentContainerStyle={styles.professionList}
          />
        </View>
      </BottomSheet>

      {/* Gender Picker - P2 Optimized: BottomSheet */}
      <BottomSheet
        visible={showGenderPicker}
        onClose={handleCloseGenderPicker}
        title="Cinsiyet Seç"
        height={SCREEN_HEIGHT * 0.4}>
        <View style={styles.bottomSheetContent}>
          <FlatList
            data={GENDER_OPTIONS}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  {
                    backgroundColor:
                      gender === item.value
                        ? colors.background.tertiary
                        : colors.background.primary,
                  },
                ]}
                onPress={() => handleGenderSelect(item.value)}>
                <Text style={[styles.listItemName, { color: colors.text.primary }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.professionList}
          />
        </View>
      </BottomSheet>

      {/* Date Picker - P2 Optimized: BottomSheet */}
      <BottomSheet
        visible={showDatePicker}
        onClose={handleCloseDatePicker}
        title="Doğum Tarihi"
        height={SCREEN_HEIGHT * 0.6}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerItem}>
                <Text style={[styles.datePickerLabel, { color: colors.text.secondary }]}>Gün</Text>
                <TextInput
                  style={[
                    styles.datePickerInput,
                    {
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      borderColor: colors.border.default,
                    },
                  ]}
                  value={tempDate.day}
                  onChangeText={text => setTempDate(prev => ({ ...prev, day: text }))}
                  placeholder="01"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.datePickerItem}>
                <Text style={[styles.datePickerLabel, { color: colors.text.secondary }]}>Ay</Text>
                <TextInput
                  style={[
                    styles.datePickerInput,
                    {
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      borderColor: colors.border.default,
                    },
                  ]}
                  value={tempDate.month}
                  onChangeText={text => setTempDate(prev => ({ ...prev, month: text }))}
                  placeholder="01"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.datePickerItem}>
                <Text style={[styles.datePickerLabel, { color: colors.text.secondary }]}>Yıl</Text>
                <TextInput
                  style={[
                    styles.datePickerInput,
                    {
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      borderColor: colors.border.default,
                    },
                  ]}
                  value={tempDate.year}
                  onChangeText={text => setTempDate(prev => ({ ...prev, year: text }))}
                  placeholder="1990"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.datePickerFooter}>
              <Button
                title="Onayla"
                onPress={handleDateConfirm}
                variant="primary"
                size="lg"
                fullWidth
                disabled={!tempDate.day || !tempDate.month || !tempDate.year}
              />
            </View>
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // P2 Addition: BottomSheet content styling
  bottomSheetContent: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  container: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderSection: {
    marginTop: spacing.sm,
  },
  keyboardView: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  selectorSection: {
    marginTop: spacing.sm,
  },
  selectorButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  selectorButtonText: {
    fontSize: fontSize.md,
  },
  professionCategory: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  listItemName: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalCloseText: {
    fontSize: fontSize.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  professionList: {
    paddingHorizontal: spacing.lg,
  },
  professionItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  professionItemName: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  professionItemCategory: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  emptyState: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  emptyStateHint: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sectorInfoBanner: {
    backgroundColor: 'rgba(220, 88, 42, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(220, 88, 42, 0.2)',
  },
  sectorInfoText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  datePickerContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  datePickerItem: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  datePickerInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  datePickerFooter: {
    marginTop: spacing.xl * 2,
  },
});
