// src/features/auth/validation/authSchemas.ts
// Oku: mobile-development-guide/ui/19-FORMS.md

import { z } from 'zod';

/**
 * Email validation regex
 */
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password requirements
 * - At least 8 characters
 * - At least one uppercase letter
 */
const passwordRegex = /^(?=.*[A-Z]).{8,}$/;

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gerekli')
    .regex(emailRegex, 'Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gerekli').min(8, 'Şifre en az 8 karakter olmalı'),
  rememberMe: z.boolean().optional(),
});

/**
 * Register form validation schema (LEGACY - for RegisterScreenMultiStep)
 * Updated for Sprint 1: Sector-based community structure
 *
 * Note: professionId is optional for OTHER sector
 * When OTHER sector selected, customProfession is required
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'E-posta adresi gerekli')
      .regex(emailRegex, 'Geçerli bir e-posta adresi giriniz'),
    password: z
      .string()
      .min(1, 'Şifre gerekli')
      .min(8, 'Şifre en az 8 karakter olmalı')
      .regex(passwordRegex, 'Şifre en az 8 karakter ve bir büyük harf içermeli'),
    confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
    firstName: z
      .string()
      .min(1, 'Ad gerekli')
      .min(2, 'Ad en az 2 karakter olmalı')
      .max(50, 'Ad en fazla 50 karakter olabilir'),
    lastName: z
      .string()
      .min(1, 'Soyad gerekli')
      .min(2, 'Soyad en az 2 karakter olmalı')
      .max(50, 'Soyad en fazla 50 karakter olabilir'),
    // Sector field (required)
    sectorId: z.number({
      required_error: 'Sektör seçimi zorunludur',
      invalid_type_error: 'Sektör seçimi zorunludur',
    }),
    // Profession field (optional - for non-OTHER sectors)
    professionId: z.number().optional().nullable(),
    // Custom profession (required for OTHER sector)
    customProfession: z
      .string()
      .max(100, 'Meslek en fazla 100 karakter olabilir')
      .optional()
      .or(z.literal('')),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'Kullanım koşullarını kabul etmeniz gerekli',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })
  .refine(
    data => {
      // Either professionId or customProfession must be provided
      if (!data.professionId && (!data.customProfession || data.customProfession.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Meslek seçimi veya meslek girişi zorunludur',
      path: ['customProfession'],
    },
  );

/**
 * Optimized Register form validation schema (for RegisterScreenOptimized)
 * Modern 2-step approach:
 * - Step 1 (Essentials): email, password, firstName, lastName
 * - Step 2 (Professional - Optional): sectorId, professionId, customProfession
 *
 * Key UX improvements:
 * - No confirmPassword (uses password strength indicator instead)
 * - Sector/profession fully optional (can be skipped)
 * - Implicit terms acceptance (no checkbox)
 */
export const registerOptimizedSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gerekli')
    .regex(emailRegex, 'Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre gerekli')
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(passwordRegex, 'Şifre en az 8 karakter ve bir büyük harf içermeli'),
  firstName: z
    .string()
    .min(1, 'Ad gerekli')
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z
    .string()
    .min(1, 'Soyad gerekli')
    .min(2, 'Soyad en az 2 karakter olmalı')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  // Professional info - all optional
  sectorId: z.number().optional().nullable(),
  professionId: z.number().optional().nullable(),
  customProfession: z
    .string()
    .max(100, 'Meslek en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
});

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gerekli')
    .regex(emailRegex, 'Geçerli bir e-posta adresi giriniz'),
});

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Şifre gerekli')
      .min(8, 'Şifre en az 8 karakter olmalı')
      .regex(passwordRegex, 'Şifre en az 8 karakter ve bir büyük harf içermeli'),
    confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

/**
 * Change password form validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
    newPassword: z
      .string()
      .min(1, 'Yeni şifre gerekli')
      .min(8, 'Şifre en az 8 karakter olmalı')
      .regex(passwordRegex, 'Şifre en az 8 karakter ve bir büyük harf içermeli'),
    confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'Yeni şifre mevcut şifreden farklı olmalı',
    path: ['newPassword'],
  });

// Type exports for form data
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type RegisterOptimizedSchemaType = z.infer<typeof registerOptimizedSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
