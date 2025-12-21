// src/shared/utils/validationUtils.ts
// Dengin Design System - Validation Utilities
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validation rule type
 */
export type ValidationRule<T = string> = (value: T) => ValidationResult;

// ============================================
// EMAIL VALIDATION
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'E-posta adresi gereklidir' };
  }
  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Geçerli bir e-posta adresi giriniz' };
  }
  return { isValid: true };
}

// ============================================
// PHONE VALIDATION
// ============================================

const TURKEY_PHONE_REGEX = /^(05|5)[0-9]{9}$/;

/**
 * Validate Turkish phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return TURKEY_PHONE_REGEX.test(cleaned);
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Telefon numarası gereklidir' };
  }

  const cleaned = phone.replace(/\D/g, '');

  if (!isValidPhoneNumber(cleaned)) {
    return { isValid: false, error: 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)' };
  }
  return { isValid: true };
}

// ============================================
// PASSWORD VALIDATION
// ============================================

export interface PasswordStrength {
  score: number; // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  suggestions: string[];
}

const PASSWORD_MIN_LENGTH = 8;

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return { score: 0, label: 'weak', suggestions: ['Şifre gereklidir'] };
  }

  // Length check
  if (password.length >= PASSWORD_MIN_LENGTH) {
    score += 1;
  } else {
    suggestions.push(`En az ${PASSWORD_MIN_LENGTH} karakter olmalıdır`);
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('En az bir büyük harf ekleyin');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('En az bir küçük harf ekleyin');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('En az bir rakam ekleyin');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Özel karakter ekleyin (!@#$%^&*)');
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(score, 4);

  const labels: PasswordStrength['label'][] = ['weak', 'fair', 'good', 'strong', 'very-strong'];

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    suggestions,
  };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Şifre gereklidir' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: `Şifre en az ${PASSWORD_MIN_LENGTH} karakter olmalıdır` };
  }

  const strength = checkPasswordStrength(password);
  if (strength.score < 2) {
    return { isValid: false, error: strength.suggestions[0] || 'Daha güçlü bir şifre seçin' };
  }

  return { isValid: true };
}

export function validatePasswordConfirm(
  password: string,
  confirmPassword: string,
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Şifre tekrarı gereklidir' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Şifreler eşleşmiyor' };
  }
  return { isValid: true };
}

// ============================================
// USERNAME VALIDATION
// ============================================

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

export function isValidUsername(username: string): boolean {
  if (!username || username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return false;
  }
  return USERNAME_REGEX.test(username);
}

export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Kullanıcı adı gereklidir' };
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Kullanıcı adı en az ${USERNAME_MIN_LENGTH} karakter olmalıdır`,
    };
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Kullanıcı adı en fazla ${USERNAME_MAX_LENGTH} karakter olmalıdır`,
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { isValid: false, error: 'Sadece harf, rakam ve alt çizgi kullanabilirsiniz' };
  }

  return { isValid: true };
}

// ============================================
// NAME VALIDATION
// ============================================

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;

export function validateName(name: string, fieldName: string = 'Ad'): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} gereklidir` };
  }

  if (name.trim().length < NAME_MIN_LENGTH) {
    return { isValid: false, error: `${fieldName} en az ${NAME_MIN_LENGTH} karakter olmalıdır` };
  }

  if (name.length > NAME_MAX_LENGTH) {
    return { isValid: false, error: `${fieldName} en fazla ${NAME_MAX_LENGTH} karakter olmalıdır` };
  }

  return { isValid: true };
}

// ============================================
// BIO VALIDATION
// ============================================

const BIO_MAX_LENGTH = 150;

export function validateBio(bio: string): ValidationResult {
  if (bio && bio.length > BIO_MAX_LENGTH) {
    return { isValid: false, error: `Biyografi en fazla ${BIO_MAX_LENGTH} karakter olmalıdır` };
  }
  return { isValid: true };
}

// ============================================
// URL VALIDATION
// ============================================

const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: true }; // URL is optional
  }
  if (!isValidUrl(url)) {
    return { isValid: false, error: 'Geçerli bir URL giriniz' };
  }
  return { isValid: true };
}

// ============================================
// OTP VALIDATION
// ============================================

export function validateOtp(otp: string, length: number = 6): ValidationResult {
  if (!otp) {
    return { isValid: false, error: 'Doğrulama kodu gereklidir' };
  }

  const cleanOtp = otp.replace(/\D/g, '');

  if (cleanOtp.length !== length) {
    return { isValid: false, error: `Doğrulama kodu ${length} haneli olmalıdır` };
  }

  return { isValid: true };
}

// ============================================
// GENERIC VALIDATORS
// ============================================

export function required(
  value: string | null | undefined,
  fieldName: string = 'Bu alan',
): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} gereklidir` };
  }
  return { isValid: true };
}

export function minLength(
  value: string,
  min: number,
  fieldName: string = 'Bu alan',
): ValidationResult {
  if (!value || value.length < min) {
    return { isValid: false, error: `${fieldName} en az ${min} karakter olmalıdır` };
  }
  return { isValid: true };
}

export function maxLength(
  value: string,
  max: number,
  fieldName: string = 'Bu alan',
): ValidationResult {
  if (value && value.length > max) {
    return { isValid: false, error: `${fieldName} en fazla ${max} karakter olmalıdır` };
  }
  return { isValid: true };
}

// ============================================
// COMPOSITE VALIDATORS
// ============================================

/**
 * Run multiple validation rules
 */
export function validate<T>(value: T, ...rules: ValidationRule<T>[]): ValidationResult {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

/**
 * Create a combined validator
 */
export function combineValidators<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T) => validate(value, ...rules);
}
