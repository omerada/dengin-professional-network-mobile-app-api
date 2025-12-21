// src/core/navigation/AuthNavigator.tsx
// ✅ UNIFIED NAVIGATION: 3 presets only (SCREEN, MODAL, FULLSCREEN)
// Production Standard: Consistent transitions

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@shared/types';
import { UNIFIED_NAVIGATION } from '@constants/unifiedNavigation';

// Auth Screens
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { RegisterScreenOptimized } from '@features/auth/screens/RegisterScreenOptimized';
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen';

// Onboarding
import { OnboardingScreen } from '@features/onboarding/screens';

// Legal
import { TermsScreen, PrivacyScreen } from '@features/legal/screens';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Navigator - Production Standard
 * Uses UNIFIED_NAVIGATION for consistent user experience
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={UNIFIED_NAVIGATION.SCREEN}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreenOptimized}
        options={UNIFIED_NAVIGATION.MODAL}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} options={UNIFIED_NAVIGATION.MODAL} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={UNIFIED_NAVIGATION.MODAL} />
    </Stack.Navigator>
  );
};
