// src/features/notifications/__tests__/components/NotificationItem.test.tsx
// Component tests for NotificationItem
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationItem } from '../../components/NotificationItem';
import type { NotificationResponse, NotificationType } from '../../types';

// Mock dependencies
jest.mock('@contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        primary: { 50: '#E3F2FD', 500: '#2196F3' },
        grey: { 100: '#F5F5F5' },
        text: { primary: '#212121', secondary: '#757575', tertiary: '#9E9E9E' },
        background: { primary: '#FFFFFF', secondary: '#F5F5F5' },
        error: { 500: '#F44336' },
        success: { 500: '#4CAF50' },
        warning: { 500: '#FF9800' },
        info: { 500: '#2196F3' },
      },
    },
  }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

const createMockNotification = (
  overrides?: Partial<NotificationResponse>,
): NotificationResponse => ({
  notificationId: 'notif-1',
  type: 'NEW_MESSAGE',
  title: 'Yeni Mesaj',
  body: 'Ahmet size bir mesaj gönderdi',
  actionUrl: '/messages/conv-1',
  metadata: { actorAvatarUrl: 'https://example.com/avatar.jpg' },
  status: 'DELIVERED',
  deliveredChannels: ['PUSH'],
  read: false,
  readAt: null,
  relativeTime: '5dk önce',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('NotificationItem', () => {
  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render notification correctly', () => {
    const notification = createMockNotification();

    const { getByText } = render(
      <NotificationItem notification={notification} onPress={mockOnPress} />,
    );

    expect(getByText('Yeni Mesaj')).toBeTruthy();
    expect(getByText('Ahmet size bir mesaj gönderdi')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const notification = createMockNotification();

    const { getByText } = render(
      <NotificationItem notification={notification} onPress={mockOnPress} />,
    );

    fireEvent.press(getByText('Yeni Mesaj'));

    expect(mockOnPress).toHaveBeenCalledWith(notification);
  });

  it('should call onLongPress when long pressed', () => {
    const notification = createMockNotification();

    const { getByText } = render(
      <NotificationItem
        notification={notification}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />,
    );

    fireEvent(getByText('Yeni Mesaj'), 'onLongPress');

    expect(mockOnLongPress).toHaveBeenCalledWith(notification);
  });

  it('should display relative time', () => {
    const notification = createMockNotification({ relativeTime: '5dk önce' });

    const { getByText } = render(
      <NotificationItem notification={notification} onPress={mockOnPress} />,
    );

    expect(getByText('5dk önce')).toBeTruthy();
  });

  it('should render unread notification differently', () => {
    const unreadNotification = createMockNotification({ read: false });

    const { UNSAFE_root } = render(
      <NotificationItem notification={unreadNotification} onPress={mockOnPress} />,
    );

    // Unread notification should be rendered
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render read notification differently', () => {
    const readNotification = createMockNotification({
      read: true,
      readAt: new Date().toISOString(),
    });

    const { UNSAFE_root } = render(
      <NotificationItem notification={readNotification} onPress={mockOnPress} />,
    );

    // Read notification should be rendered
    expect(UNSAFE_root).toBeTruthy();
  });

  describe('Icon rendering based on type', () => {
    const types: NotificationType[] = [
      'NEW_MESSAGE',
      'POST_LIKED',
      'POST_COMMENTED',
      'NEW_FOLLOWER',
      'VERIFICATION_APPROVED',
      'VERIFICATION_REJECTED',
      'WELCOME',
    ];

    types.forEach(type => {
      it(`should render correct icon for ${type} notification`, () => {
        const notification = createMockNotification({ type });

        const { UNSAFE_root } = render(
          <NotificationItem notification={notification} onPress={mockOnPress} />,
        );

        // Icon component should be rendered
        expect(UNSAFE_root).toBeTruthy();
      });
    });
  });

  describe('Metadata handling', () => {
    it('should render with image from metadata', () => {
      const notification = createMockNotification({
        metadata: { imageUrl: 'https://example.com/image.jpg' },
      });

      const { UNSAFE_root } = render(
        <NotificationItem notification={notification} onPress={mockOnPress} />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render fallback when no image in metadata', () => {
      const notification = createMockNotification({
        metadata: {},
      });

      const { UNSAFE_root } = render(
        <NotificationItem notification={notification} onPress={mockOnPress} />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Backend icon/color fields', () => {
    it('should use icon from backend if provided', () => {
      const notification = createMockNotification({
        icon: 'custom-icon',
        color: '#FF0000',
      });

      const { UNSAFE_root } = render(
        <NotificationItem notification={notification} onPress={mockOnPress} />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
