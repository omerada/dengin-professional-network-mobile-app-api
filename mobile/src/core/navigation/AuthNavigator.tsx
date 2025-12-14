// src/core/navigation/AuthNavigator.tsx
// Oku: mobile-development-guide/core/09-NAVIGATION.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@shared/types';
import { UNIFIED_NAVIGATION } from '@constants/unifiedNavigation';

// Auth Screens
import { WelcomeScreen } from '@features/auth/screens/WelcomeScreen';
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { RegisterScreenOptimized } from '@features/auth/screens/RegisterScreenOptimized';
import { WelcomeSuccessScreen } from '@features/auth/screens/WelcomeSuccessScreen';
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen';

// Onboarding
import { OnboardingScreen } from '@features/onboarding/screens';

// Legal
import { TermsScreen, PrivacyScreen } from '@features/legal/screens';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Navigator - handles authentication flow
 * Uses UNIFIED_NAVIGATION for consistent transitions (300ms)
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={UNIFIED_NAVIGATION.stack}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreenOptimized} />
      <Stack.Screen
        name="WelcomeSuccess"
        component={WelcomeSuccessScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} options={UNIFIED_NAVIGATION.modal} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={UNIFIED_NAVIGATION.modal} />
    </Stack.Navigator>
  );
};
