// src/features/profile/components/ProfileBio.tsx
// Profile bio section component
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';

interface ProfileBioProps {
  /**
   * Bio text to display
   */
  bio: string | null;
  /**
   * Maximum number of lines before truncation
   * @default 3
   */
  maxLines?: number;
}

const MAX_BIO_LENGTH = 150;

/**
 * ProfileBio Component
 *
 * Displays user bio with expand/collapse functionality
 * Shows "Daha fazla" button when bio is too long
 */
export const ProfileBio: React.FC<ProfileBioProps> = memo(
  ({ bio, maxLines = 3 }) => {
    const { theme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowMore, setShouldShowMore] = useState(false);

    const handleTextLayout = useCallback(
      (e: { nativeEvent: { lines: { text: string }[] } }) => {
        if (e.nativeEvent.lines.length > maxLines || (bio && bio.length > MAX_BIO_LENGTH)) {
          setShouldShowMore(true);
        }
      },
      [maxLines, bio],
    );

    const toggleExpanded = useCallback(() => {
      setIsExpanded(prev => !prev);
    }, []);

    if (!bio) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Text
          style={[styles.bio, { color: theme.colors.text.primary }]}
          numberOfLines={isExpanded ? undefined : maxLines}
          onTextLayout={handleTextLayout}
        >
          {bio}
        </Text>

        {shouldShowMore && (
          <TouchableOpacity
            onPress={toggleExpanded}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[styles.showMore, { color: theme.colors.primary[500] }]}
            >
              {isExpanded ? 'Daha az göster' : 'Daha fazla'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

ProfileBio.displayName = 'ProfileBio';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  bio: {
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  showMore: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});

