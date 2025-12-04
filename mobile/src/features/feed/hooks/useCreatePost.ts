// src/features/feed/hooks/useCreatePost.ts
// Post oluşturma hook'u - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { feedService, mediaUploader } from '../services';
import { useFeedStore } from '../stores';
import { FEED_QUERY_KEY } from './useFeed';
import type { CreatePostDto, CreatePostRequest, Post, UploadProgress, FeedStoreState } from '../types';

/**
 * Post oluşturma hook'u
 * 
 * İş akışı:
 * 1. Görselleri S3'e yükle (mediaUploader)
 * 2. S3 URL'leri ile backend'e POST /api/posts
 * 
 * @example
 * const { mutate, isPending } = useCreatePost();
 * mutate({
 *   data: { content: 'Hello World', images: [...localImages], professionId: 1 },
 *   onProgress: (progress) => console.log(progress.percent)
 * });
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
      // 1. Görselleri S3'e yükle
      let imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        imageUrls = await mediaUploader.uploadImages(data.images, onProgress);
      }

      // 2. Backend'e post oluştur
      const request: CreatePostRequest = {
        content: data.content,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        professionId: data.professionId,
      };

      return feedService.createPost(request);
    },

    onSuccess: () => {
      // Clear draft
      clearDraft();

      // Invalidate feed to refetch
      queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY] });

      // Navigate back
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
  });
}

export default useCreatePost;
