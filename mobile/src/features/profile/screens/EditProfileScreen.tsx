// src/features/profile/screens/EditProfileScreen.tsx
// Modern Edit Profile Screen - Clean, minimal UX design
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
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { Button, Input } from '@shared/components';
import { spacing } from '@theme';
import { AvatarPicker } from '../components';
import {
  useMyProfile,
  useUpdateProfile,
  useUploadAvatarWithPresignedUrl,
  useDeleteAvatar,
} from '../hooks';
import type { UpdateProfileRequest, Gender } from '../types';

type GenderOption = { label: string; value: Gender };

const GENDER_OPTIONS: GenderOption[] = [
  { label: 'Erkek', value: 'MALE' },
  { label: 'Kadın', value: 'FEMALE' },
  { label: 'Diğer', value: 'OTHER' },
];

/**
 * Modern EditProfileScreen
 * 
 * Özellikleri:
 * - Minimal, clean UI tasarım
 * - UX odaklı akış
 * - Sosyal medya standartlarında arayüz
 * - Kullanıcıyı yormayan, hızlı düzenleme deneyimi
 * - Net placeholder ve label kullanımı
 * - Belirgin ve erişilebilir aksiyon butonları
 */
export const EditProfileScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();

  // Fetch current profile
  const { data: profile, isLoading: _isLoadingProfile, refetch } = useMyProfile();

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
  
  // Avatar state - pending upload
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);

  // Track changes for save button
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      console.log('[EditProfileScreen] Profile data:', {
        avatarUrl: profile.avatarUrl,
        name: profile.name,
        surname: profile.surname,
      });
      setName(profile.name || '');
      setSurname(profile.surname || '');
      setBio(profile.bio || '');
      setDateOfBirth(profile.dateOfBirth || '');
      setGender(profile.gender || null);
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
        pendingAvatarUri !== null ||
        shouldDeleteAvatar;
      setHasChanges(changed);
    }
  }, [name, surname, bio, dateOfBirth, gender, profile, pendingAvatarUri, shouldDeleteAvatar]);

  // Handle avatar selection (just set pending, don't upload yet)
  const handleAvatarSelected = useCallback(
    (uri: string) => {
      setPendingAvatarUri(uri);
      setShouldDeleteAvatar(false); // Cancel any pending delete
    },
    [],
  );

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
      Alert.alert('Hata', 'Ad alanı boş bırakılamaz.');
      return;
    }
    if (!surname.trim()) {
      Alert.alert('Hata', 'Soyad alanı boş bırakılamaz.');
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

      // Step 2: Update profile data if there are field changes
      const updateData: UpdateProfileRequest = {};
      if (name !== profile?.name) updateData.name = name.trim();
      if (surname !== profile?.surname) updateData.surname = surname.trim();
      if (bio !== (profile?.bio || '')) updateData.bio = bio.trim();
      if (dateOfBirth !== (profile?.dateOfBirth || '')) updateData.dateOfBirth = dateOfBirth;
      if (gender !== (profile?.gender || null) && gender) updateData.gender = gender;

      if (Object.keys(updateData).length > 0) {
        await updateProfile.mutateAsync(updateData);
      }

      // Success
      Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
      
      // Clear pending states
      setPendingAvatarUri(null);
      setShouldDeleteAvatar(false);
      
      // Refetch to update UI
      refetch();
    } catch (error: any) {
      console.error('[EditProfileScreen] Save error:', error);
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu.');
    }
  }, [
    hasChanges,
    name,
    surname,
    bio,
    dateOfBirth,
    gender,
    profile,
    updateProfile,
    navigation,
    shouldDeleteAvatar,
    pendingAvatarUri,
    deleteAvatar,
    uploadAvatar,
    refetch,
  ]);

  // Gender selector
  const handleGenderSelect = useCallback((selectedGender: Gender) => {
    setGender(prev => (prev === selectedGender ? null : selectedGender));
  }, []);

  const isLoading = updateProfile.isPending || isUploadingAvatar || deleteAvatar.isPending;

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.default} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* ==================== AVATAR SECTION ==================== */}
          <View style={styles.avatarSection}>
            <AvatarPicker
              currentAvatarUrl={pendingAvatarUri || (shouldDeleteAvatar ? null : profile?.avatarUrl ?? null)}
              fullName={profile?.fullName || 'Kullanıcı'}
              onImageSelected={handleAvatarSelected}
              onRemove={(profile?.avatarUrl || pendingAvatarUri) && !shouldDeleteAvatar ? handleAvatarRemove : undefined}
              isLoading={false}
            />
            <Text style={[styles.avatarHelper, { color: colors.text.tertiary }]}>
              Profil fotoğrafınızı değiştirmek için tıklayın
            </Text>
          </View>

          {/* ==================== FORM FIELDS ==================== */}
          <View style={styles.formContainer}>
            {/* Ad Soyad - Split Row for Better UX */}
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>
                  Ad <Text style={{ color: colors.status.error }}>*</Text>
                </Text>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Adınız"
                  autoCapitalize="words"
                  maxLength={50}
                  containerStyle={styles.inputContainer}
                />
              </View>
              
              <View style={styles.nameField}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>
                  Soyad <Text style={{ color: colors.status.error }}>*</Text>
                </Text>
                <Input
                  value={surname}
                  onChangeText={setSurname}
                  placeholder="Soyadınız"
                  autoCapitalize="words"
                  maxLength={50}
                  containerStyle={styles.inputContainer}
                />
              </View>
            </View>

            {/* Hakkımda */}
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                Hakkımda
              </Text>
              <Input
                value={bio}
                onChangeText={setBio}
                placeholder="Kendinizi kısaca tanıtın..."
                multiline
                numberOfLines={4}
                maxLength={500}
                containerStyle={styles.inputContainer}
              />
              <Text style={[styles.charCounter, { color: colors.text.tertiary }]}>
                {bio.length}/500
              </Text>
            </View>

            {/* Doğum Tarihi */}
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                Doğum Tarihi
              </Text>
              <Input
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="GG/AA/YYYY"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                containerStyle={styles.inputContainer}
              />
              <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
                Örnek: 15/03/1990
              </Text>
            </View>

            {/* Cinsiyet - Modern Selector */}
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                Cinsiyet
              </Text>
              <View style={styles.genderContainer}>
                {GENDER_OPTIONS.map(option => {
                  const isSelected = gender === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleGenderSelect(option.value)}
                      style={[
                        styles.genderOption,
                        {
                          backgroundColor: isSelected 
                            ? colors.interactive.default 
                            : colors.background.secondary,
                          borderColor: isSelected 
                            ? colors.interactive.default 
                            : colors.border.default,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.genderText,
                          {
                            color: isSelected 
                              ? '#FFFFFF' 
                              : colors.text.primary,
                          },
                        ]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ==================== ACTION BUTTONS ==================== */}
        <View style={[styles.actionBar, { 
          borderTopColor: colors.border.subtle,
          backgroundColor: colors.background.primary,
        }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={[styles.cancelButton, { opacity: isLoading ? 0.5 : 1 }]}>
            <Text style={[styles.cancelText, { color: colors.text.secondary }]}>
              İptal
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={!hasChanges || isLoading}
            style={[
              styles.saveButton,
              {
                backgroundColor: hasChanges && !isLoading
                  ? colors.interactive.default
                  : colors.background.secondary,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.saveText,
                  {
                    color: hasChanges 
                      ? '#FFFFFF' 
                      : colors.text.tertiary,
                  },
                ]}>
                Kaydet
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ========================================
  // Container
  // ========================================
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for action bar
  },

  // ========================================
  // Avatar Section
  // ========================================
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  avatarHelper: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ========================================
  // Form Container
  // ========================================
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // ========================================
  // Name Row (Split Layout)
  // ========================================
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  nameField: {
    flex: 1,
  },

  // ========================================
  // Field Wrapper
  // ========================================
  fieldWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    marginBottom: 0, // Override default spacing
  },
  charCounter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },

  // ========================================
  // Gender Selection (Modern Pills)
  // ========================================
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ========================================
  // Action Bar (Bottom Fixed)
  // ========================================
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cancelButton: {
    height: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
