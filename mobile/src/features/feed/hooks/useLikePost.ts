// src/features/feed/hooks/useLikePost.ts
// Post beğenme hook'u (optimistic update)
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedService } from '../services';
import { FEED_QUERY_KEY, TRENDING_FEED_KEY } from './useFeed';
import { POST_QUERY_KEY } from './usePost';
import type { Post, FeedResponse, LikeResponse } from '../types';

/**
 * Like post hook - optimistic update destekli
 * POST /api/posts/{postId}/like or DELETE /api/posts/{postId}/like
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation<LikeResponse, Error, { postId: number; isLiked: boolean }>({
    mutationFn: async ({ postId, isLiked }) => {
      if (isLiked) {
        return feedService.unlikePost(postId);
      }
      return feedService.likePost(postId);
    },

    onMutate: async ({ postId, isLiked }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: [FEED_QUERY_KEY] });
      await queryClient.cancelQueries({ queryKey: [TRENDING_FEED_KEY] });
      await queryClient.cancelQueries({ queryKey: [POST_QUERY_KEY, postId] });

      // Snapshot previous values
      const previousFeed = queryClient.getQueriesData<InfiniteData<FeedResponse>>({
        queryKey: [FEED_QUERY_KEY],
      });
      const previousTrending = queryClient.getQueriesData<InfiniteData<FeedResponse>>({
        queryKey: [TRENDING_FEED_KEY],
      });
      const previousPost = queryClient.getQueryData<Post>([POST_QUERY_KEY, postId]);

      // Helper function to update posts in feed
      const updateFeedPosts = (old: InfiniteData<FeedResponse> | undefined) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.map((post) =>
              post.postId === postId
                ? {
                    ...post,
                    userInteraction: {
                      ...post.userInteraction,
                      isLiked: !isLiked,
                    },
                    stats: {
                      ...post.stats,
                      likeCount: isLiked ? post.stats.likeCount - 1 : post.stats.likeCount + 1,
                    },
                  }
                : post
            ),
          })),
        };
      };

      // Optimistic update for main feed
      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: [FEED_QUERY_KEY] },
        updateFeedPosts
      );

      // Optimistic update for trending feed
      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: [TRENDING_FEED_KEY] },
        updateFeedPosts
      );

      // Optimistic update for single post
      if (previousPost) {
        queryClient.setQueryData<Post>([POST_QUERY_KEY, postId], {
          ...previousPost,
          userInteraction: {
            ...previousPost.userInteraction,
            isLiked: !isLiked,
          },
          stats: {
            ...previousPost.stats,
            likeCount: isLiked ? previousPost.stats.likeCount - 1 : previousPost.stats.likeCount + 1,
          },
        });
      }

      return { previousFeed, previousTrending, previousPost };
    },

    onError: (_error, { postId }, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        context.previousFeed.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.previousTrending) {
        context.previousTrending.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.previousPost) {
        queryClient.setQueryData([POST_QUERY_KEY, postId], context.previousPost);
      }
    },

    onSettled: (_data, _error, { postId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: [POST_QUERY_KEY, postId] });
    },
  });
}

export default useLikePost;
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
