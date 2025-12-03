// src/core/navigation/AuthNavigator.tsx
// Oku: mobile-development-guide/core/09-NAVIGATION.md
// Oku: mobile-development-guide/sprints/23-SPRINT-1-2.md

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@shared/types';

// Screens - will be implemented in auth feature
import { WelcomeScreen } from '@features/auth/screens/WelcomeScreen';
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { RegisterScreen } from '@features/auth/screens/RegisterScreen';
import { ForgotPasswordScreen } from '@features/auth/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Navigator - handles authentication flow
 * Includes: Welcome, Login, Register, Forgot Password
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
