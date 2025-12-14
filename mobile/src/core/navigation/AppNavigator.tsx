// src/core/navigation/AppNavigator.tsx
// Oku: mobile-development-guide/core/09-NAVIGATION.md
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@shared/types';
import { useAuthStore } from '@features/auth/stores/authStore';
import { useColors } from '@contexts/ThemeContext';
import { linking } from './linking';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { VerificationNavigator } from './VerificationNavigator';
import { UNIFIED_NAVIGATION } from '@constants/unifiedNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Navigation container ref for navigation outside of React components
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate function for use outside of React components
 */
export const navigate = <T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
};

/**
 * Go back function for use outside of React components
 */
export const goBack = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

/**
 * Reset navigation state
 * Waits for navigation to be ready before attempting reset
 */
export const resetNavigation = (
  index: number,
  routes: Array<{ name: keyof RootStackParamList; params?: any }>,
) => {
  // Use a small delay to ensure navigation is fully initialized
  // This prevents "The action 'RESET' was not handled" errors
  const attemptReset = () => {
    if (navigationRef.isReady()) {
      try {
        navigationRef.reset({ index, routes });
      } catch (error) {
        if (__DEV__) {
          console.warn('[Navigation] Reset failed, retrying...', error);
        }
        // Retry after a short delay
        setTimeout(attemptReset, 100);
      }
    } else {
      // Navigation not ready, retry after a short delay
      setTimeout(attemptReset, 50);
    }
  };

  attemptReset();
};

/**
 * App Navigator - Root navigation container
 * Handles auth state based navigation
 */
export const AppNavigator: React.FC = () => {
  const colors = useColors();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background.primary }]}>
        <Image
          source={require('../../../assets/dengin-icon.png')}
          style={styles.splashIcon}
          resizeMode="contain"
        />
        <Text style={[styles.splashLogo, { color: colors.text.primary }]}>Dengin</Text>
        <ActivityIndicator
          size="large"
          color={colors.interactive.default}
          style={styles.splashLoader}
        />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator screenOptions={UNIFIED_NAVIGATION.stack}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="Verification"
              component={VerificationNavigator}
              options={UNIFIED_NAVIGATION.criticalModal} // Critical modal - prevent accidental dismissal
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  splashIcon: {
    height: 80,
    marginBottom: 16,
    width: 80,
  },
  splashLoader: {
    marginTop: 24,
  },
  splashLogo: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
