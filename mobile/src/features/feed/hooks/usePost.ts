// src/features/feed/hooks/usePost.ts
// Post detay hook'u - Backend API uyumlu
// Oku: mobile-development-guide/sprints/25-SPRINT-5-6.md

import { useQuery } from '@tanstack/react-query';
import { feedService } from '../services';
import type { Post } from '../types';

/**
 * Query key
 */
export const POST_QUERY_KEY = 'post';

/**
 * Post detay hook'u
 * Backend API: GET /api/posts/{postId}
 * 
 * @param postId - Post ID (number olarak backend'e gönderilir)
 */
export function usePost(postId: number | undefined) {
  return useQuery<Post, Error>({
    queryKey: [POST_QUERY_KEY, postId],
    queryFn: () => feedService.getPost(postId!),
    enabled: postId !== undefined && postId > 0,
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 2,
  });
}

export default usePost;
