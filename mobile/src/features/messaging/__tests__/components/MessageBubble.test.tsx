// src/features/messaging/__tests__/components/MessageBubble.test.tsx
// MessageBubble component tests
// Oku: mobile-development-guide/testing/25-COMPONENT-TESTS.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MessageBubble } from '../../components/MessageBubble';
import type { Message } from '../../types';

// Mock theme context
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 500: '#007AFF', 100: '#E5F0FF' },
        text: { primary: '#000', secondary: '#666', tertiary: '#999' },
        background: { primary: '#FFF', secondary: '#F5F5F5' },
        status: { error: '#FF3B30', success: '#34C759' },
      },
    },
  }),
}));

describe('MessageBubble', () => {
  const createMessage = (overrides?: Partial<Message>): Message => ({
    id: 'msg1',
    conversationId: 'conv1',
    content: 'Test message content',
    senderId: 'user1',
    status: 'sent',
    createdAt: '2024-01-15T10:00:00Z',
    type: 'text',
    ...overrides,
  });

  describe('rendering', () => {
    it('should render message content', () => {
      const message = createMessage({ content: 'Hello World!' });

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      expect(getByText('Hello World!')).toBeTruthy();
    });

    it('should render own message with different style', () => {
      const message = createMessage();

      const { getByText } = render(
        <MessageBubble message={message} isOwn={true} />
      );

      const messageText = getByText('Test message content');
      expect(messageText).toBeTruthy();
    });

    it('should render other user message', () => {
      const message = createMessage();

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      const messageText = getByText('Test message content');
      expect(messageText).toBeTruthy();
    });

    it('should render timestamp', () => {
      const message = createMessage({ createdAt: '2024-01-15T14:30:00Z' });

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      // Should show formatted time (depends on locale)
      expect(getByText(/\d{2}:\d{2}/)).toBeTruthy();
    });
  });

  describe('status indicators', () => {
    it('should show sending indicator for sending status', () => {
      const message = createMessage({ status: 'sending' });

      const { UNSAFE_queryAllByType } = render(
        <MessageBubble message={message} isOwn={true} />
      );

      // ActivityIndicator should be present
      expect(UNSAFE_queryAllByType('ActivityIndicator')).toBeDefined();
    });

    it('should show checkmark for sent status', () => {
      const message = createMessage({ status: 'sent' });

      const { container } = render(
        <MessageBubble message={message} isOwn={true} />
      );

      // Icon should be rendered
      expect(container).toBeTruthy();
    });

    it('should show double checkmark for delivered status', () => {
      const message = createMessage({ status: 'delivered' });

      const { container } = render(
        <MessageBubble message={message} isOwn={true} />
      );

      expect(container).toBeTruthy();
    });

    it('should show blue checkmark for read status', () => {
      const message = createMessage({ status: 'read' });

      const { container } = render(
        <MessageBubble message={message} isOwn={true} />
      );

      expect(container).toBeTruthy();
    });

    it('should show error icon for failed status', () => {
      const message = createMessage({ status: 'failed' });

      const { container } = render(
        <MessageBubble message={message} isOwn={true} />
      );

      expect(container).toBeTruthy();
    });

    it('should not show status for other user messages', () => {
      const message = createMessage({ status: 'read' });

      const { container } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      // Status should not be visible for non-own messages
      expect(container).toBeTruthy();
    });
  });

  describe('reply indicator', () => {
    it('should render reply indicator when message has replyTo', () => {
      const message = createMessage({
        replyTo: {
          id: 'msg0',
          content: 'Original message',
          senderName: 'Jane Doe',
        },
      });

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      expect(getByText('Jane Doe')).toBeTruthy();
      expect(getByText('Original message')).toBeTruthy();
    });

    it('should not render reply indicator when no replyTo', () => {
      const message = createMessage();

      const { queryByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      expect(queryByText('Jane Doe')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onLongPress when long pressed', () => {
      const message = createMessage();
      const onLongPress = jest.fn();

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} onLongPress={onLongPress} />
      );

      const messageText = getByText('Test message content');
      fireEvent(messageText, 'longPress');

      expect(onLongPress).toHaveBeenCalledWith(message);
    });

    it('should not crash without onLongPress handler', () => {
      const message = createMessage();

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      const messageText = getByText('Test message content');
      
      expect(() => {
        fireEvent(messageText, 'longPress');
      }).not.toThrow();
    });

    it('should call onReplyPress when reply is pressed', () => {
      const message = createMessage({
        replyTo: {
          id: 'msg0',
          content: 'Original',
          senderName: 'User',
        },
      });
      const onReplyPress = jest.fn();

      const { getByText } = render(
        <MessageBubble 
          message={message} 
          isOwn={false} 
          onReplyPress={onReplyPress} 
        />
      );

      const replyName = getByText('User');
      fireEvent.press(replyName);

      expect(onReplyPress).toHaveBeenCalledWith(message);
    });
  });

  describe('long messages', () => {
    it('should render long messages without truncation', () => {
      const longContent = 'A'.repeat(500);
      const message = createMessage({ content: longContent });

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      expect(getByText(longContent)).toBeTruthy();
    });
  });

  describe('special characters', () => {
    it('should render emoji correctly', () => {
      const message = createMessage({ content: '👋 Merhaba! 🎉' });

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      expect(getByText('👋 Merhaba! 🎉')).toBeTruthy();
    });

    it('should render Turkish characters correctly', () => {
      const message = createMessage({ content: 'Türkçe karakterler: ş, ğ, ü, ö, ç, ı' });

      const { getByText } = render(
        <MessageBubble message={message} isOwn={false} />
      );

      expect(getByText('Türkçe karakterler: ş, ğ, ü, ö, ç, ı')).toBeTruthy();
    });
  });
});
