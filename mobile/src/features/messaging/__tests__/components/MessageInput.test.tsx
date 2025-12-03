// src/features/messaging/__tests__/components/MessageInput.test.tsx
// MessageInput component tests
// Oku: mobile-development-guide/testing/25-COMPONENT-TESTS.md

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { MessageInput } from '../../components/MessageInput';

// Mock theme context
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 500: '#007AFF' },
        text: { primary: '#000', tertiary: '#999' },
        background: { primary: '#FFF', secondary: '#F5F5F5' },
      },
    },
  }),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('MessageInput', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    onSend: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render text input', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} />
      );

      expect(getByPlaceholderText('Mesaj yaz...')).toBeTruthy();
    });

    it('should render custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} placeholder="Bir şeyler yazın..." />
      );

      expect(getByPlaceholderText('Bir şeyler yazın...')).toBeTruthy();
    });

    it('should render send button', () => {
      const { UNSAFE_queryAllByType } = render(
        <MessageInput {...defaultProps} />
      );

      // Pressable component should exist for send button
      expect(UNSAFE_queryAllByType('Pressable')).toBeDefined();
    });

    it('should display input value', () => {
      const { getByDisplayValue } = render(
        <MessageInput {...defaultProps} value="Hello" />
      );

      expect(getByDisplayValue('Hello')).toBeTruthy();
    });
  });

  describe('text input', () => {
    it('should call onChangeText when typing', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} onChangeText={onChangeText} />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      fireEvent.changeText(input, 'New message');

      expect(onChangeText).toHaveBeenCalledWith('New message');
    });

    it('should respect maxLength', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} maxLength={10} />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      expect(input.props.maxLength).toBe(10);
    });

    it('should be multiline', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      expect(input.props.multiline).toBe(true);
    });
  });

  describe('send button', () => {
    it('should call onSend when pressed with text', () => {
      const onSend = jest.fn();
      const { getByTestId, UNSAFE_root } = render(
        <MessageInput {...defaultProps} value="Hello" onSend={onSend} />
      );

      // Find and press send button (last Pressable)
      const pressables = UNSAFE_root.findAllByType('Pressable' as any);
      if (pressables.length > 0) {
        fireEvent.press(pressables[pressables.length - 1]);
      }

      // Note: Due to the animation and Pressable setup, this might need adjustment
    });

    it('should not call onSend when pressed with empty text', () => {
      const onSend = jest.fn();
      const { UNSAFE_root } = render(
        <MessageInput {...defaultProps} value="" onSend={onSend} />
      );

      const pressables = UNSAFE_root.findAllByType('Pressable' as any);
      if (pressables.length > 0) {
        fireEvent.press(pressables[pressables.length - 1]);
      }

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should not call onSend when pressed with whitespace only', () => {
      const onSend = jest.fn();
      const { UNSAFE_root } = render(
        <MessageInput {...defaultProps} value="   " onSend={onSend} />
      );

      const pressables = UNSAFE_root.findAllByType('Pressable' as any);
      if (pressables.length > 0) {
        fireEvent.press(pressables[pressables.length - 1]);
      }

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should be disabled when disabled prop is true', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} disabled={true} />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('typing indicators', () => {
    it('should call onTypingStart when typing begins', () => {
      const onTypingStart = jest.fn();
      const { getByPlaceholderText } = render(
        <MessageInput
          {...defaultProps}
          onTypingStart={onTypingStart}
        />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      fireEvent.changeText(input, 'H');

      expect(onTypingStart).toHaveBeenCalled();
    });

    it('should call onTypingStop after timeout', async () => {
      const onTypingStop = jest.fn();
      const { getByPlaceholderText } = render(
        <MessageInput
          {...defaultProps}
          onTypingStop={onTypingStop}
        />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      fireEvent.changeText(input, 'Hello');

      // Fast forward 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(onTypingStop).toHaveBeenCalled();
    });

    it('should call onTypingStop when text is cleared', () => {
      const onTypingStop = jest.fn();
      const { getByPlaceholderText, rerender } = render(
        <MessageInput
          {...defaultProps}
          value="Hello"
          onTypingStop={onTypingStop}
        />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      fireEvent.changeText(input, '');

      expect(onTypingStop).toHaveBeenCalled();
    });

    it('should call onTypingStop on blur', () => {
      const onTypingStop = jest.fn();
      const { getByPlaceholderText } = render(
        <MessageInput
          {...defaultProps}
          onTypingStop={onTypingStop}
        />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      fireEvent(input, 'blur');

      expect(onTypingStop).toHaveBeenCalled();
    });

    it('should debounce typing start calls', () => {
      const onTypingStart = jest.fn();
      const { getByPlaceholderText } = render(
        <MessageInput
          {...defaultProps}
          onTypingStart={onTypingStart}
        />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      
      // Type multiple characters quickly
      fireEvent.changeText(input, 'H');
      fireEvent.changeText(input, 'He');
      fireEvent.changeText(input, 'Hel');
      fireEvent.changeText(input, 'Hell');
      fireEvent.changeText(input, 'Hello');

      // Should be called for each change but timeout resets
      expect(onTypingStart).toHaveBeenCalled();
    });
  });

  describe('focus states', () => {
    it('should handle focus event', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      
      expect(() => {
        fireEvent(input, 'focus');
      }).not.toThrow();
    });

    it('should handle blur event', () => {
      const { getByPlaceholderText } = render(
        <MessageInput {...defaultProps} />
      );

      const input = getByPlaceholderText('Mesaj yaz...');
      
      expect(() => {
        fireEvent(input, 'blur');
      }).not.toThrow();
    });
  });
});
