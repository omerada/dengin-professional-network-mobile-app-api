// src/features/feed/hooks/useComments.ts
// Comments hook'ları - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedService } from '../services';
import { POST_QUERY_KEY } from './usePost';
import type { CommentListResponse, Comment, AddCommentRequest, Post } from '../types';

/**
 * Query keys
 */
export const COMMENTS_QUERY_KEY = 'comments';

/**
 * Comments hook - page-based infinite scroll
 * Backend API: GET /api/posts/{postId}/comments?page=0&size=20
 */
export function useComments(postId: number | undefined, pageSize = 20) {
  return useInfiniteQuery<CommentListResponse, Error>({
    queryKey: [COMMENTS_QUERY_KEY, postId],
    queryFn: async ({ pageParam = 0 }) => {
      return feedService.getComments(postId!, pageParam as number, pageSize);
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: postId !== undefined && postId > 0,
    staleTime: 1 * 60 * 1000, // 1 dakika
  });
}

/**
 * Comments data helper
 */
export function useCommentsData(postId: number | undefined) {
  const { data, ...rest } = useComments(postId);

  const comments = data?.pages.flatMap(page => page.comments) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? 0;

  return {
    comments,
    totalCount,
    ...rest,
  };
}

/**
 * Add comment hook
 * Backend API: POST /api/posts/{postId}/comments
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, { postId: number; request: AddCommentRequest }>({
    mutationFn: ({ postId, request }) => feedService.addComment(postId, request),

    onSuccess: (newComment, { postId }) => {
      // Update comments cache - add to first page
      queryClient.setQueryData<InfiniteData<CommentListResponse>>(
        [COMMENTS_QUERY_KEY, postId],
        old => {
          if (!old) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              comments: [newComment, ...newPages[0].comments],
              totalElements: newPages[0].totalElements + 1,
            };
          }

          return { ...old, pages: newPages };
        },
      );

      // Update post comment count
      queryClient.setQueryData<Post>([POST_QUERY_KEY, postId], old => {
        if (!old) return old;
        return {
          ...old,
          commentCount: old.commentCount + 1,
        };
      });

      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, postId] });
    },
  });
}

/**
 * Delete comment hook
 * Backend API: DELETE /api/posts/{postId}/comments/{commentId}
 */
export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: commentId => feedService.deleteComment(postId, commentId),

    onSuccess: (_, commentId) => {
      // Remove from cache
      queryClient.setQueryData<InfiniteData<CommentListResponse>>(
        [COMMENTS_QUERY_KEY, postId],
        old => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              comments: page.comments.filter(comment => comment.id !== commentId),
              totalElements: page.totalElements - 1,
            })),
          };
        },
      );

      // Update post comment count
      queryClient.setQueryData<Post>([POST_QUERY_KEY, postId], old => {
        if (!old) return old;
        return {
          ...old,
          commentCount: Math.max(0, old.commentCount - 1),
        };
      });
    },
  });
}

/**
 * Like comment hook
 * Backend API: POST /api/posts/{postId}/comments/{commentId}/like
 */
export function useLikeComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { commentId: string; isLiked: boolean }>({
    mutationFn: async ({ commentId, isLiked }) => {
      if (isLiked) {
        // Unlike - not yet implemented in API
        // await feedService.unlikeComment(postId, commentId);
      } else {
        await feedService.likeComment(postId, commentId);
      }
    },

    onMutate: async ({ commentId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: [COMMENTS_QUERY_KEY, postId] });

      queryClient.setQueryData<InfiniteData<CommentListResponse>>(
        [COMMENTS_QUERY_KEY, postId],
        old => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              comments: page.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !isLiked,
                      likeCount: isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
                    }
                  : comment,
              ),
            })),
          };
        },
      );
    },
  });
}
