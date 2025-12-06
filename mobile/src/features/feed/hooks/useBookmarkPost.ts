// src/features/feed/hooks/useBookmarkPost.ts
// Post kaydetme hook'u - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useMutation, useQueryClient, InfiniteData, QueryKey } from '@tanstack/react-query';
import { feedService } from '../services';
import { FEED_QUERY_KEY } from './useFeed';
import { POST_QUERY_KEY } from './usePost';
import type { Post, FeedResponse } from '../types';

/**
 * Context type for optimistic updates
 */
interface BookmarkMutationContext {
  previousFeed: [QueryKey, InfiniteData<FeedResponse> | undefined][];
  previousPost: Post | undefined;
}

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

  return useMutation<void, Error, { postId: number; isSaved: boolean }, BookmarkMutationContext>({
    mutationFn: async ({ postId, isSaved }) => {
      if (isSaved) {
        return feedService.unsavePost(postId);
      }
      return feedService.savePost(postId);
    },

    onMutate: async ({ postId, isSaved }): Promise<BookmarkMutationContext> => {
      await queryClient.cancelQueries({ queryKey: [FEED_QUERY_KEY] });
      await queryClient.cancelQueries({ queryKey: [POST_QUERY_KEY, postId] });

      const previousFeed = queryClient.getQueriesData<InfiniteData<FeedResponse>>({
        queryKey: [FEED_QUERY_KEY],
      });
      const previousPost = queryClient.getQueryData<Post>([POST_QUERY_KEY, postId]);

      // Optimistic update for feed
      queryClient.setQueriesData<InfiniteData<FeedResponse>>(
        { queryKey: [FEED_QUERY_KEY] },
        (old): InfiniteData<FeedResponse> | undefined => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              content: page.content.map(post =>
                post.id === postId
                  ? {
                      ...post,
                      userInteraction: {
                        ...post.userInteraction,
                        isLiked: post.userInteraction?.isLiked ?? post.liked,
                        isSaved: !isSaved,
                      },
                    }
                  : post,
              ),
            })),
          };
        },
      );

      // Optimistic update for single post
      if (previousPost) {
        queryClient.setQueryData<Post>([POST_QUERY_KEY, postId], {
          ...previousPost,
          userInteraction: {
            ...previousPost.userInteraction,
            isLiked: previousPost.userInteraction?.isLiked ?? previousPost.liked,
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
