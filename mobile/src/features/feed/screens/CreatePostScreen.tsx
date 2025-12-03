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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { useFeedStore } from '../stores';
import { useCreatePost } from '../hooks';
import { imagePickerService } from '../services';
import { PostTextInput, ImagePreviewGrid } from '../components';
import type { UploadProgress, FeedStoreState } from '../types';

export const CreatePostScreen: React.FC = () => {
  const { theme } = useTheme();
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
      headerLeft: () => (
        <Pressable
          onPress={handleClose}
          style={styles.headerButton}
          disabled={isPosting}
        >
          <Icon
            name="close"
            size={24}
            color={theme.colors.text.primary}
          />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handlePost}
          style={[
            styles.postButton,
            {
              backgroundColor: canPost && !isPosting
                ? theme.colors.primary[500]
                : theme.colors.primary[200],
            },
          ]}
          disabled={!canPost || isPosting}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Paylaş</Text>
          )}
        </Pressable>
      ),
    });
  }, [navigation, canPost, isPosting, theme.colors, draftContent, draftImages]);

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
        ]
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

    images.forEach((image) => {
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
              Görsel yükleniyor ({uploadProgress.imageIndex + 1}/{uploadProgress.totalImages})...
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.background.secondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary[500],
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
            backgroundColor: theme.colors.background.primary,
            borderTopColor: theme.colors.border.light,
          },
        ]}
      >
        <Pressable
          style={styles.toolbarButton}
          onPress={handlePickImages}
          disabled={isPosting}
        >
          <Icon
            name="images-outline"
            size={24}
            color={theme.colors.primary[500]}
          />
          <Text style={[styles.toolbarLabel, { color: theme.colors.primary[500] }]}>
            Galeri
          </Text>
        </Pressable>

        <Pressable
          style={styles.toolbarButton}
          onPress={handleTakePhoto}
          disabled={isPosting}
        >
          <Icon
            name="camera-outline"
            size={24}
            color={theme.colors.primary[500]}
          />
          <Text style={[styles.toolbarLabel, { color: theme.colors.primary[500] }]}>
            Kamera
          </Text>
        </Pressable>

        <View style={styles.toolbarSpacer} />

        <Text style={[styles.imageCount, { color: theme.colors.text.secondary }]}>
          {draftImages.length}/5 görsel
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
