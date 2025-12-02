package com.meslektas.social.application.query;

import com.meslektas.social.domain.model.PostId;

/**
 * Query to retrieve paginated comments for a specific post.
 * 
 * <p>Comments are sorted chronologically (oldest first).
 * Deleted comments are excluded from results.
 */
public record GetPostCommentsQuery(
    PostId postId,
    Long requesterId,
    int page,
    int size
) {
    public GetPostCommentsQuery {
        if (page < 0) {
            throw new IllegalArgumentException("Page number must be >= 0");
        }
        if (size <= 0 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }
    }
}
