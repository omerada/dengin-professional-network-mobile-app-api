// src/core/navigation/VerificationNavigator.tsx
// Kimlik doğrulama akışı navigator'ı
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  VerificationIntroScreen,
  DocumentCaptureScreen,
  SelfieCaptureScreen,
  VerificationReviewScreen,
  UploadStatusScreen,
} from '@features/verification/screens';
import { useColors } from '@contexts/ThemeContext';
import { VerificationStackParamList } from '@shared/types';

const Stack = createNativeStackNavigator<VerificationStackParamList>();

/**
 * Verification Navigator
 */
export const VerificationNavigator: React.FC = () => {
  const colors = useColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background.primary,
        },
      }}>
      <Stack.Screen
        name="VerificationIntro"
        component={VerificationIntroScreen}
        options={{
          title: 'Kimlik Doğrulama',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="DocumentCapture"
        component={DocumentCaptureScreen}
        options={{
          title: 'Kimlik Belgesi',
          headerShown: false, // Kamera ekranı tam ekran
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SelfieCapture"
        component={SelfieCaptureScreen}
        options={{
          title: 'Selfie',
          headerShown: false, // Kamera ekranı tam ekran
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="VerificationReview"
        component={VerificationReviewScreen}
        options={{
          title: 'İnceleme',
          headerBackVisible: true,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="VerificationStatus"
        component={UploadStatusScreen}
        options={{
          title: 'Doğrulama Durumu',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default VerificationNavigator;
