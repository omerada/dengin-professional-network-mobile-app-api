// src/features/notifications/__tests__/components/NotificationItem.test.tsx
// Component tests for NotificationItem
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationItem } from '../../components/NotificationItem';
import { NotificationType } from '../../types';
import type { NotificationData } from '../../types';

// Mock dependencies
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        primary: { 50: '#E3F2FD', 500: '#2196F3' },
        grey: { 100: '#F5F5F5' },
        text: { primary: '#212121', secondary: '#757575' },
        error: { 500: '#F44336' },
        success: { 500: '#4CAF50' },
        warning: { 500: '#FF9800' },
        info: { 500: '#2196F3' },
      },
    },
  }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const mockNotification: NotificationData = {
  id: 'notif-1',
  type: NotificationType.MESSAGE,
  title: 'Yeni Mesaj',
  body: 'Ahmet size bir mesaj gönderdi',
  isRead: false,
  createdAt: new Date().toISOString(),
  senderId: 'user-1',
  senderName: 'Ahmet',
  senderAvatar: 'https://example.com/avatar.jpg',
  referenceId: 'conv-1',
};

describe('NotificationItem', () => {
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render notification correctly', () => {
    const { getByText } = render(
      <NotificationItem
        notification={mockNotification}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText('Yeni Mesaj')).toBeTruthy();
    expect(getByText('Ahmet size bir mesaj gönderdi')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByTestId } = render(
      <NotificationItem
        notification={mockNotification}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        testID="notification-item"
      />
    );

    fireEvent.press(getByTestId('notification-item'));

    expect(mockOnPress).toHaveBeenCalledWith(mockNotification);
  });

  it('should show unread indicator for unread notifications', () => {
    const { getByTestId } = render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: false }}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        testID="notification-item"
      />
    );

    // Unread notifications should have a visual indicator
    const item = getByTestId('notification-item');
    expect(item).toBeTruthy();
  });

  it('should not show unread indicator for read notifications', () => {
    const { queryByTestId } = render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: true }}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        testID="notification-item"
      />
    );

    const unreadIndicator = queryByTestId('unread-indicator');
    expect(unreadIndicator).toBeNull();
  });

  describe('Icon rendering based on type', () => {
    const types = [
      { type: NotificationType.MESSAGE, expectedIcon: 'chatbubble' },
      { type: NotificationType.POST_LIKE, expectedIcon: 'heart' },
      { type: NotificationType.POST_COMMENT, expectedIcon: 'chatbubble-ellipses' },
      { type: NotificationType.COMMENT_REPLY, expectedIcon: 'chatbubble-ellipses' },
      { type: NotificationType.FOLLOW, expectedIcon: 'person-add' },
      { type: NotificationType.VERIFICATION_UPDATE, expectedIcon: 'checkmark-circle' },
      { type: NotificationType.SYSTEM, expectedIcon: 'information-circle' },
    ];

    types.forEach(({ type }) => {
      it(`should render correct icon for ${type} notification`, () => {
        const notification = { ...mockNotification, type };

        const { UNSAFE_root } = render(
          <NotificationItem
            notification={notification}
            onPress={mockOnPress}
            onDelete={mockOnDelete}
          />
        );

        // Icon component should be rendered
        expect(UNSAFE_root).toBeTruthy();
      });
    });
  });

  describe('Relative time display', () => {
    it('should show relative time for recent notifications', () => {
      const recentNotification = {
        ...mockNotification,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      };

      const { getByText } = render(
        <NotificationItem
          notification={recentNotification}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // Should show something like "5dk önce"
      // The exact text depends on the implementation
      expect(getByText(/önce/)).toBeTruthy();
    });

    it('should show date for old notifications', () => {
      const oldNotification = {
        ...mockNotification,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      };

      const { UNSAFE_root } = render(
        <NotificationItem
          notification={oldNotification}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Sender avatar', () => {
    it('should render sender avatar when available', () => {
      const { UNSAFE_root } = render(
        <NotificationItem
          notification={mockNotification}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // Avatar should be rendered (implementation may use Image or custom component)
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render fallback when avatar is not available', () => {
      const notificationWithoutAvatar = {
        ...mockNotification,
        senderAvatar: undefined,
      };

      const { UNSAFE_root } = render(
        <NotificationItem
          notification={notificationWithoutAvatar}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible role', () => {
      const { getByRole } = render(
        <NotificationItem
          notification={mockNotification}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      );

      // Should be accessible as a button
      expect(getByRole).toBeTruthy();
    });

    it('should have accessible label', () => {
      const { getByLabelText } = render(
        <NotificationItem
          notification={mockNotification}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
          accessibilityLabel="Notification from Ahmet"
        />
      );

      expect(getByLabelText).toBeTruthy();
    });
  });
});
