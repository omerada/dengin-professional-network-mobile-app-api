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
 * Register form validation schema
 * Updated for Sprint 1: Sector-based community structure
 *
 * Note: Both profession and sector fields supported for backward compatibility
 * During migration period, prefer sectorId over professionId
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
    // Sector field (new - Sprint 1)
    sectorId: z.number({
      required_error: 'Sektör seçimi zorunludur',
      invalid_type_error: 'Sektör seçimi zorunludur',
    }),
    // Profession fields (deprecated - kept for backward compatibility)
    professionId: z.number().optional(),
    customProfession: z.string().max(100, 'Meslek en fazla 100 karakter olabilir').optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'Kullanım koşullarını kabul etmeniz gerekli',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
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
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
