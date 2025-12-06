// src/features/feed/components/PostContent.tsx
// Post içerik komponenti
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@contexts/ThemeContext';

interface PostContentProps {
  content: string;
  maxLines?: number;
  expandable?: boolean;
}

const COLLAPSED_LINES = 4;

export const PostContent: React.FC<PostContentProps> = memo(
  ({ content, maxLines = COLLAPSED_LINES, expandable = true }) => {
    const colors = useColors();
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowMore, setShouldShowMore] = useState(false);

    const handleTextLayout = useCallback(
      (e: any) => {
        if (e.nativeEvent.lines.length > maxLines) {
          setShouldShowMore(true);
        }
      },
      [maxLines],
    );

    const toggleExpand = useCallback(() => {
      setIsExpanded(prev => !prev);
    }, []);

    return (
      <View style={styles.container}>
        <Text
          style={[styles.content, { color: colors.text.primary }]}
          numberOfLines={isExpanded ? undefined : maxLines}
          onTextLayout={!isExpanded && expandable ? handleTextLayout : undefined}>
          {content.split(/(\s+)/).map((word, index) => {
            // Hashtag
            if (word.startsWith('#')) {
              return (
                <Text key={index} style={[styles.hashtag, { color: colors.interactive.default }]}>
                  {word}
                </Text>
              );
            }

            // Mention
            if (word.startsWith('@')) {
              return (
                <Text key={index} style={[styles.mention, { color: colors.interactive.default }]}>
                  {word}
                </Text>
              );
            }

            // Regular text - tüm text node'ları Text içinde olmalı
            return <Text key={index}>{word}</Text>;
          })}
        </Text>

        {shouldShowMore && expandable && (
          <Pressable onPress={toggleExpand}>
            <Text style={[styles.showMore, { color: colors.text.secondary }]}>
              {isExpanded ? 'Daha az göster' : 'Devamını oku'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  },
);

PostContent.displayName = 'PostContent';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
  hashtag: {
    fontWeight: '500',
  },
  mention: {
    fontWeight: '500',
  },
  showMore: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default PostContent;
