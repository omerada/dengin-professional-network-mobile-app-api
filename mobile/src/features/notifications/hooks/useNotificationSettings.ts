// src/features/notifications/hooks/useNotificationSettings.ts
// Notification settings hook
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import { useNotificationStore } from '../stores';
import type { NotificationSettings } from '../types';

const SETTINGS_QUERY_KEY = ['notifications', 'settings'];

/**
 * Bildirim ayarları hook'u
 */
export function useNotificationSettings() {
  const queryClient = useQueryClient();
  const storeSettings = useNotificationStore((state) => state.settings);
  const setStoreSettings = useNotificationStore((state) => state.setSettings);

  // Fetch settings from server
  const {
    data: serverSettings,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => notificationService.getSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use server settings if available, otherwise use store settings
  const settings = serverSettings || storeSettings;

  // Update settings mutation
  const mutation = useMutation({
    mutationFn: (newSettings: Partial<NotificationSettings>) =>
      notificationService.updateSettings(newSettings),
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: SETTINGS_QUERY_KEY });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<NotificationSettings>(SETTINGS_QUERY_KEY);

      // Optimistically update
      queryClient.setQueryData<NotificationSettings>(SETTINGS_QUERY_KEY, (old) => ({
        ...storeSettings,
        ...old,
        ...newSettings,
      }));

      setStoreSettings(newSettings);

      return { previousSettings };
    },
    onError: (_error, _newSettings, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(SETTINGS_QUERY_KEY, context.previousSettings);
        setStoreSettings(context.previousSettings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    mutation.mutate(newSettings);
  }, [mutation]);

  const toggleSetting = useCallback((key: keyof NotificationSettings) => {
    const currentValue = settings[key];
    if (typeof currentValue === 'boolean') {
      updateSettings({ [key]: !currentValue });
    }
  }, [settings, updateSettings]);

  return {
    settings,
    isLoading,
    isError,
    refetch,
    updateSettings,
    toggleSetting,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}

export default useNotificationSettings;
