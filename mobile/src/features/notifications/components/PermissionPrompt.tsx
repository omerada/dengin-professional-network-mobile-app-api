// src/features/notifications/components/PermissionPrompt.tsx
// Permission request prompt for push notifications
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';

interface PermissionPromptProps {
  visible: boolean;
  onRequestPermission: () => void;
  onDismiss: () => void;
  permissionDenied?: boolean;
}

export const PermissionPrompt: React.FC<PermissionPromptProps> = memo(
  ({ visible, onRequestPermission, onDismiss, permissionDenied = false }) => {
    const colors = useColors();

    const handleOpenSettings = () => {
      Linking.openSettings();
      onDismiss();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onDismiss}>
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onDismiss} />

          <Animated.View
            entering={SlideInDown.duration(250)}
            exiting={SlideOutDown.duration(150)}
            style={[styles.content, { backgroundColor: colors.background.secondary }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.interactive.subtle }]}>
              <Icon name="notifications" size={40} color={colors.interactive.default} />
            </View>

            <Text style={[styles.title, { color: colors.text.primary }]}>
              {permissionDenied ? 'Bildirimler Kapatıldı' : 'Bildirimleri Aç'}
            </Text>

            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {permissionDenied
                ? 'Bildirim almak için ayarlardan bildirim iznini etkinleştirmeniz gerekiyor.'
                : 'Mesajlar, beğeniler ve diğer etkileşimlerden anında haberdar olmak için bildirimleri açın.'}
            </Text>

            <View style={styles.features}>
              <FeatureItem icon="chatbubble" text="Yeni mesajlar" colors={colors} />
              <FeatureItem icon="heart" text="Beğeniler ve yorumlar" colors={colors} />
              <FeatureItem icon="person-add" text="Yeni takipçiler" colors={colors} />
              <FeatureItem
                icon="checkmark-circle"
                text="Doğrulama güncellemeleri"
                colors={colors}
              />
            </View>

            <Pressable
              onPress={permissionDenied ? handleOpenSettings : onRequestPermission}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.interactive.default },
                pressed && styles.buttonPressed,
              ]}>
              <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
                {permissionDenied ? 'Ayarlara Git' : 'Bildirimleri Aç'}
              </Text>
            </Pressable>

            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>
                {permissionDenied ? 'Tamam' : 'Şimdi Değil'}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  },
);

interface FeatureItemProps {
  icon: string;
  text: string;
  colors: any;
}

const FeatureItem: React.FC<FeatureItemProps> = memo(({ icon, text, colors }) => (
  <View style={styles.featureItem}>
    <Icon name={icon} size={18} color={colors.interactive.default} style={styles.featureIcon} />
    <Text style={[styles.featureText, { color: colors.text.primary }]}>{text}</Text>
  </View>
));

FeatureItem.displayName = 'FeatureItem';
PermissionPrompt.displayName = 'PermissionPrompt';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureIcon: {
    marginRight: 12,
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
  },
  features: {
    marginBottom: 24,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
    width: 80,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 16,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default PermissionPrompt;
