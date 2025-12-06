// src/App.tsx
// Oku: mobile-development-guide/architecture/01-MOBILE-ARCHITECTURE.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md

import { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from '@core/navigation';
import { LocaleProvider } from '@contexts/LocaleContext';
import { useColors, useTheme, ThemeProvider } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores/authStore';
import { notificationHandler } from '@features/notifications/services/notificationHandler.production';

// Disable all LogBox warnings and yellow box notifications
// Errors will still appear in terminal/console for debugging
LogBox.ignoreAllLogs(true);

// Also disable console errors/warnings in the app (they still appear in terminal)
if (__DEV__) {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Keep logs in terminal but don't show overlay
  console.error = (...args) => {
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    originalConsoleWarn(...args);
  };
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

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      notificationHandler.initialize().catch(error => {
        console.error('[App] Failed to initialize notifications:', error);
      });
    }

    // Cleanup on unmount
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
            <LocaleProvider>
              <AppContent />
            </LocaleProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
