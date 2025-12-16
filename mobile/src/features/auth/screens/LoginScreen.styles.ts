// src/features/auth/screens/LoginScreen.styles.ts
// Login Screen Styles - Separated for maintainability
// Oku: UX-FLOW-IYILESTIRME-RAPORU.md Phase 1

import { StyleSheet } from 'react-native';
import { spacing, typography } from '@theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    ...typography.h1,
    letterSpacing: 1,
  },
  slogan: {
    ...typography.body1,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Form Section (Priority: Email/Password)
  form: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },

  // Actions (Submit Button)
  actions: {
    marginBottom: spacing.xl,
  },

  // Divider
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: spacing.lg,
  },

  // Social Login (Secondary: Below Email/Password)
  socialSection: {
    marginBottom: spacing.lg,
  },
  socialTitle: {
    ...typography.subtitle2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  socialButtonsColumn: {
    gap: spacing.md,
  },
  socialButtonLarge: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  socialButtonLargeText: {
    ...typography.button,
  },

  // Error Message
  errorContainer: {
    alignItems: 'flex-start',
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  errorAction: {
    ...typography.body2,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Footer: Register CTA (Fixed position)
  footer: {
    paddingVertical: spacing.lg,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
});
