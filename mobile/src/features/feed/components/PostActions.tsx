// src/features/feed/components/PostActions.tsx
// Post aksiyonları komponenti
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';

interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
}

export const PostActions: React.FC<PostActionsProps> = memo(({
  likesCount,
  commentsCount,
  sharesCount,
  isLiked,
  isBookmarked,
  onLike,
  onComment,
  onShare,
  onBookmark,
}) => {
  const { theme } = useTheme();
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onLike();
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Like */}
      <Pressable style={styles.action} onPress={handleLike}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? theme.colors.error.main : theme.colors.text.secondary}
          />
        </Animated.View>
        {likesCount > 0 && (
          <Text
            style={[
              styles.actionCount,
              {
                color: isLiked ? theme.colors.error.main : theme.colors.text.secondary,
              },
            ]}
          >
            {formatCount(likesCount)}
          </Text>
        )}
      </Pressable>

      {/* Comment */}
      <Pressable style={styles.action} onPress={onComment}>
        <Icon
          name="chatbubble-outline"
          size={22}
          color={theme.colors.text.secondary}
        />
        {commentsCount > 0 && (
          <Text style={[styles.actionCount, { color: theme.colors.text.secondary }]}>
            {formatCount(commentsCount)}
          </Text>
        )}
      </Pressable>

      {/* Share */}
      <Pressable style={styles.action} onPress={onShare}>
        <Icon
          name="share-outline"
          size={22}
          color={theme.colors.text.secondary}
        />
        {sharesCount > 0 && (
          <Text style={[styles.actionCount, { color: theme.colors.text.secondary }]}>
            {formatCount(sharesCount)}
          </Text>
        )}
      </Pressable>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Bookmark */}
      <Pressable style={styles.action} onPress={onBookmark}>
        <Icon
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={isBookmarked ? theme.colors.primary[500] : theme.colors.text.secondary}
        />
      </Pressable>
    </View>
  );
});

PostActions.displayName = 'PostActions';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
});

export default PostActions;
