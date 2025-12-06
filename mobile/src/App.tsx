// src/App.tsx
// Oku: mobile-development-guide/architecture/01-MOBILE-ARCHITECTURE.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, LocaleProvider, useTheme, useColors } from '@contexts';
import { AppNavigator } from '@core/navigation';
import { useAuthStore } from '@features/auth/stores';

// Ignore specific warnings in development
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

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

  // Initialize auth state on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

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
