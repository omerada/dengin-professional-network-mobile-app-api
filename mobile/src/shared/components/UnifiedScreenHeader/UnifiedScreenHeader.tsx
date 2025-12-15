// src/shared/components/UnifiedScreenHeader/UnifiedScreenHeader.tsx
// PRODUCTION: Unified Screen Header System
// Replaces: FeedHeader, ChatHeader, ScreenHeader (consolidates all variants)
// Oku: UX-FLOW-ANALYSIS-REPORT.md - Phase 1.1

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { UNIFIED_HEADER } from '@constants/layoutConstants';
import { UNIFIED_TIMING } from '@constants/unifiedTiming';
import { BackButton } from '../BackButton';
import { AnimatedBadge } from '../AnimatedBadge';
import { SearchBar } from '../SearchBar';

import { styles } from './UnifiedScreenHeader.styles';
import type { UnifiedScreenHeaderProps } from './UnifiedScreenHeader.types';

/**
 * UnifiedScreenHeader - Production Standard
 *
 * Single header component for ALL screens with multiple variants:
 * - 'default': Standard header with title (56px)
 * - 'feed': Feed header with sector icon + notifications (56px)
 * - 'chat': Chat header with avatar + online status (56px)
 * - 'search': Header with integrated search bar (100px total: 56px + 44px)
 * - 'profile': Profile stats as header (custom height)
 *
 * Benefits:
 * - Consistent 56px height across all screens (except search variant)
 * - Unified animations, haptics, and behavior
 * - Single source of truth for header logic
 * - Easy to maintain and extend
 *
 * @example
 * ```tsx
 * // Default header
 * <UnifiedScreenHeader variant="default" title="Ayarlar" />
 *
 * // Feed header
 * <UnifiedScreenHeader
 *   variant="feed"
 *   feedProps={{
 *     sector: { name: 'Sağlık', code: 'MEDICAL' },
 *     unreadCount: 3,
 *     onNotificationPress: () => navigate('Notifications'),
 *   }}
 * />
 *
 * // Chat header
 * <UnifiedScreenHeader
 *   variant="chat"
 *   chatProps={{
 *     avatar: 'https://...',
 *     name: 'Ahmet Yılmaz',
 *     subtitle: 'çevrimiçi',
 *     isOnline: true,
 *   }}
 * />
 *
 * // Search header
 * <UnifiedScreenHeader
 *   variant="search"
 *   searchProps={{
 *     placeholder: 'Mesaj ara...',
 *     onSearch: (text) => search(text),
 *   }}
 * />
 * ```
 */
