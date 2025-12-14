// src/features/feed/components/PostOptionsSheet.tsx
// Production-ready Post Options Bottom Sheet
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { spacing, fontSize, borderRadius } from '@theme';

// TODO: Install @gorhom/bottom-sheet package
// For now, using Modal as fallback

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
    const { trigger } = useHaptic();
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
              trigger('light');
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
              trigger('warning');
              setVisible(false);
              onDelete?.();
            },
          },
          {
            id: 'copyLink',
            icon: 'link-outline',
            label: 'Bağlantıyı Kopyala',
            onPress: () => {
              trigger('light');
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
            trigger('light');
            setVisible(false);
            onToggleBookmark();
          },
        },
        {
          id: 'follow',
          icon: isFollowing ? 'person-remove-outline' : 'person-add-outline',
          label: isFollowing ? 'Takibi Bırak' : 'Takip Et',
          onPress: () => {
            trigger('light');
            setVisible(false);
            onToggleFollow();
          },
        },
        {
          id: 'share',
          icon: 'share-outline',
          label: 'Paylaş',
          onPress: () => {
            trigger('light');
            setVisible(false);
            onShare();
          },
        },
        {
          id: 'copyLink',
          icon: 'link-outline',
          label: 'Bağlantıyı Kopyala',
          onPress: () => {
            trigger('light');
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
            trigger('warning');
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
      trigger,
    ]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.background.primary }]}
            onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text.secondary }]}>
                {isOwnPost ? 'Gönderi Seçenekleri' : 'Eylemler'}
              </Text>
            </View>

            {/* Options */}
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
          </View>
        </Pressable>
      </Modal>
    );
  },
);

PostOptionsSheet.displayName = 'PostOptionsSheet';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
