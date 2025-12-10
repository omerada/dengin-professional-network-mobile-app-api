// src/features/verification/screens/VerificationStatusScreen.tsx
// Verification status screen - Shows user's verification process status
// Future: Will track PENDING_REVIEW, APPROVED, REJECTED states

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';

/**
 * VerificationStatusScreen - Doğrulama durumu ekranı
 *
 * Kullanıcının meslek doğrulama sürecinin durumunu gösterir:
 * - PENDING_REVIEW: İnceleme aşamasında
 * - APPROVED: Onaylandı
 * - REJECTED: Reddedildi
 */
export const VerificationStatusScreen: React.FC = memo(() => {
  const colors = useColors();
  const navigation = useNavigation();
  const { trigger } = useHaptic();

  const handleBack = () => {
    trigger('light');
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { borderBottomColor: colors.border.subtle }]}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Doğrulama Durumu</Text>
        <View style={styles.headerRight} />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, { backgroundColor: colors.interactive.default + '15' }]}>
          <Icon name="hourglass-outline" size={64} color={colors.interactive.default} />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>Yakında Gelecek</Text>
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Doğrulama durumu takibi özelliği geliştirme aşamasındadır.
        </Text>
      </View>
    </SafeAreaView>
  );
});

VerificationStatusScreen.displayName = 'VerificationStatusScreen';

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 80,
    height: 120,
    justifyContent: 'center',
    marginBottom: 24,
    width: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});
