// src/features/profile/components/EditProfileForm.tsx
// Edit profile form component with validation
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-COMPLETION.md

import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { Input, Button } from '@shared/components';
import { spacing, typography } from '@theme';
import type { UpdateProfileRequest, MyProfileResponse, Gender } from '../types';

/**
 * Props for EditProfileForm
 */
interface EditProfileFormProps {
  /** Current profile data */
  profile: MyProfileResponse;
  /** Submit handler */
  onSubmit: (data: UpdateProfileRequest) => Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Cancel handler */
  onCancel?: () => void;
}

/**
 * Validation rules
 */
const VALIDATION = {
  name: { minLength: 2, maxLength: 100, required: true },
  surname: { minLength: 2, maxLength: 100, required: true },
  bio: { maxLength: 500, required: false },
  dateOfBirth: { minAge: 18, maxAge: 120, required: false },
};

/**
 * Gender options
 */
const GENDER_OPTIONS: { value: Gender | null; label: string }[] = [
  { value: null, label: 'Belirtmek istemiyorum' },
  { value: 'MALE', label: 'Erkek' },
  { value: 'FEMALE', label: 'Kadın' },
  { value: 'OTHER', label: 'Diğer' },
];

/**
 * Format date string for display (YYYY-MM-DD -> DD/MM/YYYY)
 */
const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Format date string for API (DD/MM/YYYY -> YYYY-MM-DD)
 */
const formatDateForApi = (dateString: string): string | undefined => {
  if (!dateString.trim()) return undefined;
  const parts = dateString.split('/');
  if (parts.length !== 3) return undefined;
  const [day, month, year] = parts;
  if (!day || !month || !year) return undefined;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Validate date string (DD/MM/YYYY)
 */
const validateDate = (dateString: string): { valid: boolean; error?: string } => {
  if (!dateString.trim()) {
    return { valid: true }; // Optional field
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) {
    return { valid: false, error: 'Geçersiz format (GG/AA/YYYY)' };
  }

  const [day, month, year] = parts.map(Number);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { valid: false, error: 'Geçersiz tarih' };
  }

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
    return { valid: false, error: 'Geçersiz tarih değerleri' };
  }

  const date = new Date(year, month - 1, day);
  const now = new Date();
  const age = now.getFullYear() - date.getFullYear();

  if (age < VALIDATION.dateOfBirth.minAge) {
    return { valid: false, error: `En az ${VALIDATION.dateOfBirth.minAge} yaşında olmalısınız` };
  }

  if (age > VALIDATION.dateOfBirth.maxAge) {
    return { valid: false, error: 'Geçersiz doğum tarihi' };
  }

  return { valid: true };
};

/**
 * EditProfileForm Component
 *
 * Features:
 * - Real-time validation
 * - Gender selection
 * - Date of birth with age validation
 * - Character counters
 * - Dirty state tracking
 */
