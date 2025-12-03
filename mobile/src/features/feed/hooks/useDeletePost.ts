// src/features/feed/hooks/useDeletePost.ts
// Post silme hook'u
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { feedService } from '../services';
import { FEED_QUERY_KEY } from './useFeed';
import type { FeedResponse } from '../types';

/**
 * Delete post hook
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  return useMutation({
    mutationFn: (postId: string) => feedService.deletePost(postId),

    onSuccess: (_, postId) => {
      // Remove from feed cache
      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: [FEED_QUERY_KEY] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((post) => post.id !== postId),
            })),
          };
        }
      );

      // Navigate back if on post detail
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },

    onError: () => {
      Alert.alert('Hata', 'Gönderi silinemedi. Lütfen tekrar deneyin.');
    },
  });
}

/**
 * Delete post with confirmation
 */
export function useDeletePostWithConfirmation() {
  const deletePost = useDeletePost();

  const confirmAndDelete = (postId: string) => {
    Alert.alert(
      'Gönderiyi Sil',
      'Bu gönderiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deletePost.mutate(postId),
        },
      ]
    );
  };

  return {
    ...deletePost,
    confirmAndDelete,
  };
}

export default useDeletePost;
