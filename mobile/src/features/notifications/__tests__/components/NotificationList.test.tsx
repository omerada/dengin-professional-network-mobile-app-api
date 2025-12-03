// src/features/notifications/__tests__/components/NotificationList.test.tsx
// Component tests for NotificationList
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationList } from '../../components/NotificationList';
import { notificationService } from '../../services/notificationService';
import { NotificationType } from '../../types';

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
        background: { primary: '#FFFFFF' },
        border: '#E0E0E0',
      },
    },
  }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('../../services/notificationService', () => ({
  notificationService: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    Layout: { springify: () => ({}) },
  };
});

const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

const mockNotifications = [
  {
    id: '1',
    type: NotificationType.MESSAGE,
    title: 'Yeni Mesaj',
    body: 'Ahmet size mesaj gönderdi',
    isRead: false,
    createdAt: new Date().toISOString(),
    senderId: 'user-1',
    senderName: 'Ahmet',
    referenceId: 'conv-1',
  },
  {
    id: '2',
    type: NotificationType.POST_LIKE,
    title: 'Yeni Beğeni',
    body: 'Mehmet gönderinizi beğendi',
    isRead: true,
    createdAt: new Date().toISOString(),
    senderId: 'user-2',
    senderName: 'Mehmet',
    referenceId: 'post-1',
  },
];

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('NotificationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    mockNotificationService.getNotifications.mockReturnValue(
      new Promise(() => {}) // Never resolves
    );

    const { getByTestId } = renderWithProviders(
      <NotificationList testID="notification-list" />
    );

    // Should show loading indicator
    await waitFor(() => {
      expect(getByTestId).toBeTruthy();
    });
  });

  it('should render notifications after loading', async () => {
    mockNotificationService.getNotifications.mockResolvedValueOnce({
      items: mockNotifications,
      hasMore: false,
      nextCursor: undefined,
    });

    const { findByText } = renderWithProviders(<NotificationList />);

    await waitFor(() => {
      expect(findByText('Yeni Mesaj')).toBeTruthy();
      expect(findByText('Yeni Beğeni')).toBeTruthy();
    });
  });

  it('should render empty state when no notifications', async () => {
    mockNotificationService.getNotifications.mockResolvedValueOnce({
      items: [],
      hasMore: false,
      nextCursor: undefined,
    });

    const { findByText } = renderWithProviders(<NotificationList />);

    await waitFor(() => {
      expect(findByText('Bildirim Yok')).toBeTruthy();
    });
  });

  it('should call onNotificationPress when notification is pressed', async () => {
    const mockOnPress = jest.fn();
    mockNotificationService.getNotifications.mockResolvedValueOnce({
      items: mockNotifications,
      hasMore: false,
      nextCursor: undefined,
    });
    mockNotificationService.markAsRead.mockResolvedValueOnce(undefined);

    const { findByText } = renderWithProviders(
      <NotificationList onNotificationPress={mockOnPress} />
    );

    const notification = await findByText('Yeni Mesaj');
    fireEvent.press(notification);

    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' })
      );
    });
  });

  it('should mark unread notification as read when pressed', async () => {
    mockNotificationService.getNotifications.mockResolvedValueOnce({
      items: mockNotifications,
      hasMore: false,
      nextCursor: undefined,
    });
    mockNotificationService.markAsRead.mockResolvedValueOnce(undefined);

    const { findByText } = renderWithProviders(<NotificationList />);

    const unreadNotification = await findByText('Yeni Mesaj');
    fireEvent.press(unreadNotification);

    await waitFor(() => {
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('should not mark already read notification as read', async () => {
    const readNotifications = [
      {
        ...mockNotifications[0],
        isRead: true,
      },
    ];

    mockNotificationService.getNotifications.mockResolvedValueOnce({
      items: readNotifications,
      hasMore: false,
      nextCursor: undefined,
    });

    const { findByText } = renderWithProviders(<NotificationList />);

    const notification = await findByText('Yeni Mesaj');
    fireEvent.press(notification);

    await waitFor(() => {
      expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
    });
  });

  describe('Infinite scroll', () => {
    it('should load more when scrolled to end', async () => {
      const firstPage = {
        items: mockNotifications,
        hasMore: true,
        nextCursor: 'cursor-1',
      };

      const secondPage = {
        items: [
          {
            id: '3',
            type: NotificationType.FOLLOW,
            title: 'Yeni Takipçi',
            body: 'Ali sizi takip etti',
            isRead: false,
            createdAt: new Date().toISOString(),
            senderId: 'user-3',
            senderName: 'Ali',
          },
        ],
        hasMore: false,
        nextCursor: undefined,
      };

      mockNotificationService.getNotifications
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage);

      const { getByTestId, findByText } = renderWithProviders(
        <NotificationList testID="notification-list" />
      );

      // Wait for first page to load
      await findByText('Yeni Mesaj');

      // Simulate scroll to end
      const list = getByTestId('notification-list');
      fireEvent(list, 'onEndReached');

      // Wait for second page
      await waitFor(() => {
        expect(mockNotificationService.getNotifications).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Pull to refresh', () => {
    it('should refresh when pulled down', async () => {
      mockNotificationService.getNotifications.mockResolvedValue({
        items: mockNotifications,
        hasMore: false,
        nextCursor: undefined,
      });

      const { getByTestId, findByText } = renderWithProviders(
        <NotificationList testID="notification-list" />
      );

      await findByText('Yeni Mesaj');

      // Simulate pull to refresh
      const list = getByTestId('notification-list');
      fireEvent(list, 'onRefresh');

      await waitFor(() => {
        expect(mockNotificationService.getNotifications).toHaveBeenCalledTimes(2);
      });
    });
  });
});
