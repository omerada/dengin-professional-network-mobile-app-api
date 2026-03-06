package com.dengin.social.application.dto;

/**
 * Response DTO for comment like operations.
 * 
 * @param commentId The UUID of the comment
 * @param isLiked Whether the comment is now liked by the user
 * @param likeCount The updated total like count for the comment
 */
public record CommentLikeResponse(
    String commentId,
    boolean isLiked,
    int likeCount
) {}
