// src/features/feed/components/CommentCard.tsx
// Yorum kartı komponenti
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { formatRelativeTime } from '@shared/utils/dateUtils';
import type { Comment } from '../types';

interface CommentCardProps {
  comment: Comment;
  onLike?: (commentId: string, isLiked: boolean) => void;
  onReply?: (commentId: string) => void;
  onAuthorPress?: (userId: string) => void;
  onMenuPress?: (commentId: string) => void;
  isReply?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = memo(
  ({ comment, onLike, onReply, onAuthorPress, onMenuPress, isReply = false }) => {
    const colors = useColors();
    const { author } = comment;

    const handleAuthorPress = useCallback(() => {
      onAuthorPress?.(author.id);
    }, [onAuthorPress, author.id]);

    const handleLike = useCallback(() => {
      onLike?.(comment.id, comment.isLiked);
    }, [onLike, comment.id, comment.isLiked]);

    const handleReply = useCallback(() => {
      onReply?.(comment.id);
    }, [onReply, comment.id]);

    const handleMenu = useCallback(() => {
      onMenuPress?.(comment.id);
    }, [onMenuPress, comment.id]);

    return (
      <View style={[styles.container, isReply && styles.replyContainer]}>
        <Pressable onPress={handleAuthorPress}>
          {author.avatarUrl ? (
            <Image
              source={{ uri: author.avatarUrl }}
              style={[styles.avatar, isReply && styles.replyAvatar]}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                isReply && styles.replyAvatar,
                { backgroundColor: colors.interactive.subtle },
              ]}>
              <Text style={[styles.avatarText, { color: colors.interactive.default }]}>
                {author.firstName[0]}
                {author.lastName[0]}
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.content}>
          <View style={styles.bubble}>
            <View style={styles.header}>
              <Pressable onPress={handleAuthorPress}>
                <Text style={[styles.authorName, { color: colors.text.primary }]}>
                  {author.firstName} {author.lastName}
                </Text>
              </Pressable>
              {author.isVerified && (
                <Icon
                  name="checkmark-circle"
                  size={14}
                  color={colors.interactive.default}
                  style={styles.verifiedIcon}
                />
              )}
            </View>

            <Text style={[styles.commentText, { color: colors.text.primary }]}>
              {comment.content}
            </Text>
          </View>

          <View style={styles.actions}>
            <Text style={[styles.time, { color: colors.text.secondary }]}>
              {formatRelativeTime(comment.createdAt)}
            </Text>

            <Pressable style={styles.actionButton} onPress={handleLike}>
              <Text
                style={[
                  styles.actionText,
                  {
                    color: comment.isLiked ? colors.error.main : colors.text.secondary,
                  },
                ]}>
                Beğen{comment.likesCount > 0 && ` · ${comment.likesCount}`}
              </Text>
            </Pressable>

            {!isReply && (
              <Pressable style={styles.actionButton} onPress={handleReply}>
                <Text style={[styles.actionText, { color: colors.text.secondary }]}>
                  Yanıtla{comment.repliesCount > 0 && ` · ${comment.repliesCount}`}
                </Text>
              </Pressable>
            )}

            <Pressable style={styles.menuButton} onPress={handleMenu}>
              <Icon name="ellipsis-horizontal" size={16} color={colors.text.secondary} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  },
);

CommentCard.displayName = 'CommentCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyContainer: {
    paddingLeft: 56,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  bubble: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 4,
  },
  time: {
    fontSize: 12,
  },
  actionButton: {
    marginLeft: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 4,
  },
});

export default CommentCard;
