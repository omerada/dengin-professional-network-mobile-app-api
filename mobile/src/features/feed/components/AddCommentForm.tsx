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
import { useColors } from '@contexts/ThemeContext';
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
    postId: _postId,
    parentId: _parentId,
    placeholder = 'Yorum yaz...',
    onSubmit,
    isLoading = false,
    autoFocus = false,
    replyToId,
    onCancelReply,
  }) => {
    const colors = useColors();
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
                backgroundColor: colors.interactive.subtle,
                borderBottomColor: colors.border.default,
              },
            ]}>
            <Icon name="arrow-undo" size={14} color={colors.interactive.default} />
            <Text style={[styles.replyText, { color: colors.interactive.default }]}>
              Yanıtlanıyor
            </Text>
            <Pressable
              onPress={onCancelReply}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={18} color={colors.text.secondary} />
            </Pressable>
          </View>
        )}
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background.primary,
              borderTopColor: colors.border.default,
            },
          ]}>
          {/* Avatar */}
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatarPlaceholder, { backgroundColor: colors.interactive.subtle }]}>
              <Icon name="person" size={16} color={colors.interactive.default} />
            </View>
          )}

          {/* Input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text.primary }]}
              placeholder={placeholder}
              placeholderTextColor={colors.text.secondary}
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
              <ActivityIndicator size="small" color={colors.interactive.default} />
            ) : (
              <Icon
                name="send"
                size={20}
                color={isDisabled ? colors.text.disabled : colors.interactive.default}
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
