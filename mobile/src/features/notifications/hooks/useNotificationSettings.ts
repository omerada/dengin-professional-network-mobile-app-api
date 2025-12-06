// src/features/notifications/hooks/useNotificationSettings.ts
// Notification settings hook - Backend NotificationController ile uyumlu
// Backend: GET/PUT /api/notifications/preferences
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import { useNotificationStore } from '../stores';
import type {
  NotificationPreferencesResponse,
  NotificationPreferencesRequest,
  NotificationType,
} from '../types';

const PREFERENCES_QUERY_KEY = ['notifications', 'preferences'];

/**
 * Bildirim tercihleri hook'u
 * @see NotificationController.getPreferences()
 * @see NotificationController.updatePreferences()
 */
export function useNotificationSettings() {
  const queryClient = useQueryClient();
  const storePreferences = useNotificationStore(state => state.preferences);
  const setStorePreferences = useNotificationStore(state => state.setPreferences);

  // Fetch preferences from server
  const {
    data: serverPreferences,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: () => notificationService.getPreferences(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use server preferences if available, otherwise use store preferences
  const preferences = serverPreferences || storePreferences;

  // Update preferences mutation
  const mutation = useMutation({
    mutationFn: (request: NotificationPreferencesRequest) =>
      notificationService.updatePreferences(request),
    onMutate: async request => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: PREFERENCES_QUERY_KEY });

      // Snapshot previous value
      const previousPreferences =
        queryClient.getQueryData<NotificationPreferencesResponse>(PREFERENCES_QUERY_KEY);

      // Optimistically update cache
      queryClient.setQueryData<NotificationPreferencesResponse>(PREFERENCES_QUERY_KEY, old => {
        if (!old) return old;
        return {
          ...old,
          ...request,
          updatedAt: new Date().toISOString(),
        };
      });

      // Update store - get updated cache value
      const updatedPrefs =
        queryClient.getQueryData<NotificationPreferencesResponse>(PREFERENCES_QUERY_KEY);
      if (updatedPrefs) {
        setStorePreferences(updatedPrefs);
      }

      return { previousPreferences };
    },
    onError: (_error, _request, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(PREFERENCES_QUERY_KEY, context.previousPreferences);
        setStorePreferences(context.previousPreferences);
      }
    },
    onSuccess: data => {
      // Update with server response
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
      setStorePreferences(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_QUERY_KEY });
    },
  });

  // Update all preferences
  const updatePreferences = useCallback(
    (request: NotificationPreferencesRequest) => {
      mutation.mutate(request);
    },
    [mutation],
  );

  // Toggle master notifications
  const toggleNotifications = useCallback(
    (enabled: boolean) => {
      updatePreferences({ notificationsEnabled: enabled });
    },
    [updatePreferences],
  );

  // Toggle push notifications
  const togglePush = useCallback(
    (enabled: boolean) => {
      updatePreferences({ pushEnabled: enabled });
    },
    [updatePreferences],
  );

  // Toggle email notifications
  const toggleEmail = useCallback(
    (enabled: boolean) => {
      updatePreferences({ emailEnabled: enabled });
    },
    [updatePreferences],
  );

  // Update quiet hours
  const setQuietHours = useCallback(
    (start: number | null, end: number | null) => {
      updatePreferences({
        quietHoursStart: start,
        quietHoursEnd: end,
      });
    },
    [updatePreferences],
  );

  // Toggle specific notification type
  const toggleTypeEnabled = useCallback(
    (type: NotificationType, enabled: boolean) => {
      const currentTypeSettings = preferences?.typeSettings || {};
      // DeliveryChannel[] format: if enabled, add all channels, if disabled, empty array
      const channels = enabled ? (['IN_APP', 'PUSH'] as const) : [];
      updatePreferences({
        typeSettings: {
          ...currentTypeSettings,
          [type]: [...channels],
        },
      });
    },
    [preferences?.typeSettings, updatePreferences],
  );

  return {
    preferences,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    // Actions
    updatePreferences,
    toggleNotifications,
    togglePush,
    toggleEmail,
    setQuietHours,
    toggleTypeEnabled,
    // Mutation state
    isSaving: mutation.isPending,
    saveError: mutation.error,
    // Helpers
    isNotificationsEnabled: preferences?.notificationsEnabled ?? false,
    isPushEnabled: preferences?.pushEnabled ?? false,
    isEmailEnabled: preferences?.emailEnabled ?? false,
    inQuietHours: preferences?.inQuietHours ?? false,
    availableTypes: preferences?.availableTypes ?? {},
  };
}

export default useNotificationSettings;
