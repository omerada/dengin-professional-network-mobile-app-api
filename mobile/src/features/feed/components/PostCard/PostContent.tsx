// src/features/feed/components/PostCard/PostContent.tsx
// Meslektaş Design System - Modern PostContent Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo, useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@contexts/ThemeContext';

import { styles } from './PostCard.styles';
import type { PostContentProps } from './PostCard.types';

/**
 * Modern PostContent Component
 *
 * Features:
 * - Text truncation with "more" button
 * - Animated expansion
 * - Link/hashtag detection (future)
 *
 * @example
 * ```tsx
 * <PostContent
 *   content="This is a long post content..."
 *   maxLines={5}
 *   showMoreButton
 *   onMorePress={() => navigateToPost()}
 * />
 * ```
 */
export const PostContent: React.FC<PostContentProps> = memo(
  ({ content, maxLines = 5, showMoreButton = true, onMorePress, testID }) => {
    const colors = useColors();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);

    // Check if text is truncated
    const handleTextLayout = useCallback(
      (e: { nativeEvent: { lines: Array<unknown> } }) => {
        if (e.nativeEvent.lines.length >= maxLines) {
          setIsTruncated(true);
        }
      },
      [maxLines],
    );

    // Toggle expansion
    const handleMorePress = useCallback(() => {
      if (onMorePress) {
        onMorePress();
      } else {
        setIsExpanded(prev => !prev);
      }
    }, [onMorePress]);

    if (!content) return null;

    return (
      <View style={styles.content} testID={testID}>
        <Text
          style={[styles.contentText, { color: colors.text.primary }]}
          numberOfLines={isExpanded ? undefined : maxLines}
          onTextLayout={handleTextLayout}>
          {content}
        </Text>

        {showMoreButton && isTruncated && !isExpanded && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Pressable onPress={handleMorePress} style={styles.moreButton}>
              <Text style={[styles.moreButtonText, { color: colors.text.tertiary }]}>
                daha fazla
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    );
  },
);

PostContent.displayName = 'PostContent';