export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  onSubmit,
  isLoading = false,
  onCancel,
}) => {
  const colors = useColors();

  // Form state
  const [formData, setFormData] = useState({
    name: profile.name || '',
    surname: profile.surname || '',
    bio: profile.bio || '',
    dateOfBirth: formatDateForDisplay(profile.dateOfBirth),
    gender: profile.gender,
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track dirty state
  const isDirty = useMemo(() => {
    return (
      formData.name !== (profile.name || '') ||
      formData.surname !== (profile.surname || '') ||
      formData.bio !== (profile.bio || '') ||
      formData.dateOfBirth !== formatDateForDisplay(profile.dateOfBirth) ||
      formData.gender !== profile.gender
    );
  }, [formData, profile]);

  // Update field
  const updateField = useCallback((field: string, value: string | Gender | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Ad gerekli';
    } else if (formData.name.length < VALIDATION.name.minLength) {
      newErrors.name = `Ad en az ${VALIDATION.name.minLength} karakter olmalı`;
    } else if (formData.name.length > VALIDATION.name.maxLength) {
      newErrors.name = `Ad en fazla ${VALIDATION.name.maxLength} karakter olabilir`;
    }

    // Surname
    if (!formData.surname.trim()) {
      newErrors.surname = 'Soyad gerekli';
    } else if (formData.surname.length < VALIDATION.surname.minLength) {
      newErrors.surname = `Soyad en az ${VALIDATION.surname.minLength} karakter olmalı`;
    } else if (formData.surname.length > VALIDATION.surname.maxLength) {
      newErrors.surname = `Soyad en fazla ${VALIDATION.surname.maxLength} karakter olabilir`;
    }

    // Bio (optional but with max length)
    if (formData.bio.length > VALIDATION.bio.maxLength) {
      newErrors.bio = `Bio en fazla ${VALIDATION.bio.maxLength} karakter olabilir`;
    }

    // Date of birth
    const dateValidation = validateDate(formData.dateOfBirth);
    if (!dateValidation.valid) {
      newErrors.dateOfBirth = dateValidation.error || 'Geçersiz tarih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    const updateData: UpdateProfileRequest = {};

    // Only include changed fields
    if (formData.name !== profile.name) {
      updateData.name = formData.name.trim();
    }
    if (formData.surname !== profile.surname) {
      updateData.surname = formData.surname.trim();
    }
    if (formData.bio !== (profile.bio || '')) {
      updateData.bio = formData.bio.trim() || undefined;
    }
    if (formData.dateOfBirth !== formatDateForDisplay(profile.dateOfBirth)) {
      updateData.dateOfBirth = formatDateForApi(formData.dateOfBirth);
    }
    if (formData.gender !== profile.gender) {
      updateData.gender = formData.gender || undefined;
    }

    await onSubmit(updateData);
  }, [validateForm, formData, profile, onSubmit]);

  // Gender selector component
  const GenderSelector: React.FC = () => (
    <View style={styles.genderContainer}>
      {GENDER_OPTIONS.map(option => {
        const isSelected = formData.gender === option.value;
        return (
          <Button
            key={option.value || 'null'}
            title={option.label}
            variant={isSelected ? 'primary' : 'outline'}
            size="sm"
            onPress={() => updateField('gender', option.value)}
            style={styles.genderButton}
          />
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Ad <Text style={{ color: colors.status.error }}>*</Text>
          </Text>
          <Input
            value={formData.name}
            onChangeText={text => updateField('name', text)}
            placeholder="Adınız"
            autoCapitalize="words"
            maxLength={VALIDATION.name.maxLength}
            error={errors.name}
          />
          <Text style={[styles.charCount, { color: colors.text.tertiary }]}>
            {formData.name.length}/{VALIDATION.name.maxLength}
          </Text>
        </View>

        {/* Surname */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>
            Soyad <Text style={{ color: colors.status.error }}>*</Text>
          </Text>
          <Input
            value={formData.surname}
            onChangeText={text => updateField('surname', text)}
            placeholder="Soyadınız"
            autoCapitalize="words"
            maxLength={VALIDATION.surname.maxLength}
            error={errors.surname}
          />
          <Text style={[styles.charCount, { color: colors.text.tertiary }]}>
            {formData.surname.length}/{VALIDATION.surname.maxLength}
          </Text>
        </View>

        {/* Bio */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Hakkında</Text>
          <Input
            value={formData.bio}
            onChangeText={text => updateField('bio', text)}
            placeholder="Kendinizi kısaca tanıtın..."
            multiline
            numberOfLines={4}
            maxLength={VALIDATION.bio.maxLength}
            error={errors.bio}
            containerStyle={styles.bioInput}
          />
          <Text style={[styles.charCount, { color: colors.text.tertiary }]}>
            {formData.bio.length}/{VALIDATION.bio.maxLength}
          </Text>
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Doğum Tarihi</Text>
          <Input
            value={formData.dateOfBirth}
            onChangeText={text => updateField('dateOfBirth', text)}
            placeholder="GG/AA/YYYY"
            keyboardType="numeric"
            maxLength={10}
            error={errors.dateOfBirth}
          />
          <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
            Örnek: 15/03/1990
          </Text>
        </View>

        {/* Gender */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Cinsiyet</Text>
          <GenderSelector />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Kaydet"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!isDirty || isLoading}
            style={styles.submitButton}
          />
          {onCancel && (
            <Button
              title="İptal"
              variant="ghost"
              onPress={onCancel}
              disabled={isLoading}
              style={styles.cancelButton}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    // Ghost variant styling
  },
  charCount: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  container: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  genderButton: {
    marginBottom: spacing.xs,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  submitButton: {
    // Default styling
  },
});

export default EditProfileForm;
