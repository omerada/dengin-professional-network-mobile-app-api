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
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SCREEN_ANIMATIONS } from '@constants/animationPresets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useSemanticHaptic } from '@shared/hooks';
import { spacing } from '@theme';
import { useFeedStore } from '../stores';
import { useCreatePost } from '../hooks';
import { imagePickerService } from '../services';
import { PostTextInput, ImagePreviewGrid } from '../components';
import { SuccessCelebration, ActionFeedback, ActionSheet } from '@shared/components';
import { showSuccess, showError } from '@shared/utils';
import { useAuthStore } from '@features/auth/stores';
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
  const toast = useToast();
  const navigation = useNavigation();
  const { triggerContent, triggerSystem, triggerMedia } = useSemanticHaptic();

  // Auth state - needed for professionId
  const user = useAuthStore(state => state.user);

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
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  const createPost = useCreatePost();

  const canPost = draftContent.trim().length > 0 || draftImages.length > 0;
  const isPosting = createPost.isPending;

  const handleClose = useCallback(() => {
    if (draftContent.trim() || draftImages.length > 0) {
      triggerSystem('alert'); // Haptic feedback for alert
      setShowDiscardAlert(true);
    } else {
      triggerSystem('success');
      navigation.goBack();
    }
  }, [navigation, draftContent, draftImages, triggerSystem]);

  const handleDiscardDraft = useCallback(() => {
    triggerContent('delete'); // Heavy haptic for destructive action
    clearDraft();
    setShowDiscardAlert(false);
    navigation.goBack();
  }, [clearDraft, navigation, triggerContent]);

  const handlePost = useCallback(() => {
    if (!canPost || isPosting) return;

    // Get user's professionId - required by backend
    const professionId = user?.professionId;
    if (!professionId) {
      showError(
        toast,
        { trigger: triggerSystem },
        'Meslek bilgisi bulunamadı. Lütfen profilinizi tamamlayın.',
      );
      return;
    }

    triggerContent('create'); // Haptic feedback for creating post

    createPost.mutate(
      {
        data: {
          content: draftContent.trim(),
          images: draftImages,
          professionId, // Backend requires this field
        },
        onProgress: (progress: UploadProgress) => {
          setUploadProgress(progress);
        },
      },
      {
        onSuccess: () => {
          triggerSystem('success'); // Success haptic feedback
          clearDraft();
          setShowSuccess(true);
        },
        onError: () => {
          triggerSystem('error'); // Error haptic feedback
        },
      },
    );
  }, [
    canPost,
    isPosting,
    createPost,
    draftContent,
    draftImages,
    user,
    triggerContent,
    triggerSystem,
    clearDraft,
  ]);

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
            <ActivityIndicator size="small" color={colors.text.onPrimary} />
          ) : (
            <Text style={[styles.postButtonText, { color: colors.text.onPrimary }]}>Paylaş</Text>
          )}
        </Pressable>
      ),
    });
  }, [navigation, canPost, isPosting, colors, draftContent, draftImages, handleClose, handlePost]);

  const handlePickImages = useCallback(async () => {
    if (!imagePickerService.validateImageCount(draftImages.length)) {
      triggerSystem('error'); // Error haptic
      return;
    }

    triggerMedia('select'); // Selection haptic
    const remainingSlots = 5 - draftImages.length;
    const images = await imagePickerService.pickFromGallery({
      mediaType: 'photo',
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (images.length > 0) {
      triggerSystem('success'); // Success haptic
    }

    images.forEach(image => {
      if (imagePickerService.validateFileSize(image.fileSize)) {
        addDraftImage(image);
      }
    });
  }, [draftImages.length, addDraftImage, triggerMedia, triggerSystem]);

  const handleTakePhoto = useCallback(async () => {
    if (!imagePickerService.validateImageCount(draftImages.length)) {
      triggerSystem('error'); // Error haptic
      return;
    }

    triggerMedia('capture'); // Camera open haptic
    const image = await imagePickerService.captureFromCamera();
    if (image && imagePickerService.validateFileSize(image.fileSize)) {
      triggerSystem('success'); // Success haptic
      addDraftImage(image);
    }
  }, [draftImages.length, addDraftImage, triggerMedia, triggerSystem]);

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

      {/* Discard Draft Confirmation */}
      <ActionSheet
        visible={showDiscardAlert}
        onClose={() => {
          setShowDiscardAlert(false);
          triggerSystem('success');
        }}
        title="Taslağı Sil"
        message="Değişiklikleriniz kaydedilmeyecek. Çıkmak istediğinizden emin misiniz?"
        options={[
          {
            id: 'discard',
            label: 'Çık',
            icon: 'trash-outline',
            destructive: true,
            onPress: handleDiscardDraft,
          },
        ]}
        cancelLabel="İptal"
        testID="discard-draft-sheet"
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
    marginBottom: spacing.sm, // 8
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md, // 16
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
