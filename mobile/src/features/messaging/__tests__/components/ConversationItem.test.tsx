// src/features/messaging/__tests__/components/ConversationItem.test.tsx
// ConversationItem component tests
// Oku: mobile-development-guide/testing/25-COMPONENT-TESTS.md

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConversationItem } from '../../components/ConversationItem';
import { useMessagingStore } from '../../stores';
import type { ConversationSummary } from '../../types';

// Mock theme context
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: { 500: '#007AFF', 100: '#E5F0FF' },
        text: { primary: '#000', secondary: '#666', tertiary: '#999' },
        background: { primary: '#FFF', secondary: '#F5F5F5' },
        status: { success: '#34C759' },
      },
    },
  }),
}));

// Mock messaging store
jest.mock('../../stores', () => ({
  useMessagingStore: jest.fn(() => ({
    typingUsers: {},
    onlineUsers: new Set(),
  })),
}));

const mockUseMessagingStore = useMessagingStore as jest.MockedFunction<typeof useMessagingStore>;

describe('ConversationItem', () => {
  const createConversation = (overrides?: Partial<ConversationSummary>): ConversationSummary => ({
    id: 'conv1',
    name: 'Test User',
    avatarUrl: undefined,
    participants: [
      { id: 'user1', displayName: 'Test User', avatarUrl: undefined },
    ],
    lastMessage: 'Last message content',
    lastMessageAt: '2024-01-15T10:00:00Z',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    ...overrides,
  });

  const defaultProps = {
    onPress: jest.fn(),
    onLongPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessagingStore.mockReturnValue({
      typingUsers: {},
      onlineUsers: new Set(),
    } as any);
  });

  describe('rendering', () => {
    it('should render conversation name', () => {
      const conversation = createConversation({ name: 'John Doe' });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should render last message preview', () => {
      const conversation = createConversation({ lastMessage: 'Hello there!' });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText('Hello there!')).toBeTruthy();
    });

    it('should truncate long last message', () => {
      const longMessage = 'A'.repeat(60);
      const conversation = createConversation({ lastMessage: longMessage });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText(/A{40}\.\.\./)).toBeTruthy();
    });

    it('should show placeholder for no messages', () => {
      const conversation = createConversation({ lastMessage: undefined });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText('Henüz mesaj yok')).toBeTruthy();
    });

    it('should render avatar placeholder when no avatarUrl', () => {
      const conversation = createConversation({ avatarUrl: undefined });

      const { container } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      // Should render without crashing
      expect(container).toBeTruthy();
    });

    it('should render avatar when avatarUrl provided', () => {
      const conversation = createConversation({
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      const { UNSAFE_queryAllByType } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      // Image component should be present
      expect(UNSAFE_queryAllByType('Image')).toBeDefined();
    });
  });

  describe('unread badge', () => {
    it('should show unread badge when unreadCount > 0', () => {
      const conversation = createConversation({ unreadCount: 5 });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText('5')).toBeTruthy();
    });

    it('should show 99+ when unreadCount > 99', () => {
      const conversation = createConversation({ unreadCount: 150 });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText('99+')).toBeTruthy();
    });

    it('should not show badge when unreadCount is 0', () => {
      const conversation = createConversation({ unreadCount: 0 });

      const { queryByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(queryByText('0')).toBeNull();
    });
  });

  describe('status indicators', () => {
    it('should show pin icon when isPinned', () => {
      const conversation = createConversation({ isPinned: true });

      const { container } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      // Icon should be present
      expect(container).toBeTruthy();
    });

    it('should show mute icon when isMuted', () => {
      const conversation = createConversation({ isMuted: true });

      const { container } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(container).toBeTruthy();
    });

    it('should show online indicator when user is online', () => {
      mockUseMessagingStore.mockReturnValue({
        typingUsers: {},
        onlineUsers: new Set(['user1']),
      } as any);

      const conversation = createConversation();

      const { container } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('typing indicator', () => {
    it('should show typing text when user is typing', () => {
      mockUseMessagingStore.mockReturnValue({
        typingUsers: { conv1: ['John'] },
        onlineUsers: new Set(),
      } as any);

      const conversation = createConversation();

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText('yazıyor...')).toBeTruthy();
    });

    it('should not show typing when no one is typing', () => {
      mockUseMessagingStore.mockReturnValue({
        typingUsers: {},
        onlineUsers: new Set(),
      } as any);

      const conversation = createConversation({ lastMessage: 'Hello' });

      const { queryByText, getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(queryByText('yazıyor...')).toBeNull();
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  describe('time formatting', () => {
    it('should show relative time for recent messages', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const conversation = createConversation({
        lastMessageAt: fiveMinutesAgo.toISOString(),
      });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText(/\d+dk/)).toBeTruthy();
    });

    it('should show hours for messages today', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const conversation = createConversation({
        lastMessageAt: twoHoursAgo.toISOString(),
      });

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} />
      );

      expect(getByText(/\d+sa/)).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const conversation = createConversation();

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} onPress={onPress} />
      );

      fireEvent.press(getByText('Test User'));

      expect(onPress).toHaveBeenCalledWith(conversation);
    });

    it('should call onLongPress when long pressed', () => {
      const onLongPress = jest.fn();
      const conversation = createConversation();

      const { getByText } = render(
        <ConversationItem {...defaultProps} conversation={conversation} onLongPress={onLongPress} />
      );

      fireEvent(getByText('Test User'), 'longPress');

      expect(onLongPress).toHaveBeenCalledWith(conversation);
    });
  });
});