export const UnifiedScreenHeader = memo<UnifiedScreenHeaderProps>(
  ({
    variant = 'default',
    title,
    subtitle,
    showBackButton = true,
    onBackPress,
    rightElement,
    showBorder = true,
    backgroundColor,
    // Variant-specific props
    feedProps,
    chatProps,
    searchProps,
    style,
    testID = 'unified-screen-header',
  }) => {
    const colors = useColors();
    const { triggerNavigation, triggerSystem } = useSemanticHaptic();

    const bgColor = backgroundColor || colors.background.primary;

    // ========================================================================
    // Default Variant
    // ========================================================================
    if (variant === 'default') {
      return (
        <Animated.View
          entering={FadeIn.duration(UNIFIED_TIMING.headerEnter)}
          style={[
            styles.container,
            {
              backgroundColor: bgColor,
              borderBottomColor: colors.border.subtle,
              borderBottomWidth: showBorder ? 1 : 0,
              height: UNIFIED_HEADER.HEIGHT,
            },
            style,
          ]}
          testID={testID}>
          {/* Left: Back Button */}
          <View style={styles.leftSection}>
            {showBackButton && <BackButton onPress={onBackPress} variant="circular" />}
          </View>

          {/* Center: Title & Subtitle */}
          <View style={styles.centerSection}>
            {title && (
              <Text
                style={[styles.title, { color: colors.text.primary }]}
                numberOfLines={1}
                accessibilityRole="header">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.text.tertiary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right: Custom Element */}
          <View style={styles.rightSection}>{rightElement}</View>
        </Animated.View>
      );
    }

    // ========================================================================
    // Feed Variant
    // ========================================================================
    if (variant === 'feed' && feedProps) {
      const handleNotificationPress = useCallback(() => {
        triggerNavigation('navigate');
        feedProps.onNotificationPress?.();
      }, [feedProps]);

      const handleSearchPress = useCallback(() => {
        triggerNavigation('navigate');
        feedProps.onSearchPress?.();
      }, [feedProps]);

      return (
        <Animated.View
          entering={FadeIn.duration(UNIFIED_TIMING.headerEnter)}
          style={[
            styles.container,
            {
              backgroundColor: bgColor,
              borderBottomColor: colors.border.subtle,
              borderBottomWidth: showBorder ? 1 : 0,
              height: UNIFIED_HEADER.HEIGHT,
            },
            style,
          ]}
          testID={testID}>
          {/* Left: Sector/Profession Icon */}
          <View style={styles.leftSection}>
            {feedProps.sector ? (
              <Pressable
                onPress={() => {
                  triggerNavigation('navigate');
                  feedProps.onSectorPress?.();
                }}
                style={[
                  styles.sectorIconContainer,
                  { backgroundColor: colors.background.secondary },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="briefcase" size={24} color={colors.interactive.default} />
              </Pressable>
            ) : (
              <Icon name="home" size={28} color={colors.interactive.default} />
            )}
          </View>

          {/* Center: "Ana Sayfa" + Sector Name */}
          <View style={styles.centerSection}>
            <Text style={[styles.title, { color: colors.text.primary }]}>Ana Sayfa</Text>
            {feedProps.sector && (
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                {feedProps.sector.name}
              </Text>
            )}
          </View>

          {/* Right: Search + Notifications */}
          <View style={styles.rightSection}>
            {/* Search Icon */}
            {feedProps.onSearchPress && (
              <Pressable
                onPress={handleSearchPress}
                style={[styles.iconButton, { marginRight: 8 }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Ara">
                <Icon name="search-outline" size={24} color={colors.text.primary} />
              </Pressable>
            )}

            {/* Notification Icon with Badge */}
            <Pressable
              onPress={handleNotificationPress}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Bildirimler ${feedProps.unreadCount > 0 ? `, ${feedProps.unreadCount} okunmamış` : ''}`}>
              <Icon name="notifications-outline" size={24} color={colors.text.primary} />
              {feedProps.unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <AnimatedBadge
                    count={feedProps.unreadCount}
                    variant="error"
                    size="md"
                    pulse
                    animateOnChange
                  />
                </View>
              )}
            </Pressable>
          </View>
        </Animated.View>
      );
    }

    // ========================================================================
    // Chat Variant
    // ========================================================================
    if (variant === 'chat' && chatProps) {
      const handleBackPress = useCallback(() => {
        triggerNavigation('back');
        onBackPress?.();
      }, [onBackPress]);

      const handleProfilePress = useCallback(() => {
        triggerNavigation('navigate');
        chatProps.onProfilePress?.();
      }, [chatProps]);

      const handleOptionsPress = useCallback(() => {
        triggerSystem('confirm');
        chatProps.onOptionsPress?.();
      }, [chatProps]);

      return (
        <Animated.View
          entering={FadeIn.duration(UNIFIED_TIMING.headerEnter)}
          style={[
            styles.container,
            {
              backgroundColor: bgColor,
              borderBottomColor: colors.border.subtle,
              borderBottomWidth: showBorder ? 1 : 0,
              height: UNIFIED_HEADER.HEIGHT,
            },
            style,
          ]}
          testID={testID}>
          {/* Left: Back Button */}
          <View style={styles.leftSection}>
            <BackButton onPress={handleBackPress} variant="circular" />
          </View>

          {/* Center: Avatar + Name + Status */}
          <Pressable
            onPress={handleProfilePress}
            style={styles.chatCenterSection}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {/* Avatar with online indicator */}
            <View style={styles.avatarContainer}>
              {chatProps.avatar ? (
                <Image
                  source={{ uri: chatProps.avatar }}
                  style={[styles.avatar, { borderColor: colors.border.subtle }]}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarPlaceholder,
                    { backgroundColor: colors.background.secondary },
                  ]}>
                  <Icon name="person" size={20} color={colors.text.secondary} />
                </View>
              )}
              {chatProps.isOnline && (
                <View
                  style={[
                    styles.onlineIndicator,
                    { backgroundColor: colors.status.success, borderColor: bgColor },
                  ]}
                />
              )}
            </View>

            {/* Name + Status */}
            <View style={styles.chatInfo}>
              <Text style={[styles.chatName, { color: colors.text.primary }]} numberOfLines={1}>
                {chatProps.name}
              </Text>
              {chatProps.subtitle && (
                <Text
                  style={[styles.chatStatus, { color: colors.text.tertiary }]}
                  numberOfLines={1}>
                  {chatProps.subtitle}
                </Text>
              )}
            </View>
          </Pressable>

          {/* Right: Options */}
          <View style={styles.rightSection}>
            {chatProps.onOptionsPress && (
              <Pressable
                onPress={handleOptionsPress}
                style={styles.iconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Seçenekler">
                <Icon name="ellipsis-vertical" size={24} color={colors.text.primary} />
              </Pressable>
            )}
          </View>
        </Animated.View>
      );
    }

    // ========================================================================
    // Search Variant (100px total: 56px header + 44px search bar)
    // ========================================================================
    if (variant === 'search' && searchProps) {
      return (
        <Animated.View
          entering={FadeIn.duration(UNIFIED_TIMING.headerEnter)}
          style={[
            styles.searchContainer,
            {
              backgroundColor: bgColor,
              borderBottomColor: colors.border.subtle,
              borderBottomWidth: showBorder ? 1 : 0,
            },
            style,
          ]}
          testID={testID}>
          {/* Top Row: Title + Right Element (56px) */}
          <View style={[styles.container, { height: UNIFIED_HEADER.HEIGHT, borderBottomWidth: 0 }]}>
            <View style={styles.leftSection}>
              {showBackButton && <BackButton onPress={onBackPress} variant="circular" />}
            </View>
            <View style={styles.centerSection}>
              {title && (
                <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
                  {title}
                </Text>
              )}
            </View>
            <View style={styles.rightSection}>{rightElement}</View>
          </View>

          {/* Bottom Row: Search Bar (44px) */}
          <View style={styles.searchBarContainer}>
            <SearchBar
              placeholder={searchProps.placeholder || 'Ara...'}
              value={searchProps.value || ''}
              onChangeText={(searchProps.onChangeText || searchProps.onSearch) ?? (() => {})}
              onClear={searchProps.onClear}
              onFilterPress={searchProps.onFilterPress}
              showFilter={searchProps.showFilter}
              autoFocus={searchProps.autoFocus}
            />
          </View>
        </Animated.View>
      );
    }

    // Fallback: default if variant not matched
    return (
      <Animated.View
        entering={FadeIn.duration(UNIFIED_TIMING.headerEnter)}
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            borderBottomColor: colors.border.subtle,
            borderBottomWidth: showBorder ? 1 : 0,
            height: UNIFIED_HEADER.HEIGHT,
          },
          style,
        ]}
        testID={testID}>
        <View style={styles.centerSection}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{title || 'Header'}</Text>
        </View>
      </Animated.View>
    );
  },
);

UnifiedScreenHeader.displayName = 'UnifiedScreenHeader';
