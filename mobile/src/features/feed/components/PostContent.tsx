// src/features/feed/components/PostContent.tsx
// Post içerik komponenti
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '@contexts/ThemeContext';

interface PostContentProps {
  content: string;
  maxLines?: number;
  expandable?: boolean;
}

const COLLAPSED_LINES = 4;

export const PostContent: React.FC<PostContentProps> = memo(({
  content,
  maxLines = COLLAPSED_LINES,
  expandable = true,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);

  const handleTextLayout = useCallback((e: any) => {
    if (e.nativeEvent.lines.length > maxLines) {
      setShouldShowMore(true);
    }
  }, [maxLines]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Parse hashtags and mentions
  const renderContent = useCallback(() => {
    const words = content.split(/(\s+)/);
    
    return words.map((word, index) => {
      // Hashtag
      if (word.startsWith('#')) {
        return (
          <Text
            key={index}
            style={[styles.hashtag, { color: theme.colors.primary[500] }]}
          >
            {word}
          </Text>
        );
      }
      
      // Mention
      if (word.startsWith('@')) {
        return (
          <Text
            key={index}
            style={[styles.mention, { color: theme.colors.primary[500] }]}
          >
            {word}
          </Text>
        );
      }
      
      // Regular text
      return (
        <Text key={index} style={{ color: theme.colors.text.primary }}>
          {word}
        </Text>
      );
    });
  }, [content, theme.colors]);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.content, { color: theme.colors.text.primary }]}
        numberOfLines={isExpanded ? undefined : maxLines}
        onTextLayout={!isExpanded && expandable ? handleTextLayout : undefined}
      >
        {renderContent()}
      </Text>

      {shouldShowMore && expandable && (
        <Pressable onPress={toggleExpand}>
          <Text style={[styles.showMore, { color: theme.colors.text.secondary }]}>
            {isExpanded ? 'Daha az göster' : 'Devamını oku'}
          </Text>
        </Pressable>
      )}
    </View>
  );
});

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
