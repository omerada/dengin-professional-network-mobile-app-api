// src/features/feed/screens/CreatePostScreen.tsx
// Gönderi oluşturma ekranı - Production Ready
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md
// Oku: MOBILE-APP-HOME-SCREEN.md

import React, { useCallback, useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SCREEN_ANIMATIONS } from '@constants/animationPresets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useFeedStore } from '../stores';
import { useCreatePost } from '../hooks';
import { imagePickerService } from '../services';
import { PostTextInput, ImagePreviewGrid } from '../components';
import { SuccessCelebration, ActionFeedback } from '@shared/components';
import { HAPTIC_TYPES } from '@constants/hapticPresets';
import type { UploadProgress, FeedStoreState } from '../types';

/**
 * CreatePostScreen - Production-ready post creation modal
 *
 * Features:
 * - Draft persistence (Zustand + AsyncStorage)
 * - Image upload with progress tracking
 * - Character counter with validation
 * - Haptic feedback on interactions
 * - Reanimated entrance animations
 * - Full accessibility support
 * - Keyboard-aware layout
 * - Optimistic UI updates
 *
 * @example
 * navigation.navigate('CreatePost');
 */
export const CreatePostScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();
  const { medium, heavy, trigger } = useHaptic();

  // Store state
  const draftContent = useFeedStore((state: FeedStoreState) => state.draftContent);
  const draftImages = useFeedStore((state: FeedStoreState) => state.draftImages);
  const setDraftContent = useFeedStore((state: FeedStoreState) => state.setDraftContent);
  const addDraftImage = useFeedStore((state: FeedStoreState) => state.addDraftImage);
  const removeDraftImage = useFeedStore((state: FeedStoreState) => state.removeDraftImage);
  const clearDraft = useFeedStore((state: FeedStoreState) => state.clearDraft);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const createPost = useCreatePost();

  const canPost = draftContent.trim().length > 0 || draftImages.length > 0;
  const isPosting = createPost.isPending;

  const handleClose = useCallback(() => {
    if (draftContent.trim() || draftImages.length > 0) {
      medium(); // Haptic feedback for alert
      Alert.alert(
        'Taslağı Sil',
        'Değişiklikleriniz kaydedilmeyecek. Çıkmak istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel', onPress: () => medium() },
          {
            text: 'Çık',
            style: 'destructive',
            onPress: () => {
              heavy(); // Heavy haptic for destructive action
              clearDraft();
              navigation.goBack();
            },
          },
        ],
      );
    } else {
      medium();
      navigation.goBack();
    }
  }, [navigation, draftContent, draftImages, clearDraft, medium, heavy]);

  const handlePost = useCallback(() => {
    if (!canPost || isPosting) return;

    trigger('medium'); // Haptic feedback for important action

    createPost.mutate(
      {
        data: {
          content: draftContent.trim(),
          images: draftImages,
        },
        onProgress: (progress: UploadProgress) => {
          setUploadProgress(progress);
        },
      },
      {
        onSuccess: () => {
          trigger(HAPTIC_TYPES.success); // Success haptic feedback
          clearDraft();
          setShowSuccess(true);
        },
        onError: () => {
          trigger(HAPTIC_TYPES.error); // Error haptic feedback
        },
      },
    );
  }, [canPost, isPosting, createPost, draftContent, draftImages, trigger, clearDraft]);

  // Header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Yeni Gönderi',
      headerLeft: () => (
        <Pressable
          onPress={handleClose}
          style={styles.headerButton}
          disabled={isPosting}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          accessibilityHint="Gönderi oluşturmayı iptal et ve geri dön">
          <Icon name="close" size={24} color={colors.text.primary} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handlePost}
          style={[
            styles.postButton,
            {
              backgroundColor:
                canPost && !isPosting ? colors.interactive.default : colors.interactive.subtle,
            },
          ]}
          disabled={!canPost || isPosting}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isPosting ? 'Gönderi paylaşılıyor' : 'Gönderiyi paylaş'}
          accessibilityHint={
            canPost ? 'Gönderiyi herkesle paylaş' : 'Paylaşmak için içerik veya görsel ekleyin'
          }
          accessibilityState={{ disabled: !canPost || isPosting }}>
          {isPosting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Paylaş</Text>
          )}
        </Pressable>
      ),
    });
  }, [navigation, canPost, isPosting, colors, draftContent, draftImages, handleClose, handlePost]);

  const handlePickImages = useCallback(async () => {
    if (!imagePickerService.validateImageCount(draftImages.length)) {
      heavy(); // Error haptic
      return;
    }

    medium(); // Selection haptic
    const remainingSlots = 5 - draftImages.length;
    const images = await imagePickerService.pickFromGallery({
      mediaType: 'photo',
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (images.length > 0) {
      trigger('light'); // Success haptic
    }

    images.forEach(image => {
      if (imagePickerService.validateFileSize(image.fileSize)) {
        addDraftImage(image);
      }
    });
  }, [draftImages.length, addDraftImage, medium, heavy, trigger]);

  const handleTakePhoto = useCallback(async () => {
    if (!imagePickerService.validateImageCount(draftImages.length)) {
      heavy(); // Error haptic
      return;
    }

    medium(); // Camera open haptic
    const image = await imagePickerService.captureFromCamera();
    if (image && imagePickerService.validateFileSize(image.fileSize)) {
      trigger('light'); // Success haptic
      addDraftImage(image);
    }
  }, [draftImages.length, addDraftImage, medium, heavy, trigger]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 20}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          accessible
          accessibilityLabel="Gönderi içeriği alanı">
          {/* Text Input */}
          <PostTextInput
            value={draftContent}
            onChangeText={setDraftContent}
            placeholder="Ne düşünüyorsunuz?"
            autoFocus
          />

          {/* Image Preview with animation */}
          {draftImages.length > 0 && (
            <Animated.View
              entering={SCREEN_ANIMATIONS.cardEnter}
              exiting={SCREEN_ANIMATIONS.cardExit}>
              <ImagePreviewGrid
                images={draftImages}
                onRemove={removeDraftImage}
                onAdd={handlePickImages}
                maxImages={5}
              />
            </Animated.View>
          )}

          {/* Upload Progress with animation */}
          {uploadProgress && (
            <Animated.View
              entering={SCREEN_ANIMATIONS.modalEnter}
              exiting={SCREEN_ANIMATIONS.modalExit}
              style={styles.progressContainer}>
              <Text
                style={[styles.progressText, { color: colors.text.secondary }]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`Görsel yükleniyor ${uploadProgress.imageIndex + 1} / ${uploadProgress.totalImages}`}>
                Görsel yükleniyor ({uploadProgress.imageIndex + 1}/{uploadProgress.totalImages})...
              </Text>
              <View
                style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}
                accessible
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: uploadProgress.progress,
                }}>
                <Animated.View
                  entering={SCREEN_ANIMATIONS.quickFadeIn}
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.interactive.default,
                      width: `${uploadProgress.progress}%`,
                    },
                  ]}
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom Toolbar with animation */}
        <Animated.View
          entering={SCREEN_ANIMATIONS.contentEnter}
          style={[
            styles.toolbar,
            {
              backgroundColor: colors.background.primary,
              borderTopColor: colors.border.default,
            },
          ]}>
          <Pressable
            style={styles.toolbarButton}
            onPress={handlePickImages}
            disabled={isPosting}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Galeriden görsel seç"
            accessibilityHint={`${5 - draftImages.length} görsel daha ekleyebilirsiniz`}>
            <Icon name="images-outline" size={24} color={colors.interactive.default} />
            <Text style={[styles.toolbarLabel, { color: colors.interactive.default }]}>Galeri</Text>
          </Pressable>

          <Pressable
            style={styles.toolbarButton}
            onPress={handleTakePhoto}
            disabled={isPosting}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Kamera ile fotoğraf çek"
            accessibilityHint="Hemen fotoğraf çekin ve paylaşın">
            <Icon name="camera-outline" size={24} color={colors.interactive.default} />
            <Text style={[styles.toolbarLabel, { color: colors.interactive.default }]}>Kamera</Text>
          </Pressable>

          <View style={styles.toolbarSpacer} />

          <Text
            style={[styles.imageCount, { color: colors.text.secondary }]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${draftImages.length} / 5 görsel`}>
            {draftImages.length}/5 görsel
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Success Feedback */}
      <ActionFeedback
        type="success"
        visible={showSuccess}
        duration={1200}
        onDismiss={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />

      {/* Success Celebration */}
      <SuccessCelebration
        visible={showSuccess}
        type="checkmark"
        onComplete={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  imageCount: {
    fontSize: 13,
  },
  keyboardView: {
    flex: 1,
  },
  postButton: {
    alignItems: 'center',
    borderRadius: 20,
    minWidth: 70,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  progressBar: {
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressFill: {
    borderRadius: 2,
    height: '100%',
  },
  progressText: {
    fontSize: 13,
    marginBottom: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  toolbar: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 24,
  },
  toolbarLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  toolbarSpacer: {
    flex: 1,
  },
});
