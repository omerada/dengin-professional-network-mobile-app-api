// __tests__/unit/auth/authSchemas.test.ts
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from '../../../src/features/auth/validation/authSchemas';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('geçerli email ve şifre ile doğrulamalı', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('geçersiz email için hata vermeli', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('boş email için hata vermeli', () => {
      const invalidData = {
        email: '',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('kısa şifre için hata vermeli', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });

  describe('registerSchema', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    };

    it('geçerli kayıt verisi ile doğrulamalı', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('eşleşmeyen şifreler için hata vermeli', () => {
      const invalidData = {
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('kabul edilmemiş koşullar için hata vermeli', () => {
      const invalidData = {
        ...validRegisterData,
        acceptTerms: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('kısa ad için hata vermeli', () => {
      const invalidData = {
        ...validRegisterData,
        firstName: 'A',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('zayıf şifre için hata vermeli', () => {
      const invalidData = {
        ...validRegisterData,
        password: 'password',
        confirmPassword: 'password',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('opsiyonel telefon numarası boş olabilmeli', () => {
      const dataWithEmptyPhone = {
        ...validRegisterData,
        phoneNumber: '',
      };

      const result = registerSchema.safeParse(dataWithEmptyPhone);
      expect(result.success).toBe(true);
    });

    it('geçersiz telefon numarası için hata vermeli', () => {
      const invalidData = {
        ...validRegisterData,
        phoneNumber: '123456',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('geçerli Türk telefon numarası kabul etmeli', () => {
      const validData = {
        ...validRegisterData,
        phoneNumber: '5551234567',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('geçerli email ile doğrulamalı', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('geçersiz email için hata vermeli', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
