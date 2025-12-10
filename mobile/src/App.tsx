// src/App.tsx
// Oku: mobile-development-guide/architecture/01-MOBILE-ARCHITECTURE.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md

import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from '@core/navigation';
import { LocaleProvider } from '@contexts/LocaleContext';
import { useColors, useTheme, ThemeProvider } from '@contexts/ThemeContext';
import { ToastProvider } from '@contexts/ToastContext';
import { useAuthStore } from '@features/auth/stores/authStore';
import { notificationHandler } from '@features/notifications/services/notificationHandler.production';

// Disable warnings in production but keep errors visible in development
LogBox.ignoreAllLogs(!__DEV__);

// Keep console logs but make them less intrusive in development
if (__DEV__) {
  console.log('[App] Running in development mode');
}

/**
 * React Query client configuration
 * Oku: mobile-development-guide/state/15-REACT-QUERY.md
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * App Content with theme-aware status bar
 */
const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  const colors = useColors();
  const initialize = useAuthStore(state => state.initialize);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Initialize auth state on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize Firebase Cloud Messaging when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Initialize FCM (works in both development and production with EAS Build)
      // Note: Won't work in Expo Go - requires development or production build
      notificationHandler.initialize().catch(error => {
        console.error('[App] Failed to initialize FCM:', error);
      });
    }

    // Cleanup on unmount or logout
    return () => {
      if (isAuthenticated) {
        notificationHandler.cleanup();
      }
    };
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.primary}
      />
      <AppNavigator />
    </>
  );
};

/**
 * Root App Component
 * Sets up all providers and global configuration
 */
const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <LocaleProvider>
                <AppContent />
              </LocaleProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
