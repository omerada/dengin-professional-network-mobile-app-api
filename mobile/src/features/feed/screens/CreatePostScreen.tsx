// src/features/feed/screens/CreatePostScreen.tsx
// Gönderi oluşturma ekranı
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useFeedStore } from '../stores';
import { useCreatePost } from '../hooks';
import { imagePickerService } from '../services';
import { PostTextInput, ImagePreviewGrid } from '../components';
import type { UploadProgress, FeedStoreState } from '../types';

export const CreatePostScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();

  // Store state
  const draftContent = useFeedStore((state: FeedStoreState) => state.draftContent);
  const draftImages = useFeedStore((state: FeedStoreState) => state.draftImages);
  const setDraftContent = useFeedStore((state: FeedStoreState) => state.setDraftContent);
  const addDraftImage = useFeedStore((state: FeedStoreState) => state.addDraftImage);
  const removeDraftImage = useFeedStore((state: FeedStoreState) => state.removeDraftImage);
  const clearDraft = useFeedStore((state: FeedStoreState) => state.clearDraft);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const createPost = useCreatePost();

  const canPost = draftContent.trim().length > 0 || draftImages.length > 0;
  const isPosting = createPost.isPending;

  // Header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Yeni Gönderi',
      headerLeft: () => (
        <Pressable onPress={handleClose} style={styles.headerButton} disabled={isPosting}>
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
          disabled={!canPost || isPosting}>
          {isPosting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Paylaş</Text>
          )}
        </Pressable>
      ),
    });
  }, [navigation, canPost, isPosting, colors, draftContent, draftImages]);

  const handleClose = useCallback(() => {
    if (draftContent.trim() || draftImages.length > 0) {
      Alert.alert(
        'Taslağı Sil',
        'Değişiklikleriniz kaydedilmeyecek. Çıkmak istediğinizden emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Çık',
            style: 'destructive',
            onPress: () => {
              clearDraft();
              navigation.goBack();
            },
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  }, [navigation, draftContent, draftImages, clearDraft]);

  const handlePost = useCallback(() => {
    if (!canPost || isPosting) return;

    createPost.mutate({
      data: {
        content: draftContent.trim(),
        images: draftImages,
      },
      onProgress: (progress: UploadProgress) => {
        setUploadProgress(progress);
      },
    });
  }, [canPost, isPosting, createPost, draftContent, draftImages]);

  const handlePickImages = useCallback(async () => {
    if (!imagePickerService.validateImageCount(draftImages.length)) {
      return;
    }

    const remainingSlots = 5 - draftImages.length;
    const images = await imagePickerService.pickFromGallery({
      mediaType: 'photo',
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    images.forEach(image => {
      if (imagePickerService.validateFileSize(image.fileSize)) {
        addDraftImage(image);
      }
    });
  }, [draftImages.length, addDraftImage]);

  const handleTakePhoto = useCallback(async () => {
    if (!imagePickerService.validateImageCount(draftImages.length)) {
      return;
    }

    const image = await imagePickerService.captureFromCamera();
    if (image && imagePickerService.validateFileSize(image.fileSize)) {
      addDraftImage(image);
    }
  }, [draftImages.length, addDraftImage]);

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
          showsVerticalScrollIndicator={false}>
          {/* Text Input */}
          <PostTextInput
            value={draftContent}
            onChangeText={setDraftContent}
            placeholder="Ne düşünüyorsunuz?"
            autoFocus
          />

          {/* Image Preview */}
          {draftImages.length > 0 && (
            <ImagePreviewGrid
              images={draftImages}
              onRemove={removeDraftImage}
              onAdd={handlePickImages}
              maxImages={5}
            />
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                Görsel yükleniyor ({uploadProgress.imageIndex + 1}/{uploadProgress.totalImages})...
              </Text>
              <View style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.interactive.default,
                      width: `${uploadProgress.progress}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Toolbar */}
        <View
          style={[
            styles.toolbar,
            {
              backgroundColor: colors.background.primary,
              borderTopColor: colors.border.default,
            },
          ]}>
          <Pressable style={styles.toolbarButton} onPress={handlePickImages} disabled={isPosting}>
            <Icon name="images-outline" size={24} color={colors.interactive.default} />
            <Text style={[styles.toolbarLabel, { color: colors.interactive.default }]}>Galeri</Text>
          </Pressable>

          <Pressable style={styles.toolbarButton} onPress={handleTakePhoto} disabled={isPosting}>
            <Icon name="camera-outline" size={24} color={colors.interactive.default} />
            <Text style={[styles.toolbarLabel, { color: colors.interactive.default }]}>Kamera</Text>
          </Pressable>

          <View style={styles.toolbarSpacer} />

          <Text style={[styles.imageCount, { color: colors.text.secondary }]}>
            {draftImages.length}/5 görsel
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  toolbarLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarSpacer: {
    flex: 1,
  },
  imageCount: {
    fontSize: 13,
  },
});
