// src/features/verification/screens/VerificationIntroScreen.styles.ts
// VerificationIntro Screen Styles - Separated for maintainability
// Oku: UX-FLOW-IYILESTIRME-RAPORU.md Phase 1

import { StyleSheet } from 'react-native';
import { spacing, typography, fontSize, borderRadius } from '@theme';

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  stepIndicator: {
    marginBottom: spacing.xl,
  },

  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Steps Section
  stepsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },

  // Info Card
  infoCard: {
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  // Requirements Section
  requirementsSection: {
    marginBottom: spacing.xl,
  },
  requirementsList: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  requirementItem: {
    fontSize: fontSize.sm,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },

  // Security Note
  securityNote: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  securityText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  // Footer (Sticky)
  footer: {
    borderTopWidth: 1,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
});
