package com.dengin.social.application.dto;

import java.time.Instant;

/**
 * DTO representing a comment on a post.
 * 
 * <p>Includes commenter details for efficient display without additional queries.
 */
public record CommentDto(
    String commentId,
    String postId,
    UserBasicDto commenter,
    String content,
    Instant createdAt
) {
}
