// src/features/feed/hooks/useBookmarkPost.ts
// Post kaydetme hook'u - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedService } from '../services';
import { FEED_QUERY_KEY } from './useFeed';
import { POST_QUERY_KEY } from './usePost';
import type { Post } from '../types';

/**
 * Bookmark post hook - optimistic update
 * Backend API: POST /api/posts/{postId}/save, DELETE /api/posts/{postId}/save
 * 
 * @example
 * const { mutate } = useBookmarkPost();
 * mutate({ postId: 123, isSaved: false }); // Save post
 * mutate({ postId: 123, isSaved: true }); // Unsave post
 */
export function useBookmarkPost() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { postId: number; isSaved: boolean }>({
    mutationFn: async ({ postId, isSaved }) => {
      if (isSaved) {
        return feedService.unsavePost(postId);
      }
      return feedService.savePost(postId);
    },

    onMutate: async ({ postId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: [FEED_QUERY_KEY] });
      await queryClient.cancelQueries({ queryKey: [POST_QUERY_KEY, postId] });

      const previousFeed = queryClient.getQueriesData<InfiniteData<Post[]>>({
        queryKey: [FEED_QUERY_KEY],
      });
      const previousPost = queryClient.getQueryData<Post>([POST_QUERY_KEY, postId]);

      // Optimistic update for feed
      queryClient.setQueriesData<InfiniteData<Post[]>>(
        { queryKey: [FEED_QUERY_KEY] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((post) =>
                post.postId === postId
                  ? { 
                      ...post, 
                      userInteraction: {
                        ...post.userInteraction,
                        isSaved: !isSaved,
                      },
                    }
                  : post
              )
            ),
          };
        }
      );

      // Optimistic update for single post
      if (previousPost) {
        queryClient.setQueryData<Post>([POST_QUERY_KEY, postId], {
          ...previousPost,
          userInteraction: {
            ...previousPost.userInteraction,
            isSaved: !isSaved,
          },
        });
      }

      return { previousFeed, previousPost };
    },

    onError: (_error, { postId }, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        context.previousFeed.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.previousPost) {
        queryClient.setQueryData([POST_QUERY_KEY, postId], context.previousPost);
      }
    },
  });
}

export default useBookmarkPost;
