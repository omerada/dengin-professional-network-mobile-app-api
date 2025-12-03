// src/features/feed/hooks/useCreatePost.ts
// Post oluşturma hook'u
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { feedService, mediaUploader } from '../services';
import { useFeedStore } from '../stores';
import { FEED_QUERY_KEY } from './useFeed';
import type { CreatePostDto, Post, UploadProgress, FeedStoreState } from '../types';

/**
 * Post oluşturma hook'u
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const clearDraft = useFeedStore((state: FeedStoreState) => state.clearDraft);

  return useMutation<
    Post,
    Error,
    { data: CreatePostDto; onProgress?: (progress: UploadProgress) => void }
  >({
    mutationFn: async ({ data, onProgress }) => {
      // Upload images first
      const imageUrls = await mediaUploader.uploadImages(data.images, onProgress);

      // Create post
      return feedService.createPost(data, imageUrls);
    },

    onSuccess: () => {
      // Clear draft
      clearDraft();

      // Invalidate feed
      queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY] });

      // Navigate back
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
  });
}

export default useCreatePost;
