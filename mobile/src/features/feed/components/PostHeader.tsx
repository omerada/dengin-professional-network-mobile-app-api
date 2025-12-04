// src/features/feed/components/PostHeader.tsx
// Post header komponenti - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { formatRelativeTime } from '@shared/utils/dateUtils';
import type { PostAuthor } from '../types';

interface PostHeaderProps {
  author: PostAuthor;
  createdAt: string;
  onAuthorPress?: () => void;
  onMenuPress?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = memo(({
  author,
  createdAt,
  onAuthorPress,
  onMenuPress,
}) => {
  const { theme } = useTheme();

  // Backend API: name, surname
  const fullName = `${author.name} ${author.surname}`;
  const initials = `${author.name[0] || ''}${author.surname[0] || ''}`;

  return (
    <View style={styles.container}>
      <Pressable style={styles.authorContainer} onPress={onAuthorPress}>
        {author.avatarUrl ? (
          <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: theme.colors.primary[100] },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.colors.primary[600] }]}>
              {initials}
            </Text>
          </View>
        )}

        <View style={styles.authorInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.authorName, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {fullName}
            </Text>
            {author.isVerified && (
              <Icon
                name="checkmark-circle"
                size={16}
                color={theme.colors.primary[500]}
                style={styles.verifiedIcon}
              />
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.profession, { color: theme.colors.text.secondary }]}>
              {author.profession}
            </Text>
            <Text style={[styles.dot, { color: theme.colors.text.secondary }]}>•</Text>
            <Text style={[styles.time, { color: theme.colors.text.secondary }]}>
              {formatRelativeTime(createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        style={styles.menuButton}
        onPress={onMenuPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon
          name="ellipsis-horizontal"
          size={20}
          color={theme.colors.text.secondary}
        />
      </Pressable>
    </View>
  );
});

PostHeader.displayName = 'PostHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    maxWidth: '80%',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  profession: {
    fontSize: 13,
  },
  dot: {
    marginHorizontal: 4,
    fontSize: 13,
  },
  time: {
    fontSize: 13,
  },
  menuButton: {
    padding: 8,
  },
});

export default PostHeader;
