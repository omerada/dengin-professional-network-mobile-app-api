// src/features/feed/hooks/useComments.ts
// Comments hook'ları
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { feedService } from '../services';
import { POST_QUERY_KEY } from './usePost';
import type { CommentsResponse, Comment, CreateCommentDto, Post } from '../types';

/**
 * Query keys
 */
export const COMMENTS_QUERY_KEY = 'comments';

/**
 * Comments hook - infinite scroll
 */
export function useComments(postId: string) {
  return useInfiniteQuery<CommentsResponse, Error>({
    queryKey: [COMMENTS_QUERY_KEY, postId],
    queryFn: async ({ pageParam }) => {
      return feedService.getComments(postId, pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 dakika
  });
}

/**
 * Comments data helper
 */
export function useCommentsData(postId: string) {
  const { data, ...rest } = useComments(postId);

  const comments = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.pagination.totalCount ?? 0;

  return {
    comments,
    totalCount,
    ...rest,
  };
}

/**
 * Add comment hook
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, CreateCommentDto>({
    mutationFn: (dto) => feedService.addComment(dto),

    onSuccess: (newComment, variables) => {
      // Update comments cache
      queryClient.setQueryData<InfiniteData<CommentsResponse>>(
        [COMMENTS_QUERY_KEY, variables.postId],
        (old) => {
          if (!old) return old;

          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              data: [newComment, ...newPages[0].data],
            };
          }

          return { ...old, pages: newPages };
        }
      );

      // Update post comment count
      queryClient.setQueryData<Post>(
        [POST_QUERY_KEY, variables.postId],
        (old) => {
          if (!old) return old;
          return { ...old, commentsCount: old.commentsCount + 1 };
        }
      );

      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: [COMMENTS_QUERY_KEY, variables.postId] });
    },
  });
}

/**
 * Delete comment hook
 */
export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (commentId) => feedService.deleteComment(commentId),

    onSuccess: (_, commentId) => {
      // Remove from cache
      queryClient.setQueryData<InfiniteData<CommentsResponse>>(
        [COMMENTS_QUERY_KEY, postId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((comment) => comment.id !== commentId),
            })),
          };
        }
      );

      // Update post comment count
      queryClient.setQueryData<Post>(
        [POST_QUERY_KEY, postId],
        (old) => {
          if (!old) return old;
          return { ...old, commentsCount: Math.max(0, old.commentsCount - 1) };
        }
      );
    },
  });
}

/**
 * Like comment hook
 */
export function useLikeComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { commentId: string; isLiked: boolean }>({
    mutationFn: async ({ commentId, isLiked }) => {
      if (!isLiked) {
        await feedService.likeComment(commentId);
      }
      // Unlike not implemented in API
    },

    onMutate: async ({ commentId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: [COMMENTS_QUERY_KEY, postId] });

      queryClient.setQueryData<InfiniteData<CommentsResponse>>(
        [COMMENTS_QUERY_KEY, postId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !isLiked,
                      likesCount: isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
                    }
                  : comment
              ),
            })),
          };
        }
      );
    },
  });
}
