// src/features/messaging/components/MessageInput.tsx
// Mesaj giriş komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useState, useCallback, useRef } from 'react';
import { View, TextInput, StyleSheet, Pressable, Keyboard, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  /** P2: Media attachment handlers */
  onImagePick?: () => void;
  onCameraOpen?: () => void;
  onVoiceRecord?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MessageInput: React.FC<MessageInputProps> = memo(
  ({
    value,
    onChangeText,
    onSend,
    onTypingStart,
    onTypingStop,
    placeholder = 'Mesaj yaz...',
    disabled = false,
    maxLength = 2000,
    onImagePick,
    onCameraOpen,
    onVoiceRecord,
  }) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const canSend = value.trim().length > 0 && !disabled;
    const hasText = value.trim().length > 0;

    const handleChangeText = useCallback(
      (text: string) => {
        onChangeText(text);

        // Typing indicator
        if (text.length > 0) {
          onTypingStart?.();

          // Clear previous timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          // Set new timeout to stop typing
          typingTimeoutRef.current = setTimeout(() => {
            onTypingStop?.();
          }, 3000);
        } else {
          onTypingStop?.();
        }
      },
      [onChangeText, onTypingStart, onTypingStop],
    );

    const handleSend = useCallback(() => {
      if (!canSend) return;

      onSend();
      Keyboard.dismiss();

      // Stop typing when sent
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTypingStop?.();
    }, [canSend, onSend, onTypingStop]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      onTypingStop?.();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }, [onTypingStop]);

    const buttonAnimatedStyle = useAnimatedStyle(() => {
      const scale = withSpring(canSend ? 1 : 0.8, { damping: 15 });
      const opacity = interpolate(canSend ? 1 : 0, [0, 1], [0.5, 1]);

      return {
        transform: [{ scale }],
        opacity,
      };
    }, [canSend]);

    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* P2: Media attachment buttons (shown when no text) */}
        {!hasText && (
          <View style={styles.mediaButtons}>
            {onImagePick && (
              <Pressable
                onPress={onImagePick}
                style={styles.mediaButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="image-outline" size={24} color={colors.text.secondary} />
              </Pressable>
            )}
            {onCameraOpen && (
              <Pressable
                onPress={onCameraOpen}
                style={styles.mediaButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="camera-outline" size={24} color={colors.text.secondary} />
              </Pressable>
            )}
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.background.secondary,
              borderColor: isFocused ? colors.interactive.default : 'transparent',
            },
          ]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text.primary }]}
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            returnKeyType="default"
            blurOnSubmit={false}
            textAlignVertical="center"
          />
        </View>

        {/* P2: Send button or voice record (animated transition) */}
        {hasText ? (
          <AnimatedPressable
            onPress={handleSend}
            disabled={!canSend}
            style={[
              styles.sendButton,
              { backgroundColor: colors.interactive.default },
              buttonAnimatedStyle,
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="send" size={20} color={colors.text.inverse} />
          </AnimatedPressable>
        ) : (
          onVoiceRecord && (
            <Pressable
              onPress={onVoiceRecord}
              style={styles.voiceButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="mic-outline" size={24} color={colors.text.secondary} />
            </Pressable>
          )
        )}
      </View>
    );
  mediaButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  mediaButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  voiceButton: {
    alignItems: 'center'
MessageInput.displayName = 'MessageInput';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingBottom: 0,
    paddingTop: 0,
    textAlignVertical: 'center',
  },
  inputContainer: {
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});

export default MessageInput;
