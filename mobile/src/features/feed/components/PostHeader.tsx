// src/features/feed/components/PostHeader.tsx
// Post header komponenti - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { formatRelativeTime } from '@shared/utils/dateUtils';
import type { PostAuthor } from '../types';

interface PostHeaderProps {
  author: PostAuthor;
  createdAt: string;
  onAuthorPress?: () => void;
  onMenuPress?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = memo(
  ({ author, createdAt, onAuthorPress, onMenuPress }) => {
    const colors = useColors();

    // Backend API: name, surname, professionName
    const fullName = `${author.name} ${author.surname}`;
    const initials = `${author.name[0] || ''}${author.surname[0] || ''}`;
    const professionDisplay = author.professionName || author.profession || 'Dengin';

    return (
      <View style={styles.container}>
        <Pressable style={styles.authorContainer} onPress={onAuthorPress}>
          {author.avatarUrl ? (
            <Image source={{ uri: author.avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: colors.interactive.subtle }]}>
              <Text style={[styles.avatarText, { color: colors.interactive.default }]}>
                {initials}
              </Text>
            </View>
          )}

          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.authorName, { color: colors.text.primary }]} numberOfLines={1}>
                {fullName}
              </Text>
              {author.isVerified && (
                <Icon
                  name="checkmark-circle"
                  size={16}
                  color={colors.interactive.default}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.profession, { color: colors.text.secondary }]}>
                {professionDisplay}
              </Text>
              <Text style={[styles.dot, { color: colors.text.secondary }]}>•</Text>
              <Text style={[styles.time, { color: colors.text.secondary }]}>
                {formatRelativeTime(createdAt)}
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={onMenuPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="ellipsis-horizontal" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>
    );
  },
);

PostHeader.displayName = 'PostHeader';

const styles = StyleSheet.create({
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    maxWidth: '80%',
  },
  avatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  dot: {
    fontSize: 13,
    marginHorizontal: 4,
  },
  menuButton: {
    padding: 8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  profession: {
    fontSize: 13,
  },
  time: {
    fontSize: 13,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
});

export default PostHeader;
