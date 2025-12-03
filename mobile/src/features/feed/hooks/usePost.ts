// src/features/feed/hooks/usePost.ts
// Post detay hook'u
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
 */
export function usePost(postId: string) {
  return useQuery<Post, Error>({
    queryKey: [POST_QUERY_KEY, postId],
    queryFn: () => feedService.getPost(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}

export default usePost;
