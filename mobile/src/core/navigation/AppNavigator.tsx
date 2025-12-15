// src/core/navigation/AppNavigator.tsx
// Oku: mobile-development-guide/core/09-NAVIGATION.md
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '@features/auth/stores/authStore';
import { useColors } from '@contexts/ThemeContext';
import { linking } from './linking';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { VerificationNavigator } from './VerificationNavigator';
import { UNIFIED_NAVIGATION } from '@constants/unifiedNavigation';
import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <Stack.Navigator screenOptions={UNIFIED_NAVIGATION.SCREEN}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="Verification"
              component={VerificationNavigator}
              options={UNIFIED_NAVIGATION.FULLSCREEN}
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
