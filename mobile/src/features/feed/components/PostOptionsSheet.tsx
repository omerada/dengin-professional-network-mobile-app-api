// src/features/feed/components/PostOptionsSheet.tsx
// Production-ready Post Options Bottom Sheet
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { BottomSheet } from '@shared/components';
import { spacing, fontSize, borderRadius } from '@theme';

// ============================================================================
// Types
// ============================================================================

export interface PostOptionsSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface PostOption {
  id: string;
  icon: string;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

interface PostOptionsSheetProps {
  /** Is this the current user's post */
  isOwnPost: boolean;
  /** Is post bookmarked */
  isBookmarked: boolean;
  /** Is user following the author */
  isFollowing: boolean;
  /** Callback for save/unsave action */
  onToggleBookmark: () => void;
  /** Callback for follow/unfollow action */
  onToggleFollow: () => void;
  /** Callback for share action */
  onShare: () => void;
  /** Callback for report action */
  onReport: () => void;
  /** Callback for edit action (own posts only) */
  onEdit?: () => void;
  /** Callback for delete action (own posts only) */
  onDelete?: () => void;
  /** Callback for copy link action */
  onCopyLink: () => void;
}

// ============================================================================
// PostOptionsSheet Component
// ============================================================================

/**
 * Post Options Bottom Sheet Menu
 *
 * Context-aware actions based on:
 * - Own post vs other's post
 * - Following status
 * - Bookmark status
 *
 * Features:
 * - Instagram-style menu
 * - Haptic feedback
 * - Animated backdrop
 * - Accessible
 *
 * @example
 * ```tsx
 * const sheetRef = useRef<PostOptionsSheetRef>(null);
 *
 * <PostOptionsSheet
 *   ref={sheetRef}
 *   isOwnPost={false}
 *   isBookmarked={true}
 *   isFollowing={false}
 *   onToggleBookmark={handleBookmark}
 *   onToggleFollow={handleFollow}
 *   onShare={handleShare}
 *   onReport={handleReport}
 *   onCopyLink={handleCopyLink}
 * />
 *
 * <Pressable onPress={() => sheetRef.current?.present()}>
 *   <Icon name="ellipsis-horizontal" />
 * </Pressable>
 * ```
 */
export const PostOptionsSheet = forwardRef<PostOptionsSheetRef, PostOptionsSheetProps>(
  (
    {
      isOwnPost,
      isBookmarked,
      isFollowing,
      onToggleBookmark,
      onToggleFollow,
      onShare,
      onReport,
      onEdit,
      onDelete,
      onCopyLink,
    },
    ref,
  ) => {
    const colors = useColors();
    const { triggerContent, triggerSocial, triggerSystem } = useSemanticHaptic();
    const [visible, setVisible] = React.useState(false);

    // Expose methods to parent
    React.useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      dismiss: () => setVisible(false),
    }));

    // Options configuration
    const options: PostOption[] = useMemo(() => {
      if (isOwnPost) {
        // Own post options
        return [
          {
            id: 'edit',
            icon: 'create-outline',
            label: 'Gönderiyi Düzenle',
            onPress: () => {
              triggerContent('edit');
              setVisible(false);
              onEdit?.();
            },
          },
          {
            id: 'delete',
            icon: 'trash-outline',
            label: 'Gönderiyi Sil',
            destructive: true,
            onPress: () => {
              triggerContent('delete');
              setVisible(false);
              onDelete?.();
            },
          },
          {
            id: 'copyLink',
            icon: 'link-outline',
            label: 'Bağlantıyı Kopyala',
            onPress: () => {
              triggerSystem('success');
              setVisible(false);
              onCopyLink();
            },
          },
        ];
      }

      // Other's post options
      return [
        {
          id: 'bookmark',
          icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
          label: isBookmarked ? 'Kayıtlılardan Kaldır' : 'Kaydet',
          onPress: () => {
            triggerSocial(isBookmarked ? 'unlike' : 'like');
            setVisible(false);
            onToggleBookmark();
          },
        },
        {
          id: 'follow',
          icon: isFollowing ? 'person-remove-outline' : 'person-add-outline',
          label: isFollowing ? 'Takibi Bırak' : 'Takip Et',
          onPress: () => {
            triggerSocial(isFollowing ? 'unfollow' : 'follow');
            setVisible(false);
            onToggleFollow();
          },
        },
        {
          id: 'share',
          icon: 'share-outline',
          label: 'Paylaş',
          onPress: () => {
            triggerSocial('share');
            setVisible(false);
            onShare();
          },
        },
        {
          id: 'copyLink',
          icon: 'link-outline',
          label: 'Bağlantıyı Kopyala',
          onPress: () => {
            triggerSystem('success');
            setVisible(false);
            onCopyLink();
          },
        },
        {
          id: 'report',
          icon: 'flag-outline',
          label: 'Şikayet Et',
          destructive: true,
          onPress: () => {
            triggerSystem('alert');
            setVisible(false);
            onReport();
          },
        },
      ];
    }, [
      isOwnPost,
      isBookmarked,
      isFollowing,
      onToggleBookmark,
      onToggleFollow,
      onShare,
      onReport,
      onEdit,
      onDelete,
      onCopyLink,
      triggerContent,
      triggerSocial,
      triggerSystem,
    ]);

    return (
      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={isOwnPost ? 'Gönderi Seçenekleri' : 'Eylemler'}
        height="auto"
        swipeToDismiss={true}>
        <View style={styles.optionsContainer}>
          {options.map(option => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: pressed ? colors.background.secondary : 'transparent' },
              ]}
              onPress={option.onPress}
              android_ripple={{ color: colors.background.secondary }}>
              <Icon
                name={option.icon}
                size={24}
                color={option.destructive ? colors.status.error : colors.text.primary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: option.destructive ? colors.status.error : colors.text.primary,
                  },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    );
  },
);

PostOptionsSheet.displayName = 'PostOptionsSheet';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  optionsContainer: {
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 56,
  },
  optionLabel: {
    fontSize: fontSize.base,
    fontWeight: '500',
    marginLeft: spacing.md,
  },
});
