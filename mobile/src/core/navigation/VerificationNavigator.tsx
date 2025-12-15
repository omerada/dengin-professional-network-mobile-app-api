// src/core/navigation/VerificationNavigator.tsx
// Kimlik doğrulama akışı navigator'ı
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  VerificationIntroScreen,
  DocumentCaptureScreen,
  SelfieCaptureScreen,
  VerificationReviewScreen,
  UploadStatusScreen,
} from '@features/verification/screens';
import { VerificationProgressIndicator } from '@features/verification/components';
import { useVerificationStore } from '@features/verification/stores';
import { useColors } from '@contexts/ThemeContext';
import { VerificationStackParamList } from '@shared/types';
import { getNavigationConfig, NAVIGATION_PRESETS } from '@constants/unifiedNavigation';

const Stack = createNativeStackNavigator<VerificationStackParamList>();

/**
 * Verification Navigator with global progress indicator
 *
 * ✅ ENHANCED: Uses standardized navigation configs
 * Critical flow - prevents accidental dismissal
 */
export const VerificationNavigator: React.FC = () => {
  const colors = useColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        ...getNavigationConfig('criticalModal'),
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
          ...NAVIGATION_PRESETS.media, // Fullscreen camera
          title: 'Kimlik Belgesi',
        }}
      />
      <Stack.Screen
        name="SelfieCapture"
        component={SelfieCaptureScreen}
        options={{
          ...NAVIGATION_PRESETS.media, // Fullscreen camera
          title: 'Selfie',
        }}
      />
      <Stack.Screen
        name="VerificationReview"
        component={VerificationReviewScreen}
        options={{
          ...NAVIGATION_PRESETS.critical, // Critical step - no dismiss
          title: 'İnceleme',
          headerBackVisible: true,
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

/**
 * Verification Navigator wrapper with progress indicator
 */
export const VerificationNavigatorWithProgress: React.FC = () => {
  const colors = useColors();
  const currentStep = useVerificationStore(state => state.currentStep);

  // Don't show progress on intro and status screens
  const showProgress = currentStep !== 'intro' && currentStep !== 'uploading';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {showProgress && <VerificationProgressIndicator currentStep={currentStep} />}
      <VerificationNavigator />
    </View>
  );
};

export default VerificationNavigator;
