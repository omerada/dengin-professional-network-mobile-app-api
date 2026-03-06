// src/features/verification/components/CameraPermissionGate.tsx
// Production-ready Camera Permission Flow
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { memo, ReactNode, useCallback } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { Button, UnifiedLoadingState } from '@shared/components';
import { spacing, fontSize, borderRadius } from '@theme';
import { useCameraPermission } from '../hooks';

// ============================================================================
// Types
// ============================================================================

interface CameraPermissionGateProps {
  /** Content to render when permission is granted */
  children: ReactNode;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// PermissionScreen Component
// ============================================================================

interface PermissionScreenProps {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: 'primary' | 'secondary';
  onButtonPress: () => void;
  isLoading?: boolean;
}

const PermissionScreen: React.FC<PermissionScreenProps> = memo(
  ({
    icon,
    title,
    description,
    buttonLabel,
    buttonVariant = 'primary',
    onButtonPress,
    isLoading,
  }) => {
    const colors = useColors();

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={['top', 'bottom']}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.content}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors.interactive.subtle,
                borderColor: colors.border.default,
              },
            ]}>
            <Icon name={icon} size={64} color={colors.interactive.default} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={buttonLabel}
              onPress={onButtonPress}
              variant={buttonVariant}
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  },
);

PermissionScreen.displayName = 'PermissionScreen';

// ============================================================================
// CameraPermissionGate Component
// ============================================================================

/**
 * Camera Permission Gate
 *
 * Features:
 * - Automatic permission checking
 * - Request permission UI
 * - Settings redirect for denied permissions
 * - Loading states
 * - User-friendly error messages
 *
 * States:
 * 1. Checking permission (loading)
 * 2. Request permission (not granted yet)
 * 3. Permission denied (needs settings)
 * 4. Permission granted (show children)
 *
 * @example
 * ```tsx
 * <CameraPermissionGate>
 *   <CameraView />
 * </CameraPermissionGate>
 * ```
 */
export const CameraPermissionGate: React.FC<CameraPermissionGateProps> = memo(
  ({ children, testID }) => {
    const { hasPermission, requestPermission, isDenied, isChecking } = useCameraPermission();
    const toast = useToast();

    const handleOpenSettings = useCallback(() => {
      Linking.openSettings().catch(() => {
        toast.error(
          'Ayarlar sayfası açılamadı. Lütfen manuel olarak Ayarlar > Dengin > Kamera izni verin.',
        );
      });
    }, [toast]);

    const handleRequestPermission = useCallback(async () => {
      const granted = await requestPermission();

      if (!granted) {
        toast.error('Kamera izni verilmedi. Kimlik doğrulama için kamera erişimi gerekiyor.');
      }
    }, [requestPermission, toast]);

    // Loading state - checking permission
    if (isChecking) {
      return (
        <UnifiedLoadingState
          strategy="spinner"
          message="Kamera izni kontrol ediliyor..."
          variant="screen"
        />
      );
    }

    // Permission denied - needs settings
    if (isDenied) {
      return (
        <PermissionScreen
          icon="camera-off-outline"
          title="Kamera İzni Gerekli"
          description={`Kimlik doğrulama için kamera erişimi vermeniz gerekiyor.\n\n${
            Platform.OS === 'ios'
              ? 'Ayarlar > Dengin > Kamera'
              : 'Ayarlar > Uygulamalar > Dengin > İzinler > Kamera'
          } yolunu takip ederek izin verebilirsiniz.`}
          buttonLabel="Ayarlara Git"
          buttonVariant="primary"
          onButtonPress={handleOpenSettings}
        />
      );
    }

    // Permission not granted yet - request
    if (!hasPermission) {
      return (
        <PermissionScreen
          icon="camera-outline"
          title="Kamera İzni"
          description="Kimlik belgesi ve selfie çekimi için kamera erişimi gerekiyor. Bu izin sadece doğrulama sırasında kullanılacaktır."
          buttonLabel="İzin Ver"
          buttonVariant="primary"
          onButtonPress={handleRequestPermission}
        />
      );
    }

    // Permission granted - render children
    return <View testID={testID}>{children}</View>;
  },
);

CameraPermissionGate.displayName = 'CameraPermissionGate';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: borderRadius['3xl'],
    borderWidth: 2,
    height: 120,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 120,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.base,
    lineHeight: 24,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: spacing.lg,
    width: '100%',
  },
});
