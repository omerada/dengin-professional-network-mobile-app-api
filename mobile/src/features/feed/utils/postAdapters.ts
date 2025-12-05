// src/features/feed/utils/postAdapters.ts
// Post ve Author veri dönüşüm utility fonksiyonları
// Backend FeedPostResponse ile Mobile Post tipi arasında uyumluluk sağlar

import type { Post, PostAuthor, PostImageDto, PostStats, UserInteraction } from '../types';

/**
 * PostAuthor'dan avatar URL'ini al
 * Backend profileImageUrl, Mobile avatarUrl kullanıyor
 */
export function getAuthorAvatarUrl(author: PostAuthor): string | undefined {
  return author.profileImageUrl || author.avatarUrl;
}

/**
 * PostAuthor'dan user ID'yi al
 * Backend userId, Mobile id kullanıyor
 */
export function getAuthorId(author: PostAuthor): number {
  return author.userId ?? author.id ?? 0;
}

/**
 * PostAuthor verified durumunu al
 * Backend verified, Mobile isVerified kullanıyor
 */
export function isAuthorVerified(author: PostAuthor): boolean {
  return author.verified ?? author.isVerified ?? false;
}

/**
 * Post'tan ID al (Long format - API çağrıları için)
 * Backend hem id (Long) hem postId (UUID) döndürüyor
 * API çağrılarında Long id kullanılmalı
 */
export function getPostId(post: Post): number {
  return post.id;
}

/**
 * Post'tan UUID al (referans için)
 */
export function getPostUuid(post: Post): string | undefined {
  return post.postId;
}

/**
 * Post'tan like count al
 * Yeni format flat, eski format stats içinde
 */
export function getLikeCount(post: Post): number {
  return post.likeCount ?? post.stats?.likeCount ?? 0;
}

/**
 * Post'tan comment count al
 */
export function getCommentCount(post: Post): number {
  return post.commentCount ?? post.stats?.commentCount ?? 0;
}

/**
 * Post'un liked durumunu al
 * Yeni format flat, eski format userInteraction içinde
 */
export function isPostLiked(post: Post): boolean {
  return post.liked ?? post.userInteraction?.isLiked ?? false;
}

/**
 * Post'un saved durumunu al
 */
export function isPostSaved(post: Post): boolean {
  return post.userInteraction?.isSaved ?? false;
}

/**
 * Post images'tan URL listesi al
 * Yeni format PostImageDto[], eski format string[]
 */
export function getImageUrls(post: Post): string[] {
  if (!post.images || post.images.length === 0) {
    return [];
  }

  // Eğer images PostImageDto[] ise url'leri çıkar
  if (typeof post.images[0] === 'object' && 'url' in post.images[0]) {
    return (post.images as PostImageDto[]).map(img => img.url);
  }

  // Eğer images string[] ise (legacy) doğrudan döndür
  return post.images as unknown as string[];
}

/**
 * Post images'tan thumbnail URL listesi al
 */
export function getThumbnailUrls(post: Post): string[] {
  if (!post.images || post.images.length === 0) {
    return [];
  }

  if (typeof post.images[0] === 'object' && 'url' in post.images[0]) {
    return (post.images as PostImageDto[]).map(img => img.thumbnailUrl || img.url);
  }

  return post.images as unknown as string[];
}

/**
 * İlk görsel URL'ini al (preview için)
 */
export function getPreviewImageUrl(post: Post): string | null {
  const urls = getImageUrls(post);
  return urls.length > 0 ? urls[0] : null;
}

/**
 * Post'u legacy format'a dönüştür (backward compatibility)
 * Eski componentler için
 */
export function toLegacyPost(
  post: Post,
): Post & { stats: PostStats; userInteraction: UserInteraction } {
  return {
    ...post,
    stats: {
      likeCount: getLikeCount(post),
      commentCount: getCommentCount(post),
      viewCount: 0,
    },
    userInteraction: {
      isLiked: isPostLiked(post),
      isSaved: isPostSaved(post),
    },
  };
}

/**
 * PostAuthor'u normalize et (backend ve mobile formatları birleştir)
 */
export function normalizeAuthor(author: PostAuthor): PostAuthor {
  return {
    userId: getAuthorId(author),
    id: getAuthorId(author),
    name: author.name,
    surname: author.surname,
    fullName: author.fullName || `${author.name} ${author.surname}`.trim(),
    profileImageUrl: getAuthorAvatarUrl(author),
    avatarUrl: getAuthorAvatarUrl(author),
    professionId: author.professionId,
    professionName: author.professionName,
    verified: isAuthorVerified(author),
    isVerified: isAuthorVerified(author),
    profession: author.professionName || author.profession,
  };
}
