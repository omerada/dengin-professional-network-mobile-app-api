// src/features/feed/components/AddCommentForm.tsx
// Yorum ekleme formu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores/authStore';

interface AddCommentFormProps {
  postId: string | number;
  parentId?: string;
  placeholder?: string;
  onSubmit: (content: string) => void;
  isLoading?: boolean;
  autoFocus?: boolean;
  /** ID of the comment being replied to */
  replyToId?: string | null;
  /** Called when user cancels reply */
  onCancelReply?: () => void;
}

export const AddCommentForm: React.FC<AddCommentFormProps> = memo(
  ({
    postId,
    parentId,
    placeholder = 'Yorum yaz...',
    onSubmit,
    isLoading = false,
    autoFocus = false,
    replyToId,
    onCancelReply,
  }) => {
    const { theme } = useTheme();
    const user = useAuthStore(state => state.user);
    const [content, setContent] = useState('');
    const inputRef = useRef<TextInput>(null);

    // Focus input when replying
    useEffect(() => {
      if (replyToId && inputRef.current) {
        inputRef.current.focus();
      }
    }, [replyToId]);

    const handleSubmit = useCallback(() => {
      const trimmedContent = content.trim();
      if (!trimmedContent || isLoading) return;

      onSubmit(trimmedContent);
      setContent('');
    }, [content, isLoading, onSubmit]);

    const isDisabled = !content.trim() || isLoading;
    const isReplying = !!replyToId;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {/* Reply indicator */}
        {isReplying && (
          <View
            style={[
              styles.replyIndicator,
              {
                backgroundColor: theme.colors.primary[50],
                borderBottomColor: theme.colors.border.light,
              },
            ]}>
            <Icon name="arrow-undo" size={14} color={theme.colors.primary[500]} />
            <Text style={[styles.replyText, { color: theme.colors.primary[700] }]}>
              Yanıtlanıyor
            </Text>
            <Pressable
              onPress={onCancelReply}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={18} color={theme.colors.text.secondary} />
            </Pressable>
          </View>
        )}
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background.primary,
              borderTopColor: theme.colors.border.light,
            },
          ]}>
          {/* Avatar */}
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary[100] }]}>
              <Icon name="person" size={16} color={theme.colors.primary[600]} />
            </View>
          )}

          {/* Input */}
          <View
            style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: theme.colors.text.primary }]}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.text.secondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={500}
              autoFocus={autoFocus}
              editable={!isLoading}
            />
          </View>

          {/* Send Button */}
          <Pressable
            style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={isDisabled}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            ) : (
              <Icon
                name="send"
                size={20}
                color={isDisabled ? theme.colors.text.disabled : theme.colors.primary[500]}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  },
);

AddCommentForm.displayName = 'AddCommentForm';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  replyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default AddCommentForm;
