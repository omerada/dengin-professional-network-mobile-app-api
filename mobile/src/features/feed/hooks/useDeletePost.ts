// src/features/feed/hooks/useDeletePost.ts
// Post silme hook'u - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { feedService } from '../services';
import { FEED_QUERY_KEY } from './useFeed';
import { POST_QUERY_KEY } from './usePost';
import type { Post } from '../types';

/**
 * Delete post hook
 * Backend API: DELETE /api/posts/{postId}
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  return useMutation<void, Error, number>({
    mutationFn: (postId: number) => feedService.deletePost(postId),

    onSuccess: (_, postId) => {
      // Remove from feed cache
      queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: [FEED_QUERY_KEY] }, old => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map(page => page.filter(post => post.id !== postId)),
        };
      });

      // Remove single post from cache
      queryClient.removeQueries({ queryKey: [POST_QUERY_KEY, postId] });

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

  const confirmAndDelete = (postId: number) => {
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
      ],
    );
  };

  return {
    ...deletePost,
    confirmAndDelete,
  };
}

export default useDeletePost;
