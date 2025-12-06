// src/core/navigation/components/AnimatedTabBar/AnimatedTabBar.styles.ts
// Meslektaş Design System - AnimatedTabBar Styles
// Oku: mobile-development-guide/ui-ux-modernization/06-MICRO-INTERACTIONS.md

import { StyleSheet, Platform } from 'react-native';
import { spacing } from '@theme';

export const TAB_BAR_HEIGHT = Platform.select({ ios: 84, android: 68 }) ?? 68;
export const TAB_ICON_SIZE = 26;
export const TAB_BADGE_SIZE = 18;

export const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    borderRadius: TAB_BADGE_SIZE / 2,
    borderWidth: 2,
    height: TAB_BADGE_SIZE,
    justifyContent: 'center',
    minWidth: TAB_BADGE_SIZE,
    paddingHorizontal: 4,
    position: 'absolute',
    right: 6,
    top: -4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  container: {
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    left: 0,
    paddingBottom: Platform.select({ ios: 30, android: 10 }),
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    position: 'absolute',
    right: 0,
  },
  dotBadge: {
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    right: 10,
    top: 0,
    width: 8,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 48,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
});
