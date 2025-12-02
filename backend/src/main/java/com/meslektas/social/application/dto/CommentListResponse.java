package com.meslektas.social.application.dto;

import java.util.List;

/**
 * Paginated response containing comments for a post.
 */
public record CommentListResponse(
    List<CommentDto> comments,
    long totalCount,
    int pageNumber,
    int pageSize
) {
}
