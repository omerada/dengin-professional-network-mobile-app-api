// src/shared/components/UnifiedScreenHeader/UnifiedScreenHeader.styles.ts

import { StyleSheet } from 'react-native';
import { UNIFIED_HEADER } from '@constants/layoutConstants';
import { spacing } from '@theme';

export const styles = StyleSheet.create({
  // Base container (56px height enforced)
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: UNIFIED_HEADER.PADDING_HORIZONTAL,
    height: UNIFIED_HEADER.HEIGHT,
  },

  // Search variant container (100px total)
  searchContainer: {
    paddingHorizontal: UNIFIED_HEADER.PADDING_HORIZONTAL,
  },

  searchBarContainer: {
    paddingTop: spacing['2'],
    paddingBottom: spacing['2'],
    height: 44,
  },

  // Section layouts
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
  },

  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2'],
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 44,
  },

  // Typography
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },

  // Feed variant
  sectorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  // Chat variant
  chatCenterSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2'],
  },

  avatarContainer: {
    position: 'relative',
    marginRight: spacing['2'],
  },

  avatar: {
    width: UNIFIED_HEADER.AVATAR_SIZE,
    height: UNIFIED_HEADER.AVATAR_SIZE,
    borderRadius: UNIFIED_HEADER.AVATAR_SIZE / 2,
    borderWidth: 1,
  },

  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },

  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  chatName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },

  chatStatus: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
});
