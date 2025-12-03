// src/features/feed/hooks/useBookmarkPost.ts
// Post kaydetme hook'u
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedService } from '../services';
import { FEED_QUERY_KEY } from './useFeed';
import { POST_QUERY_KEY } from './usePost';
import type { Post, FeedResponse } from '../types';

/**
 * Bookmark post hook - optimistic update
 */
export function useBookmarkPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string; isBookmarked: boolean }) => {
      return feedService.bookmarkPost(postId);
    },

    onMutate: async ({ postId, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: [FEED_QUERY_KEY] });
      await queryClient.cancelQueries({ queryKey: [POST_QUERY_KEY, postId] });

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
                  ? { ...post, isBookmarked: !isBookmarked }
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
          isBookmarked: !isBookmarked,
        });
      }

      return { previousFeed, previousPost };
    },

    onError: (_error, { postId }, context) => {
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
