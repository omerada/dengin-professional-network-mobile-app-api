// src/core/navigation/AuthNavigator.tsx
// Oku: mobile-development-guide/core/09-NAVIGATION.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@shared/types';

// Auth Screens
import { WelcomeScreen } from '@features/auth/screens/WelcomeScreen';
import { LoginScreen } from '@features/auth/screens/LoginScreen';
// import { RegisterScreen } from '@features/auth/screens/RegisterScreen'; // Old single-step version
// import { RegisterScreenMultiStep } from '@features/auth/screens/RegisterScreenMultiStep'; // Old 3-step version
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
 * Includes: Onboarding, Welcome, Login, Register, Welcome Success, Forgot Password, Legal
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 250,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        gestureDirection: 'horizontal',
      }}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreenOptimized} />
      <Stack.Screen
        name="WelcomeSuccess"
        component={WelcomeSuccessScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
