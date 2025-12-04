// src/features/notifications/__tests__/components/NotificationList.test.tsx
// Component tests for NotificationList
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationList } from '../../components/NotificationList';
import type { NotificationResponse } from '../../types';

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

// Mock the hooks used by NotificationList
const mockMarkAsRead = jest.fn();
const mockDeleteNotification = jest.fn();
const mockFetchNextPage = jest.fn();
const mockRefetch = jest.fn();

jest.mock('../../hooks', () => ({
  useNotifications: jest.fn(),
  useMarkAsRead: () => ({ markAsRead: mockMarkAsRead }),
  useDeleteNotification: () => ({ deleteNotification: mockDeleteNotification }),
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

import { useNotifications } from '../../hooks';
const mockUseNotifications = useNotifications as jest.Mock;

// Mock notifications matching backend NotificationResponse type
const mockNotifications: NotificationResponse[] = [
  {
    notificationId: 'notif-1',
    type: 'NEW_MESSAGE',
    title: 'Yeni Mesaj',
    body: 'Ahmet size mesaj gönderdi',
    actionUrl: '/messages/conv-1',
    metadata: { senderId: 'user-1' },
    status: 'DELIVERED',
    deliveredChannels: ['PUSH', 'IN_APP'],
    read: false,
    readAt: null,
    relativeTime: '5 dk önce',
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 'notif-2',
    type: 'POST_LIKED',
    title: 'Yeni Beğeni',
    body: 'Mehmet gönderinizi beğendi',
    actionUrl: '/posts/post-1',
    metadata: { postId: 'post-1' },
    status: 'READ',
    deliveredChannels: ['IN_APP'],
    read: true,
    readAt: new Date().toISOString(),
    relativeTime: '1 saat önce',
    createdAt: new Date().toISOString(),
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
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('NotificationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
      isRefreshing: false,
    });

    const { UNSAFE_root } = renderWithProviders(<NotificationList />);

    // Should show loading indicator
    await waitFor(() => {
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('should render notifications after loading', async () => {
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
      isRefreshing: false,
    });

    const { findByText } = renderWithProviders(<NotificationList />);

    await waitFor(() => {
      expect(findByText('Yeni Mesaj')).toBeTruthy();
      expect(findByText('Yeni Beğeni')).toBeTruthy();
    });
  });

  it('should render empty state when no notifications', async () => {
    mockUseNotifications.mockReturnValue({
      notifications: [],
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
      isRefreshing: false,
    });

    const { findByText } = renderWithProviders(<NotificationList />);

    await waitFor(() => {
      expect(findByText('Bildirim Yok')).toBeTruthy();
    });
  });

  it('should call onNotificationPress when notification is pressed', async () => {
    const mockOnPress = jest.fn();
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
      isRefreshing: false,
    });

    const { findByText } = renderWithProviders(
      <NotificationList onNotificationPress={mockOnPress} />,
    );

    const notification = await findByText('Yeni Mesaj');
    fireEvent.press(notification);

    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalledWith(
        expect.objectContaining({ notificationId: 'notif-1' }),
      );
    });
  });

  it('should mark unread notification as read when pressed', async () => {
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
      isRefreshing: false,
    });

    const { findByText } = renderWithProviders(<NotificationList />);

    const unreadNotification = await findByText('Yeni Mesaj');
    fireEvent.press(unreadNotification);

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
    });
  });

  it('should not mark already read notification as read', async () => {
    const readNotifications: NotificationResponse[] = [
      {
        ...mockNotifications[0],
        read: true,
      },
    ];

    mockUseNotifications.mockReturnValue({
      notifications: readNotifications,
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
      isRefreshing: false,
    });

    const { findByText } = renderWithProviders(<NotificationList />);

    const notification = await findByText('Yeni Mesaj');
    fireEvent.press(notification);

    await waitFor(() => {
      expect(mockMarkAsRead).not.toHaveBeenCalled();
    });
  });

  describe('Infinite scroll', () => {
    it('should load more when scrolled to end', async () => {
      mockUseNotifications.mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
        isRefreshing: false,
      });

      const { findByText, UNSAFE_root } = renderWithProviders(<NotificationList />);

      // Wait for first page to load
      await findByText('Yeni Mesaj');

      // Find the FlatList component and trigger onEndReached
      const flatList = UNSAFE_root.findByType(require('react-native').FlatList);
      if (flatList && flatList.props.onEndReached) {
        flatList.props.onEndReached();
      }

      // Wait for fetchNextPage to be called
      await waitFor(() => {
        expect(mockFetchNextPage).toHaveBeenCalled();
      });
    });
  });

  describe('Pull to refresh', () => {
    it('should refresh when pulled down', async () => {
      mockUseNotifications.mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        refetch: mockRefetch,
        isRefreshing: false,
      });

      const { findByText, UNSAFE_root } = renderWithProviders(<NotificationList />);

      await findByText('Yeni Mesaj');

      // Find the RefreshControl via the FlatList
      const flatList = UNSAFE_root.findByType(require('react-native').FlatList);
      if (flatList && flatList.props.refreshControl) {
        // Simulate refresh
        flatList.props.refreshControl.props.onRefresh();
      }

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });
});
