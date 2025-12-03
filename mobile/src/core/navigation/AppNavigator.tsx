// src/core/navigation/AppNavigator.tsx
// Oku: mobile-development-guide/core/09-NAVIGATION.md

import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@shared/types';
import { useAuthStore } from '@features/auth/stores/authStore';
import { linking } from './linking';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

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
    navigationRef.navigate(name, params);
  }
};

/**
 * App Navigator - Root navigation container
 * Handles auth state based navigation
 */
export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);

  // Show loading screen while checking auth state
  if (isLoading) {
    return null; // TODO: Add SplashScreen component
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
