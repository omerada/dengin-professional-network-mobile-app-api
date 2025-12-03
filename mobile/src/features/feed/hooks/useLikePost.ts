// src/features/feed/hooks/useLikePost.ts
// Post beğenme hook'u (optimistic update)
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedService } from '../services';
import { FEED_QUERY_KEY } from './useFeed';
import { POST_QUERY_KEY } from './usePost';
import type { Post, FeedResponse } from '../types';

/**
 * Like post hook - optimistic update destekli
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (isLiked) {
        return feedService.unlikePost(postId);
      }
      return feedService.likePost(postId);
    },

    onMutate: async ({ postId, isLiked }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: [FEED_QUERY_KEY] });
      await queryClient.cancelQueries({ queryKey: [POST_QUERY_KEY, postId] });

      // Snapshot previous values
      const previousFeed = queryClient.getQueriesData<InfiniteData<FeedResponse>>({
        queryKey: [FEED_QUERY_KEY],
      });
      const previousPost = queryClient.getQueryData<Post>([POST_QUERY_KEY, postId]);

      // Optimistic update for feed
      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: [FEED_QUERY_KEY] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !isLiked,
                      likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      // Optimistic update for single post
      if (previousPost) {
        queryClient.setQueryData<Post>([POST_QUERY_KEY, postId], {
          ...previousPost,
          isLiked: !isLiked,
          likesCount: isLiked ? previousPost.likesCount - 1 : previousPost.likesCount + 1,
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

    onSettled: (_data, _error, { postId }) => {
      // Refetch to ensure data is correct
      queryClient.invalidateQueries({ queryKey: [FEED_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [POST_QUERY_KEY, postId] });
    },
  });
}

export default useLikePost;
