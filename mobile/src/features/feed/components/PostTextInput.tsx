// src/features/feed/components/PostTextInput.tsx
// Post metin girişi komponenti
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo } from 'react';
import { View, TextInput, Text, StyleSheet, Image } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores/authStore';
import { MAX_CONTENT_LENGTH } from '../stores';

interface PostTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const PostTextInput: React.FC<PostTextInputProps> = memo(
  ({ value, onChangeText, placeholder = 'Ne düşünüyorsunuz?', autoFocus = true }) => {
    const colors = useColors();
    const user = useAuthStore(state => state.user);

    const remainingChars = MAX_CONTENT_LENGTH - value.length;
    const isNearLimit = remainingChars <= 50;
    const isOverLimit = remainingChars < 0;

    return (
      <View style={styles.container}>
        {/* User avatar */}
        <View style={styles.avatarContainer}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: colors.interactive.subtle }]}>
              <Text style={[styles.avatarText, { color: colors.interactive.default }]}>
                {user?.name?.[0]}
                {user?.surname?.[0]}
              </Text>
            </View>
          )}
        </View>

        {/* Input area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: colors.text.primary }]}
            placeholder={placeholder}
            placeholderTextColor={colors.text.secondary}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={MAX_CONTENT_LENGTH + 10} // Allow slight overflow for UX
            autoFocus={autoFocus}
            textAlignVertical="top"
          />

          {/* Character counter */}
          <View style={styles.counterContainer}>
            <Text
              style={[
                styles.counter,
                {
                  color: isOverLimit
                    ? colors.status.error
                    : isNearLimit
                      ? colors.status.warning
                      : colors.text.secondary,
                },
              ]}>
              {remainingChars}
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

PostTextInput.displayName = 'PostTextInput';

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  avatarContainer: {
    marginRight: 12,
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  counter: {
    fontSize: 12,
    fontWeight: '500',
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    padding: 0,
  },
  inputContainer: {
    flex: 1,
  },
});

export default PostTextInput;
