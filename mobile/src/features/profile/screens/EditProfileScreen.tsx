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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { Button, Input } from '@shared/components';
import { spacing, fontSize } from '@theme';
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
  const navigation = useNavigation();

  // Fetch current profile
  const { data: profile, isLoading: _isLoadingProfile } = useMyProfile();

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

  // Track changes for save button
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
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
        gender !== (profile.gender || null);
      setHasChanges(changed);
    }
  }, [name, surname, bio, dateOfBirth, gender, profile]);

  // Handle avatar selection (presigned URL flow)
  const handleAvatarSelected = useCallback(
    (uri: string) => {
      uploadAvatar(
        { imageUri: uri },
        {
          onSuccess: () => {
            Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
          },
          onError: error => {
            console.error('[EditProfileScreen] Avatar upload error:', error);
            Alert.alert('Hata', error.message || 'Fotoğraf yüklenirken bir hata oluştu.');
          },
        },
      );
    },
    [uploadAvatar],
  );

  // Handle avatar removal
  const handleAvatarRemove = useCallback(async () => {
    try {
      await deleteAvatar.mutateAsync();
      Alert.alert('Başarılı', 'Profil fotoğrafınız kaldırıldı.');
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf kaldırılırken bir hata oluştu.');
    }
  }, [deleteAvatar]);

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

    const updateData: UpdateProfileRequest = {};

    if (name !== profile?.name) updateData.name = name.trim();
    if (surname !== profile?.surname) updateData.surname = surname.trim();
    if (bio !== (profile?.bio || '')) updateData.bio = bio.trim();
    if (dateOfBirth !== (profile?.dateOfBirth || '')) updateData.dateOfBirth = dateOfBirth;
    if (gender !== (profile?.gender || null) && gender) updateData.gender = gender;

    try {
      await updateProfile.mutateAsync(updateData);
      Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  }, [hasChanges, name, surname, bio, dateOfBirth, gender, profile, updateProfile, navigation]);

  // Gender selector
  const handleGenderSelect = useCallback((selectedGender: Gender) => {
    setGender(prev => (prev === selectedGender ? null : selectedGender));
  }, []);

  const isLoading = updateProfile.isPending;
  const isAvatarLoading = isUploadingAvatar || deleteAvatar.isPending;

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
          {/* Avatar Picker */}
          <AvatarPicker
            currentAvatarUrl={profile?.avatarUrl ?? null}
            fullName={profile?.fullName || 'Kullanıcı'}
            onImageSelected={handleAvatarSelected}
            onRemove={profile?.avatarUrl ? handleAvatarRemove : undefined}
            isLoading={isAvatarLoading}
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

            <Input
              label="Doğum Tarihi"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />

            {/* Gender Selection */}
            <View style={styles.genderSection}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Cinsiyet</Text>
              <View style={styles.genderOptions}>
                {GENDER_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    title={option.label}
                    onPress={() => handleGenderSelect(option.value)}
                    variant={gender === option.value ? 'primary' : 'outline'}
                    size="sm"
                    style={styles.genderButton}
                  />
                ))}
              </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  genderSection: {
    marginTop: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});
