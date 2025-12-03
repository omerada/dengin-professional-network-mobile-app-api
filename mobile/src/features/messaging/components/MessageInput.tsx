// src/features/messaging/components/MessageInput.tsx
// Mesaj giriş komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@contexts/ThemeContext';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MessageInput: React.FC<MessageInputProps> = memo(({
  value,
  onChangeText,
  onSend,
  onTypingStart,
  onTypingStop,
  placeholder = 'Mesaj yaz...',
  disabled = false,
  maxLength = 2000,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canSend = value.trim().length > 0 && !disabled;

  const handleChangeText = useCallback((text: string) => {
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
  }, [onChangeText, onTypingStart, onTypingStop]);

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
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: isFocused ? theme.colors.primary[500] : 'transparent',
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: theme.colors.text.primary },
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
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

      <AnimatedPressable
        onPress={handleSend}
        disabled={!canSend}
        style={[
          styles.sendButton,
          { backgroundColor: theme.colors.primary[500] },
          buttonAnimatedStyle,
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="send" size={20} color="#FFFFFF" />
      </AnimatedPressable>
    </View>
  );
});

MessageInput.displayName = 'MessageInput';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 40,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageInput;
